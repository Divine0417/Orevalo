import { describe, expect, it, vi } from 'vitest'
import {
  extractMyJobMagListing,
  extractAfterSchoolAfricaScholarship,
  extractOpportunityDeskListing,
  extractScholars4DevScholarships,
  inferField,
  inferLocation,
  opportunityDeskFeedEntries,
  preferredApplyUrl,
  scrapeSource,
} from './scrape-opportunities.mjs'

describe('Opportunity source extraction', () => {
  it('extracts AfterSchoolAfrica scholarships for Africans with official apply links', () => {
    const applyUrl = 'https://jobs.mercedes-benz.com/south-africa-bursary'
    const record = extractAfterSchoolAfricaScholarship({
      id: 122870,
      link: 'https://www.afterschoolafrica.com/122870/mercedes-benz-bursary/',
      title: { rendered: 'Mercedes-Benz South Africa Bursary Programme 2027' },
      excerpt: { rendered: '<p>Deadline: 12 November 2026</p>' },
      categories: [13, 110, 109],
      content: {
        rendered: `<p><strong>Application Deadline:</strong> 12 November 2026<br>
          <strong>To be taken at (country):</strong> South Africa</p>
          <p>${'Long program details. '.repeat(250)}</p>
          <p><strong>Level of Study:</strong> undergraduate</p>
          <h2>Eligibility</h2><ul><li>Applicants must be South African-born citizens.</li></ul>
          <h2>How to Apply</h2>
          <p><strong>Award Provider:</strong> Mercedes-Benz South Africa Ltd</p>
          <a href="${applyUrl}">Visit the official scholarship page for details</a>`,
      },
    })

    expect(record).toMatchObject({
      name: 'Mercedes-Benz South Africa Bursary Programme 2027',
      funder: 'Mercedes-Benz South Africa Ltd',
      country: 'South Africa',
      degree_level: 'Undergraduate',
      deadline: '2026-11-12',
      eligibility: 'Applicants must be South African-born citizens.',
      apply_url: applyUrl,
    })
    expect(record.requirements).toContainEqual({
      label: 'Study location',
      detail: 'South Africa',
    })
  })

  it('does not include AfterSchoolAfrica posts outside African-applicant scholarship categories', () => {
    const record = extractAfterSchoolAfricaScholarship({
      id: 123,
      link: 'https://www.afterschoolafrica.com/example/',
      title: { rendered: 'Example International Scholarship' },
      categories: [13],
      content: { rendered: '<p>Award Provider: Example University</p>' },
    })

    expect(record).toBeNull()
  })

  it('runs the AfterSchoolAfrica WordPress API through to a validated dry-run record', async () => {
    const apiUrl = 'https://www.afterschoolafrica.com/wp-json/wp/v2/posts?categories=110%2C98&per_page=25&_fields=id,link,title,excerpt,categories'
    const detailUrl = 'https://www.afterschoolafrica.com/wp-json/wp/v2/posts/123?_fields=id,link,title,content,excerpt,categories'
    const originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn(async (url) => new Response(
      String(url) === apiUrl
        ? JSON.stringify([{
          id: 123,
          link: 'https://www.afterschoolafrica.com/123/example-scholarship/',
          title: { rendered: 'Example African Masters Scholarship' },
          excerpt: { rendered: '<p>Deadline: 15 December 2026</p>' },
          categories: [13, 110],
        }])
        : String(url) === detailUrl
          ? JSON.stringify({
            id: 123,
            link: 'https://www.afterschoolafrica.com/123/example-scholarship/',
            title: { rendered: 'Example African Masters Scholarship' },
            excerpt: { rendered: '<p>Deadline: 15 December 2026</p>' },
            categories: [13, 110],
            content: {
              rendered: '<p>Award Provider: Example University</p><p>Masters degree for African students.</p><a href="https://example.edu/apply">Apply now</a>',
            },
          })
          : '',
      { status: 200 },
    ))

    try {
      const summary = await scrapeSource({
        sourceUrl: apiUrl,
        kind: 'scholarship',
        sourceName: 'AfterSchoolAfrica',
        dryRun: true,
      })
      expect(summary).toMatchObject({ extracted: 1, valid: 1, dryRun: true })
      expect(globalThis.fetch).toHaveBeenCalledTimes(2)
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('runs the Opportunity Desk feed through to a validated dry-run record', async () => {
    const feedUrl = 'https://opportunitydesk.org/category/jobs-and-internships/internships/feed/'
    const detailUrl = 'https://opportunitydesk.org/example-internship/'
    const originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn(async (url) => new Response(
      String(url) === feedUrl
        ? `<rss><item>
            <title>Example Institute Internship 2027</title>
            <link>${detailUrl}</link>
            <description><![CDATA[Deadline: October 31, 2026]]></description>
            <category><![CDATA[Internships]]></category>
            <category><![CDATA[Africa]]></category>
          </item></rss>`
        : `<div class="entry-content">
            <p>Deadline: October 31, 2026</p>
            <a href="https://apply.example/form">Click here to apply</a>
          </div>`,
      { status: 200 },
    ))

    try {
      const summary = await scrapeSource({
        sourceUrl: feedUrl,
        kind: 'listing',
        sourceName: 'Opportunity Desk',
        dryRun: true,
      })
      expect(summary).toMatchObject({ extracted: 1, valid: 1, dryRun: true })
      expect(globalThis.fetch).toHaveBeenCalledTimes(2)
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('extracts Chalmers scholarship details and selects its institution application guidance', async () => {
    const indexUrl = 'https://www.scholars4dev.com/'
    const detailUrl = 'https://www.scholars4dev.com/2026/10/21/chalmers-ipoet-scholarships-for-international-students/'
    const applicationUrl = 'https://www.chalmers.se/en/education/application-and-admission/scholarships-for-fee-paying-students/how-to-apply-for-a-scholarship/'
    const originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn(async (url) => new Response(
      String(url) === detailUrl
        ? `<a href="https://www.facebook.com/sharer.php">Share</a>
            <h2>Chalmers IPOET Scholarships for International Students</h2>
            <p><em>Chalmers University of Technology</em></p>
            <p>Masters Degree</p>
            <p>Deadline: 15 Jan 2027</p>
            <p>Study in: Sweden</p>
            <p style="color: #003366;"><strong>Eligibility:</strong></p>
            <p style="padding-left: 30px;"><span>• </span>Citizens from non-EU/EEA countries who are required to pay tuition fees for Swedish university education</p>
            <p style="padding-left: 30px;"><span>• </span>1st year Master&#8217;s Programme applicants</p>
            <p>The selection is based on relative academic excellence.</p>
            <p><strong>To apply:</strong></p>
            <p>Submit a separate scholarship application after applying for a Master&#8217;s programme.</p>
            <a href="${applicationUrl}">how to apply page</a>
            <a href="https://www.chalmers.se/en/education/application-and-admission/scholarships-for-fee-paying-students/">scholarships for fee-paying students</a>`
        : '',
      { status: 200 },
    ))

    try {
      const records = await extractScholars4DevScholarships(
        `<h2><a href="${detailUrl}">Chalmers IPOET Scholarships for International Students</a></h2>
          <p><em>Chalmers University of Technology</em> Masters Degree</p>
          <p>Deadline: 15 Jan 2027</p><p>Study in: Sweden</p>`,
        indexUrl,
      )
      expect(records).toHaveLength(1)
      expect(records[0]).toMatchObject({
        name: 'Chalmers IPOET Scholarships for International Students',
        funder: 'Chalmers University of Technology',
        degree_level: 'Masters',
        deadline: '2027-01-15',
        apply_url: applicationUrl,
      })
      expect(records[0].eligibility).toBe(
        'Citizens from non-EU/EEA countries who are required to pay tuition fees for Swedish university education\n1st year Master’s Programme applicants',
      )
      expect(records[0].requirements).toContainEqual({
        label: 'Nationality',
        detail: 'Citizens from non-EU/EEA countries who are required to pay tuition fees for Swedish university education',
      })
      expect(records[0].requirements).toContainEqual({
        label: 'Degree level',
        detail: '1st year Master’s Programme applicants',
      })
      expect(records[0].eligibility).not.toContain('relative academic excellence')
      expect(records[0].requirements).not.toContainEqual(expect.objectContaining({
        detail: expect.stringContaining('relative academic excellence'),
      }))
      expect(records[0].requirements).toContainEqual({
        label: 'Study location',
        detail: 'Sweden',
      })
      expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('reads titles, detail URLs, and category labels from the RSS feed', () => {
    const entries = opportunityDeskFeedEntries(`
      <rss><channel><item>
        <title>Example Internship 2027</title>
        <link>https://opportunitydesk.org/example-internship/</link>
        <description><![CDATA[Deadline: October 31, 2026]]></description>
        <category><![CDATA[Internships]]></category>
        <category><![CDATA[Africa]]></category>
      </item></channel></rss>
    `)

    expect(entries).toEqual([{
      title: 'Example Internship 2027',
      url: 'https://opportunitydesk.org/example-internship/',
      description: 'Deadline: October 31, 2026',
      categories: ['Internships', 'Africa'],
    }])
  })

  it('prefers structured job details and avoids generic engineering matches', () => {
    const html = `
      <html>
        <head>
          <title>AI Filmmaker at Fatibobo Mini Films Ltd October, 2026 | MyJobMag</title>
        </head>
        <body>
          <script type="application/ld+json">
            {
              "@context": "http://schema.org",
              "@type": "JobPosting",
              "title": "AI Filmmaker",
              "datePosted": "2026-10-01T10:00:54+01:00",
              "validThrough": "2026-10-15T00:00:00+0000",
              "hiringOrganization": {
                "@type": "Organization",
                "name": "Fatibobo Mini Films Ltd"
              },
              "industry": "Creative / Arts",
              "occupationalCategory": "Media Production and Entertainment",
              "jobLocationType": "TELECOMMUTE",
              "jobLocation": {
                "@type": "Place",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "All",
                  "addressRegion": "All",
                  "addressCountry": "NG"
                }
              },
              "description": "&lt;p&gt;We are looking for an experienced AI filmmaker to produce short films using Grok and CapCut.&lt;/p&gt;
                &lt;p&gt;Applicants must currently reside in Nigeria.&lt;/p&gt;"
            }
          </script>
        </body>
      </html>
    `

    const record = extractMyJobMagListing(html, 'https://www.myjobmag.com/job/ai-filmmaker-fatibobo-mini-films-ltd')

    expect(record.title).toBe('AI Filmmaker')
    expect(record.company).toBe('Fatibobo Mini Films Ltd')
    expect(record.location).toBe('Remote')
    expect(record.field).toBe('Technology')
    expect(record.deadline).toBe('2026-10-15')
  })

  describe('Opportunity Desk extraction', () => {
    it('extracts Africa-tagged internships and prefers the direct application link', () => {
      const detailUrl = 'https://opportunitydesk.org/2026/10/19/quality-of-government-institute-internship-2027/'
      const html = `
        <html>
          <title>Quality of Government Institute (QoG) Internship 2027 – Opportunity Desk</title>
          <div class="entry-content">
            <p>Deadline: October 31, 2026</p>
            <p>Applicants from across Africa are welcome to apply.</p>
            <p><a href="https://www.gu.se/en/quality-government">Official website</a></p>
            <p><a href="https://forms.example/apply">Click here to apply</a></p>
          </div>
        </html>
      `
      const entry = {
        title: 'Quality of Government Institute (QoG) Internship 2027',
        description: 'Deadline: October 31, 2026',
        categories: ['Internships', 'Africa'],
      }

      const record = extractOpportunityDeskListing(html, detailUrl, entry)

      expect(record).not.toBeNull()
      expect(record.company).toBe('Quality of Government Institute (QoG)')
      expect(record.location).toBe('Pan-African')
      expect(record.deadline).toBe('2026-10-31')
      expect(record.apply_url).toBe('https://forms.example/apply')
      expect(record.requirements).toContainEqual({
        label: 'Eligible location',
        detail: 'Africa-tagged opportunity; confirm applicant eligibility on the source page.',
      })
    })

    it('does not accept opportunities without an Africa category', () => {
      const record = extractOpportunityDeskListing(
        '<title>Sample Internship</title><p>Deadline: October 31, 2026</p>',
        'https://opportunitydesk.org/sample/',
        {
          title: 'Sample Internship',
          description: 'Deadline: October 31, 2026',
          categories: ['Internships', 'Europe'],
        },
      )

      expect(record).toBeNull()
    })

    it('chooses an institution application link over the source listing and social links', () => {
      const sourceUrl = 'https://www.scholars4dev.com/2026/10/21/chalmers-ipoet-scholarships-for-international-students/'
      const html = `
        <a href="https://www.facebook.com/sharer.php">Share</a>
        <a href="https://www.chalmers.se/en/education/application-and-admission/scholarships-for-fee-paying-students/how-to-apply-for-a-scholarship/">how to apply page</a>
      `

      expect(preferredApplyUrl(html, sourceUrl, sourceUrl)).toBe(
        'https://www.chalmers.se/en/education/application-and-admission/scholarships-for-fee-paying-students/how-to-apply-for-a-scholarship/',
      )
    })
  })

  it('maps real location and field text to the allowed vocabulary', () => {
    expect(inferLocation('Remote — applicants must currently reside in Nigeria')).toBe('Remote')
    expect(inferLocation('Lagos, Nigeria')).toBe('Lagos')
    expect(inferLocation('Abuja, Federal Capital Territory')).toBe('Abuja')
    expect(inferField('AI Filmmaker using Grok and CapCut')).toBe('Technology')
    expect(inferField('Senior Project Manager - Sales & Marketing')).toBe('Business')
    expect(inferField('Finance and Accounts Officer')).toBe('Finance')
  })

  it('ignores the MyJobMag share-widget heading when choosing the job title', () => {
    const html = `
      <html>
        <head>
          <title>AI Filmmaker at Fatibobo Mini Films Ltd October, 2026 | MyJobMag</title>
        </head>
        <body>
          <h3>Send this job to a friend</h3>
          <script type="application/ld+json">
            {
              "@context": "http://schema.org",
              "@type": "JobPosting",
              "title": "AI Filmmaker",
              "datePosted": "2026-10-01T10:00:54+01:00",
              "validThrough": "2026-10-15T00:00:00+0000",
              "hiringOrganization": { "@type": "Organization", "name": "Fatibobo Mini Films Ltd" },
              "industry": "Creative / Arts",
              "occupationalCategory": "Media Production and Entertainment",
              "jobLocationType": "TELECOMMUTE",
              "jobLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressLocality": "All", "addressRegion": "All", "addressCountry": "NG" } },
              "description": "<p>Job Vacancies at Fatibobo Mini Films Ltd for AI Filmmaker in Nigeria. MyJobMag</p>"
            }
          </script>
        </body>
      </html>
    `

    const record = extractMyJobMagListing(html, 'https://www.myjobmag.com/job/ai-filmmaker-fatibobo-mini-films-ltd')

    expect(record.title).toBe('AI Filmmaker')
  })

  it('keeps only job content, extracts requirements, prefers the employer link, and rejects RFPs', () => {
    const html = `
      <html>
        <head>
          <title>Gender Planning Consultant at CODERHI | MyJobMag</title>
          <nav>Engineering Technology Finance Jobs Scholarships</nav>
        </head>
        <body>
          <div id="send-email-job-box"><h3>Send this job to a friend</h3></div>
          <script type="application/ld+json">
            {
              "@context": "http://schema.org",
              "@type": "JobPosting",
              "title": "Gender-Responsive Development Planning Consultant",
              "datePosted": "2026-10-01T10:00:54+01:00",
              "validThrough": "2026-10-15T00:00:00+0000",
              "hiringOrganization": { "@type": "Organization", "name": "CODERHI" },
              "occupationalCategory": "Consultancy",
              "industry": "Social Development",
              "educationRequirements": { "@type": "EducationalOccupationalCredential", "credentialCategory": "Masters degree in urban planning or related field" },
              "experienceRequirements": { "@type": "OccupationalExperienceRequirements", "monthsOfExperience": 60 },
              "applicantLocationRequirements": { "@type": "Country", "name": "Nigeria" },
              "description": "&lt;p&gt;Consultancy call for proposal for gender-responsive development planning.&lt;/p&gt;&lt;h3&gt;Requirements&lt;/h3&gt;&lt;ul&gt;&lt;li&gt;At least five years of relevant experience&lt;/li&gt;&lt;li&gt;Masters degree in planning or a related field&lt;/li&gt;&lt;/ul&gt;"
            }
          </script>
          <a href="/job-application/123">Apply Now</a>
          <a href="https://coderhi.example/apply">Apply on CODERHI website</a>
        </body>
      </html>
    `

    const record = extractMyJobMagListing(html, 'https://www.myjobmag.com/job/coderhi-gender-planning-consultant')

    expect(record).toBeNull()
    const jobHtml = html.replace('Consultancy call for proposal for gender-responsive development planning.', 'This job supports gender-responsive development planning.')
    const jobRecord = extractMyJobMagListing(jobHtml, 'https://www.myjobmag.com/job/coderhi-gender-planning-consultant')

    expect(jobRecord.description).not.toContain('Send this job to a friend')
    expect(jobRecord.description).not.toContain('Engineering Technology Finance Jobs')
    expect(jobRecord.apply_url).toBe('https://coderhi.example/apply')
    expect(jobRecord.requirements).toContainEqual({ label: 'Degree level', detail: 'Masters degree in urban planning or related field' })
    expect(jobRecord.requirements).toContainEqual({ label: 'Experience', detail: '60 months' })
    expect(jobRecord.requirements).toContainEqual({ label: 'Eligible location', detail: 'Nigeria' })
  })

  it('keeps qualification requirements separate from job duties and labels them precisely', () => {
    const html = `
      <script type="application/ld+json">
        {
          "@type": "JobPosting",
          "title": "MEL Officer/Associate",
          "hiringOrganization": { "name": "R-DATS Consulting" },
          "validThrough": "2026-10-23",
          "description": "&lt;h3&gt;Requirements&lt;/h3&gt;&lt;ul&gt;
            &lt;li&gt;Education: Bachelor’s degree or Higher National Diploma in Statistics or Education.&lt;/li&gt;
            &lt;li&gt;Experience: Minimum of 2-3 years of progressive field-level M&amp;E experience in Nigeria.&lt;/li&gt;
            &lt;li&gt;Field Supervision Background: Proven experience training field enumerators is required.&lt;/li&gt;
            &lt;li&gt;Desk &amp; Field Audits: Execute routine field spot-checks.&lt;/li&gt;
            &lt;li&gt;Assessment Toolkit Mastery: Support complete independent tests using citizen-led tools.&lt;/li&gt;
          &lt;/ul&gt;&lt;h3&gt;Job Summary&lt;/h3&gt;&lt;p&gt;The role monitors field operations.&lt;/p&gt;"
        }
      </script>
    `

    const record = extractMyJobMagListing(
      html,
      'https://www.myjobmag.com/job/mel-officer-r-dats-consulting',
    )

    expect(record.requirements).toContainEqual({
      label: 'Degree level',
      detail: 'Education: Bachelor’s degree or Higher National Diploma in Statistics or Education.',
    })
    expect(record.requirements).toContainEqual({
      label: 'Experience',
      detail: 'Experience: Minimum of 2-3 years of progressive field-level M&E experience in Nigeria.',
    })
    expect(record.requirements).toContainEqual({
      label: 'Experience',
      detail: 'Field Supervision Background: Proven experience training field enumerators is required.',
    })
    expect(record.requirements).toHaveLength(3)
  })

  it('recognizes safety roles without misclassifying them as healthcare and keeps criteria, not duties', () => {
    const html = `
      <script type="application/ld+json">
        {
          "@type": "JobPosting",
          "title": "Basic Safety Officers",
          "hiringOrganization": { "name": "Taela HR Advisory" },
          "validThrough": "2026-10-25",
          "educationRequirements": "Associate degree",
          "experienceRequirements": { "@type": "OccupationalExperienceRequirements", "monthsOfExperience": 12 },
          "description": "&lt;h3&gt;Key Responsibilities&lt;/h3&gt;&lt;ul&gt;
            &lt;li&gt;Monitor project sites to ensure compliance with safety procedures.&lt;/li&gt;
            &lt;li&gt;Identify workplace hazards and report unsafe conditions.&lt;/li&gt;
          &lt;/ul&gt;&lt;h3&gt;Requirements&lt;/h3&gt;&lt;ul&gt;
            &lt;li&gt;OND, HND or BSc in Occupational Health and Safety, Environmental Science, Engineering or a related discipline.&lt;/li&gt;
            &lt;li&gt;Relevant basic safety training or certification will be an added advantage.&lt;/li&gt;
            &lt;li&gt;Previous experience in site safety or construction is desirable.&lt;/li&gt;
            &lt;li&gt;Good knowledge of workplace health and safety practices.&lt;/li&gt;
            &lt;li&gt;Strong observation, communication and reporting skills.&lt;/li&gt;
            &lt;li&gt;Ability to work effectively on-site and follow safety procedures.&lt;/li&gt;
            &lt;li&gt;Willingness to work on a project-based assignment in Lagos, Abuja or Enugu.&lt;/li&gt;
          &lt;/ul&gt;"
        }
      </script>
    `

    const record = extractMyJobMagListing(
      html,
      'https://www.myjobmag.com/job/basic-safety-officers-taela-hr-advisory',
    )

    expect(record.field).toBe('Engineering')
    expect(record.requirements).toContainEqual({ label: 'Degree level', detail: 'Associate degree' })
    expect(record.requirements).toContainEqual({ label: 'Experience', detail: '12 months' })
    expect(record.requirements).toContainEqual({
      label: 'Degree level',
      detail: 'OND, HND or BSc in Occupational Health and Safety, Environmental Science, Engineering or a related discipline.',
    })
    expect(record.requirements).toContainEqual({
      label: 'Eligible location',
      detail: 'Willingness to work on a project-based assignment in Lagos, Abuja or Enugu.',
    })
    expect(record.requirements.some(({ detail }) => detail.startsWith('Monitor project sites'))).toBe(false)
    expect(record.requirements.some(({ detail }) => detail.startsWith('Identify workplace hazards'))).toBe(false)
  })
})

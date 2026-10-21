import { describe, expect, it, vi } from 'vitest'
import {
  extractMyJobMagListing,
  extractOpportunityDeskListing,
  inferField,
  inferLocation,
  opportunityDeskFeedEntries,
  preferredApplyUrl,
  scrapeSource,
} from './scrape-opportunities.mjs'

describe('Opportunity source extraction', () => {
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
})

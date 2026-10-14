import { describe, expect, it } from 'vitest'
import { extractMyJobMagListing, inferField, inferLocation } from './scrape-opportunities.mjs'

describe('MyJobMag extraction', () => {
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

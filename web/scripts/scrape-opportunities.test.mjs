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
              "description": "&lt;p&gt;We are looking for an experienced AI filmmaker to produce short films using Grok and CapCut.&lt;/p&gt;"
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
})

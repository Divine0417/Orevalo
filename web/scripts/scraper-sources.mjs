export const SCRAPER_SOURCES = [
  {
    id: 'myjobmag-jobs',
    name: 'MyJobMag Nigeria',
    kind: 'listing',
    url: 'https://www.myjobmag.com/jobs',
    enabled: true,
    notes: 'Static public jobs page. Review source terms and keep request frequency low.',
  },
  {
    id: 'scholars4dev-scholarships',
    name: 'Scholars4Dev',
    kind: 'scholarship',
    url: 'https://www.scholars4dev.com/',
    enabled: true,
    notes: 'Static public scholarship index. Detail-page verification is still required.',
  },
  {
    id: 'jobberman-jobs',
    name: 'Jobberman',
    kind: 'listing',
    url: 'https://www.jobberman.com/jobs',
    enabled: false,
    notes: 'Disabled because the page currently redirects to a tracking endpoint; audit before enabling.',
  },
]

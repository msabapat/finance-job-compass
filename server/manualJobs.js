// Bulge-bracket banks run custom career portals with no public job-search API
// (confirmed for Goldman Sachs and JPMorgan — see README), so they can't be
// auto-refreshed like the Greenhouse/Lever firms in companies.js. This is a
// small hand-maintained list instead. Entries point at each bank's official
// campus-recruiting hub rather than a single job posting, since bulge-bracket
// analyst postings rotate/expire quickly and a hub link stays valid longest.
//
// These do NOT get an hourly live refresh — update posted_at / delete entries
// by hand as programs open and close for the cycle.

export const manualJobs = [
  {
    id: 'manual:goldman-sachs-analyst',
    company: 'Goldman Sachs',
    tier: 'Bulge Bracket',
    division: 'Investment Banking',
    title: 'Investment Banking New Analyst Program',
    location: 'New York, NY (+ other locations)',
    cityGroup: 'New York',
    url: 'https://higher.gs.com/results',
  },
  {
    id: 'manual:jpmorgan-analyst',
    company: 'J.P. Morgan',
    tier: 'Bulge Bracket',
    division: 'Investment Banking',
    title: 'Investment Banking Full-Time Analyst Program',
    location: 'New York, NY (+ other locations)',
    cityGroup: 'New York',
    url: 'https://careers.jpmorgan.com/us/en/students/programs',
  },
  {
    id: 'manual:morgan-stanley-analyst',
    company: 'Morgan Stanley',
    tier: 'Bulge Bracket',
    division: 'Investment Banking',
    title: 'Investment Banking Division Analyst Program',
    location: 'New York, NY (+ other locations)',
    cityGroup: 'New York',
    url: 'https://www.morganstanley.com/people-opportunities/students-graduates',
  },
  {
    id: 'manual:bofa-analyst',
    company: 'Bank of America',
    tier: 'Bulge Bracket',
    division: 'Investment Banking',
    title: 'Global Investment Banking Analyst Program',
    location: 'New York, NY (+ other locations)',
    cityGroup: 'New York',
    url: 'https://campus.bofa.com/',
  },
  {
    id: 'manual:citi-analyst',
    company: 'Citi',
    tier: 'Bulge Bracket',
    division: 'Investment Banking',
    title: 'Banking, Capital Markets & Advisory Analyst Program',
    location: 'New York, NY (+ other locations)',
    cityGroup: 'New York',
    url: 'https://jobs.citi.com/students-and-graduates',
  },
];

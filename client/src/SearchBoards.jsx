import { useMemo, useState } from 'react';

const PROGRAM_TYPES = [
  { key: 'summer2027', label: 'Summer 2027 Internship', queryText: 'summer 2027 internship' },
  { key: 'summer2028', label: 'Summer 2028 Internship', queryText: 'summer 2028 internship' },
  { key: 'fulltime', label: 'Full-Time Entry Level', queryText: 'entry level full time' },
];

const JOB_TYPES = [
  { key: 'ib', label: 'Investment Banking', queryText: 'investment banking analyst' },
  { key: 'st', label: 'Sales & Trading', queryText: 'sales trading analyst' },
  { key: 'research', label: 'Equity Research', queryText: 'equity research analyst' },
  { key: 'corpfin', label: 'Corporate Finance', queryText: 'corporate finance analyst' },
  { key: 'financialanalyst', label: 'Financial Analyst', queryText: 'financial analyst' },
  { key: 'realestate', label: 'Real Estate', queryText: 'real estate analyst' },
  { key: 'privateequity', label: 'Private Equity', queryText: 'private equity analyst' },
  { key: 'capitalmarkets', label: 'Capital Markets', queryText: 'capital markets analyst' },
  { key: 'investmentmanagement', label: 'Investment Management', queryText: 'investment management analyst' },
  { key: 'fixedincome', label: 'Fixed Income', queryText: 'fixed income analyst' },
  { key: 'derivatives', label: 'Derivatives', queryText: 'derivatives analyst' },
  { key: 'venturecapital', label: 'Venture Capital', queryText: 'venture capital analyst' },
];

function buildSites(query, location) {
  const q = encodeURIComponent(query);
  const hasLoc = location && location !== 'All Cities';
  const loc = hasLoc ? encodeURIComponent(location) : '';
  return [
    {
      name: 'LinkedIn',
      description: 'Largest general job board; strong for both boutique and bulge-bracket postings.',
      url: `https://www.linkedin.com/jobs/search/?keywords=${q}${hasLoc ? `&location=${loc}` : ''}`,
    },
    {
      name: 'Indeed',
      description: "Broadest coverage, including smaller firms' own postings.",
      url: `https://www.indeed.com/jobs?q=${q}${hasLoc ? `&l=${loc}` : ''}`,
    },
    {
      name: 'Glassdoor',
      description: 'Job listings paired with salary and interview data for the firm.',
      url: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${q}${hasLoc ? `&locKeyword=${loc}` : ''}`,
    },
    {
      name: 'Handshake',
      description: 'Campus recruiting platform — strongest for new-grad and internship pipelines (school login required).',
      url: `https://app.joinhandshake.com/job-search?keywords=${q}`,
    },
    {
      name: 'Wall Street Oasis',
      description: 'Finance-specific board run by the WSO community; skews toward IB/PE/HF roles.',
      url: `https://www.wallstreetoasis.com/jobs?search=${q}`,
    },
    {
      name: 'Built In',
      description: 'Tech-and-fintech-leaning board, useful for the Fintech / Startups track.',
      url: `https://builtin.com/jobs?search=${q}${hasLoc ? `&city=${loc}` : ''}`,
    },
    {
      name: 'Monster',
      description: 'Long-running general job board, decent secondary coverage.',
      url: `https://www.monster.com/jobs/search?q=${q.replace(/%20/g, '-')}${hasLoc ? `&where=${loc}` : ''}`,
    },
  ];
}

export default function SearchBoards({ cities }) {
  const [program, setProgram] = useState(PROGRAM_TYPES[0].key);
  const [jobType, setJobType] = useState(JOB_TYPES[0].key);
  const [location, setLocation] = useState('All Cities');

  const query = useMemo(() => {
    const jt = JOB_TYPES.find((j) => j.key === jobType);
    const pt = PROGRAM_TYPES.find((p) => p.key === program);
    return `${jt.queryText} ${pt.queryText}`;
  }, [jobType, program]);

  const sites = useMemo(() => buildSites(query, location), [query, location]);

  return (
    <div className="search-boards">
      <div className="search-banner">
        <h2>Live Job Board Searches</h2>
        <p>
          Pick a program type, role, and (optionally) a location — each card below opens a
          live search on that site with your filters already applied.
        </p>
      </div>

      <div className="search-controls">
        <div>
          <span className="search-control-label">Program</span>
          <div className="filter-row">
            {PROGRAM_TYPES.map((p) => (
              <button
                key={p.key}
                className={`chip ${program === p.key ? 'chip-active' : ''}`}
                onClick={() => setProgram(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="search-control-label">Job Type</span>
          <div className="filter-row">
            {JOB_TYPES.map((j) => (
              <button
                key={j.key}
                className={`chip ${jobType === j.key ? 'chip-active' : ''}`}
                onClick={() => setJobType(j.key)}
              >
                {j.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="search-control-label">Location</span>
          <div className="filter-row">
            {cities.map((c) => (
              <button
                key={c}
                className={`chip ${location === c ? 'chip-active' : ''}`}
                onClick={() => setLocation(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="site-grid">
        {sites.map((s) => (
          <a key={s.name} className="site-card" href={s.url} target="_blank" rel="noreferrer">
            <div className="site-card-head">
              <span className="site-name">{s.name}</span>
              <span className="site-arrow">↗</span>
            </div>
            <p className="site-desc">{s.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

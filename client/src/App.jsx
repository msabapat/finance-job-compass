import { useEffect, useMemo, useState } from 'react';
import './App.css';

const DIVISION_TABS = ['All', 'Investment Banking', 'Sales & Trading', 'Research'];
const TIERS = ['All Tiers', 'Bulge Bracket', 'Elite Boutique', 'Middle Market', 'Regional Boutique', 'Asset Manager', 'Fintech / Startup'];
const CITIES = [
  'All Cities', 'New York', 'Philadelphia', 'Chicago', 'Boston', 'San Francisco', 'Los Angeles',
  'Washington DC', 'Miami / Florida', 'Denver / Colorado', 'North Carolina', 'Texas', 'International', 'Other US',
];
const SIDEBAR_CATEGORIES = [
  'Investment Banking', 'AM / PE / VC', 'Corp Fin / Insurance / Banking', 'Fintech / Startups',
];

const YEARS = ['All Years', '2026', '2027', '2028'];

function externalSearchLinks(division) {
  const query = division === 'All' ? 'investment banking analyst' : `${division.toLowerCase()} analyst`;
  const q = encodeURIComponent(query);
  return [
    { label: 'LinkedIn', url: `https://www.linkedin.com/jobs/search/?keywords=${q}` },
    { label: 'Indeed', url: `https://www.indeed.com/jobs?q=${q}` },
    { label: 'Monster', url: `https://www.monster.com/jobs/search?q=${q.replace(/%20/g, '-')}` },
  ];
}

function tierLabel(tier) {
  return tier.replace(/ /g, ' ').toUpperCase();
}

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [division, setDivision] = useState('All');
  const [tier, setTier] = useState('All Tiers');
  const [city, setCity] = useState('All Cities');
  const [year, setYear] = useState('All Years');
  const [sidebarFilter, setSidebarFilter] = useState(null);
  const [saved, setSaved] = useState(() => new Set());

  useEffect(() => {
    fetch('/api/jobs')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => setJobs(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c = Object.fromEntries(SIDEBAR_CATEGORIES.map((k) => [k, 0]));
    for (const j of jobs) if (c[j.division] !== undefined) c[j.division]++;
    return c;
  }, [jobs]);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (sidebarFilter && j.division !== sidebarFilter) return false;
      if (!sidebarFilter && division !== 'All' && j.division !== division) return false;
      if (tier !== 'All Tiers' && j.tier !== tier) return false;
      if (city !== 'All Cities' && j.cityGroup !== city) return false;
      if (year !== 'All Years' && !j.title.includes(year)) return false;
      return true;
    });
  }, [jobs, division, tier, city, year, sidebarFilter]);

  function toggleSaved(id) {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const showingSaved = sidebarFilter === '__saved__';
  const list = showingSaved ? jobs.filter((j) => saved.has(j.id)) : filtered;

  return (
    <div className="page">
      <header className="topbar">
        <h1>Finance Job Compass</h1>
        <p className="subtitle">Live entry-level finance openings, pulled straight from company career boards.</p>
      </header>

      <div className="layout">
        <aside className="sidebar">
          {SIDEBAR_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`sidebar-item ${sidebarFilter === cat ? 'active' : ''}`}
              onClick={() => setSidebarFilter(sidebarFilter === cat ? null : cat)}
            >
              <span>{cat}</span>
              <span className="count">{counts[cat] ?? 0}</span>
            </button>
          ))}
          <button
            className={`sidebar-item ${showingSaved ? 'active' : ''}`}
            onClick={() => setSidebarFilter(showingSaved ? null : '__saved__')}
          >
            <span>Saved</span>
            <span className="count">{saved.size}</span>
          </button>
        </aside>

        <main className="content">
          <div className="filter-row">
            {DIVISION_TABS.map((d) => (
              <button
                key={d}
                className={`chip ${division === d && !sidebarFilter ? 'chip-active' : ''}`}
                onClick={() => { setDivision(d); setSidebarFilter(null); }}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="filter-row">
            {TIERS.map((t) => (
              <button key={t} className={`chip ${tier === t ? 'chip-active' : ''}`} onClick={() => setTier(t)}>
                {t}
              </button>
            ))}
          </div>
          <div className="filter-row">
            {CITIES.map((c) => (
              <button key={c} className={`chip ${city === c ? 'chip-active' : ''}`} onClick={() => setCity(c)}>
                {c}
              </button>
            ))}
          </div>
          <div className="filter-row">
            {YEARS.map((y) => (
              <button key={y} className={`chip ${year === y ? 'chip-active' : ''}`} onClick={() => setYear(y)}>
                {y}
              </button>
            ))}
          </div>
          {year !== 'All Years' && (
            <p className="hint">Showing jobs whose title mentions {year}. Postings that don't name a class year (most experienced-hire and rolling roles) aren't included here.</p>
          )}

          <div className="external-links">
            <span className="external-label">Search more on:</span>
            {externalSearchLinks(sidebarFilter && sidebarFilter !== '__saved__' ? sidebarFilter : division).map((l) => (
              <a key={l.label} className="external-link" href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>
            ))}
          </div>

          {loading && <p className="status">Loading jobs…</p>}
          {error && <p className="status error">Couldn't load jobs: {error}</p>}
          {!loading && !error && list.length === 0 && (
            <p className="status">No jobs match these filters yet.</p>
          )}

          <div className="grid">
            {list.map((job) => (
              <article key={job.id} className="card">
                <div className="card-head">
                  <div className="logo">{job.company.slice(0, 2).toUpperCase()}</div>
                  <button className={`save ${saved.has(job.id) ? 'saved' : ''}`} onClick={() => toggleSaved(job.id)}>
                    {saved.has(job.id) ? '★' : '☆'}
                  </button>
                </div>
                <h3>{job.title}</h3>
                <p className="company">{job.company}</p>
                <div className="tags">
                  <span className="tag">{tierLabel(job.tier)}</span>
                  <span className="tag">{job.division}</span>
                  {job.source === 'manual' && <span className="tag tag-manual">CURATED</span>}
                </div>
                <p className="location">{job.location}</p>
                <div className="card-actions">
                  <a className="btn-primary" href={job.url} target="_blank" rel="noreferrer">
                    {job.source === 'manual' ? 'View Program' : 'Apply'}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

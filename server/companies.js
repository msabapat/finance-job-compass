// Each entry maps a firm's public ATS job board to our taxonomy.
// board: 'greenhouse' | 'lever'  — both expose free public JSON APIs, no scraping.
// slug: the identifier in the board's API URL (verify at
//   https://boards-api.greenhouse.io/v1/boards/<slug>/jobs  or
//   https://api.lever.co/v0/postings/<slug>?mode=json
// titleFilter: only jobs whose title matches this regex are imported.
// excludeFilter: jobs whose title matches this are dropped even if titleFilter
//   matched — used to strip out corporate-support roles (HR, compliance, IT,
//   payroll, etc.) that ride on the same "Analyst"/"Associate" job families.
// divisionRules: ordered [regex, division] pairs tested against the job title;
//   first match wins. Falls back to defaultDivision.

const IB = 'Investment Banking';
const ST = 'Sales & Trading';
const RESEARCH = 'Research';
const AM_PE_VC = 'AM / PE / VC';
const CORP_FIN = 'Corp Fin / Insurance / Banking';
const FINTECH = 'Fintech / Startups';

const DEFAULT_DIVISION_RULES = [
  [/research|equity analyst|credit analyst/i, RESEARCH],
  [/sales.{0,3}trading|trading|markets|structuring/i, ST],
  [/private equity|venture|asset management|portfolio/i, AM_PE_VC],
  [/investment banking|m&a|mergers|capital markets|ecm|dcm|restructuring/i, IB],
];

// Corporate-support job families that show up on the same "Analyst"/"Associate"
// ladder at most firms but aren't finance-track roles — drop these everywhere.
const SUPPORT_ROLE_NOISE =
  /compliance|risk(?!.{0,20}(quant|trading))|learning|development|hris|payroll|recruit|talent|people|human resources|\bhr\b|benefits|executive assistant|treasury|accounting|tax\b|legal|paralegal|marketing|customer|support engineer|data engineer|product manager|business partner/i;

export const companies = [
  {
    name: 'William Blair',
    tier: 'Middle Market',
    board: 'greenhouse',
    slug: 'williamblair',
    titleFilter: /analyst/i,
    excludeFilter: SUPPORT_ROLE_NOISE,
    divisionRules: DEFAULT_DIVISION_RULES,
    defaultDivision: IB,
  },
  {
    name: 'Lincoln International',
    tier: 'Middle Market',
    board: 'greenhouse',
    slug: 'lincolninternational',
    titleFilter: /analyst|associate/i,
    excludeFilter: new RegExp(SUPPORT_ROLE_NOISE.source + '|technical business|systems analyst', 'i'),
    divisionRules: DEFAULT_DIVISION_RULES,
    defaultDivision: IB,
  },
  {
    name: 'General Atlantic',
    tier: 'Asset Manager',
    board: 'greenhouse',
    slug: 'generalatlantic',
    titleFilter: /^associate,/i,
    excludeFilter: SUPPORT_ROLE_NOISE,
    divisionRules: DEFAULT_DIVISION_RULES,
    defaultDivision: AM_PE_VC,
  },
  {
    name: 'Akuna Capital',
    tier: 'Asset Manager',
    board: 'greenhouse',
    slug: 'akunacapital',
    titleFilter: /trader|trading analyst|quantitative risk analyst|operations analyst/i,
    excludeFilter: /experienced|broker|floor/i,
    divisionRules: DEFAULT_DIVISION_RULES,
    defaultDivision: ST,
  },
  {
    name: 'Robinhood',
    tier: 'Fintech / Startup',
    board: 'greenhouse',
    slug: 'robinhood',
    titleFilter: /corporate finance analyst|finance\s*(&|and)\s*strategy.*analyst/i,
    excludeFilter: /senior|sr\.|staff|principal|lead/i,
    divisionRules: DEFAULT_DIVISION_RULES,
    defaultDivision: CORP_FIN,
  },
  // Add more firms here once you confirm their board slug + type, e.g.:
  // { name: 'Some Boutique', tier: 'Elite Boutique', board: 'lever', slug: 'someboutique',
  //   titleFilter: /analyst/i, excludeFilter: SUPPORT_ROLE_NOISE,
  //   divisionRules: DEFAULT_DIVISION_RULES, defaultDivision: IB },
];

export function classifyDivision(title, rules, fallback) {
  for (const [regex, division] of rules) {
    if (regex.test(title)) return division;
  }
  return fallback;
}

export function cityGroup(location) {
  const l = location.toLowerCase();
  const map = [
    ['Philadelphia', /philadelphia/],
    ['Chicago', /chicago/],
    ['Boston', /boston/],
    ['San Francisco', /san francisco|bay area/],
    ['Los Angeles', /los angeles/],
    ['Washington DC', /washington|dc\b/],
    ['Miami / Florida', /miami|florida|\bfl\b/],
    ['Denver / Colorado', /denver|colorado|\bco\b/],
    ['North Carolina', /north carolina|charlotte|\bnc\b/],
    ['Texas', /texas|dallas|houston|austin|\btx\b/],
    ['New York', /new york|\bny\b/],
  ];
  for (const [group, re] of map) {
    if (re.test(l)) return group;
  }
  if (/,\s*[a-z\s]+$/.test(l) && !/united states|remote/.test(l)) return 'International';
  return 'Other US';
}

export const DIVISIONS = [IB, ST, RESEARCH, AM_PE_VC, CORP_FIN, FINTECH];
export const TIERS = ['Bulge Bracket', 'Elite Boutique', 'Middle Market', 'Regional Boutique', 'Asset Manager', 'Fintech / Startup'];

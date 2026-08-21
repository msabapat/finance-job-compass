# Finance Job Compass

A live dashboard of entry-level finance job openings, pulled directly from companies'
public applicant-tracking-system (ATS) job boards (Greenhouse, Lever) — no scraping,
no manual curation required for firms that are configured.

## How it works

- `server/companies.js` — the list of firms to track. Each entry says which ATS the
  firm uses (`greenhouse` or `lever`) and its board slug.
- `server/fetch/` — pulls jobs from each firm's public ATS JSON API, classifies them
  into a division (IB / S&T / Research / ...) by title, and upserts them into Postgres.
- A cron job re-fetches every hour (`server/index.js`); jobs no longer posted are
  marked inactive rather than deleted.
- `client/` — React (Vite) frontend that mirrors the IB Compass UI: sidebar category
  counts, division/tier/city filter chips, and a job card grid.

**Coverage caveat:** bulge-bracket banks (Goldman, JPM, Morgan Stanley, BofA, Citi, etc.)
run custom career portals with no public job-search API — confirmed by hand for Goldman
Sachs (`higher.gs.com`, client-side GraphQL, no enumerable list endpoint) and JPMorgan
(`careers.jpmorgan.com`, plain Adobe AEM site, no API at all). They can't be auto-tracked.
Instead, `server/manualJobs.js` holds a small hand-maintained list of bulge-bracket entries
that link to each bank's official campus-recruiting hub — these show a "CURATED" badge on
the card and are re-asserted on every refresh but never auto-expired, since there's no live
feed to detect they've gone stale. Update that file by hand as programs open/close.

Firms on Greenhouse or Lever are auto-tracked live in `server/companies.js` (currently:
William Blair, Lincoln International, General Atlantic, Akuna Capital, Robinhood). Add
more as you find their board slugs — test a slug with:

```bash
curl "https://boards-api.greenhouse.io/v1/boards/<slug>/jobs?content=false"
curl "https://api.lever.co/v0/postings/<slug>?mode=json"
```

## Local development

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL (a local or Railway Postgres)
npm run dev:server     # http://localhost:3000 (API)
npm run dev:client     # http://localhost:5173 (Vite dev server, proxies /api)
```

## Deploying to Railway

1. Push this repo to GitHub.
2. In Railway: **New Project → Deploy from GitHub repo**, pick this repo.
3. Add a **Postgres** plugin to the project (Railway sets `DATABASE_URL` automatically
   on the linked service — just reference it as a variable, or copy it in).
4. Railway auto-detects Node via `railway.json` (`npm run build` then `npm start`).
   The server serves the built React app and the `/api/*` routes from one process.
5. On first boot the server creates its schema and runs an initial fetch; after that
   it refreshes hourly on its own. To trigger a manual refresh:

   ```bash
   curl -X POST https://<your-app>.up.railway.app/api/refresh \
     -H "x-refresh-token: <REFRESH_TOKEN from your env, if set>"
   ```

## Adding a firm

Edit `server/companies.js`:

```js
{
  name: 'Some Boutique',
  tier: 'Elite Boutique',       // Bulge Bracket | Elite Boutique | Middle Market | Regional Boutique | Asset Manager
  board: 'greenhouse',          // or 'lever'
  slug: 'someboutique',
  titleFilter: /analyst/i,      // only import titles matching this
  divisionRules: DEFAULT_DIVISION_RULES,
  defaultDivision: IB,
}
```

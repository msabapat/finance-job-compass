import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cron from 'node-cron';
import { pool, initSchema } from './db.js';
import { refreshAllJobs } from './fetch/run.js';
import { DIVISIONS } from './companies.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/jobs', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, company, tier, division, title, location, city_group AS "cityGroup", url, posted_at AS "postedAt"
     FROM jobs WHERE is_active = true ORDER BY posted_at DESC NULLS LAST, company ASC`
  );
  res.json(rows);
});

app.get('/api/stats', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT division, COUNT(*)::int AS count FROM jobs WHERE is_active = true GROUP BY division`
  );
  const counts = Object.fromEntries(DIVISIONS.map((d) => [d, 0]));
  for (const r of rows) counts[r.division] = r.count;
  res.json(counts);
});

app.post('/api/refresh', async (req, res) => {
  if (process.env.REFRESH_TOKEN && req.headers['x-refresh-token'] !== process.env.REFRESH_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  refreshAllJobs().catch((err) => console.error('[refresh] failed:', err));
  res.json({ status: 'refresh started' });
});

const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('/*splat', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

async function start() {
  await initSchema();
  refreshAllJobs().catch((err) => console.error('[startup refresh] failed:', err));
  cron.schedule('0 * * * *', () => {
    refreshAllJobs().catch((err) => console.error('[cron refresh] failed:', err));
  });
  app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
}

start();

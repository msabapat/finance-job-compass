import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway') || process.env.PGSSL === 'true'
    ? { rejectUnauthorized: false }
    : false,
});

export async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      company TEXT NOT NULL,
      tier TEXT NOT NULL,
      division TEXT NOT NULL,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      city_group TEXT NOT NULL,
      url TEXT NOT NULL,
      source TEXT NOT NULL,
      posted_at TIMESTAMPTZ,
      first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      is_active BOOLEAN NOT NULL DEFAULT true
    );
    CREATE INDEX IF NOT EXISTS idx_jobs_division ON jobs (division);
    CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs (is_active);
  `);
}

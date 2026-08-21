import { pool } from '../db.js';
import { companies, classifyDivision, cityGroup } from '../companies.js';
import { fetchGreenhouseJobs } from './greenhouse.js';
import { fetchLeverJobs } from './lever.js';

const FETCHERS = {
  greenhouse: fetchGreenhouseJobs,
  lever: fetchLeverJobs,
};

export async function refreshAllJobs() {
  const seenIds = [];
  let ok = 0;
  let failed = 0;

  for (const company of companies) {
    const fetcher = FETCHERS[company.board];
    if (!fetcher) continue;
    try {
      const rawJobs = await fetcher(company.slug);
      for (const job of rawJobs) {
        if (company.titleFilter && !company.titleFilter.test(job.title)) continue;
        if (company.excludeFilter && company.excludeFilter.test(job.title)) continue;
        const id = `${company.board}:${company.slug}:${job.externalId}`;
        const division = classifyDivision(job.title, company.divisionRules, company.defaultDivision);
        await pool.query(
          `INSERT INTO jobs (id, company, tier, division, title, location, city_group, url, source, posted_at, first_seen_at, last_seen_at, is_active)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now(), now(), true)
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             location = EXCLUDED.location,
             city_group = EXCLUDED.city_group,
             url = EXCLUDED.url,
             last_seen_at = now(),
             is_active = true`,
          [id, company.name, company.tier, division, job.title, job.location, cityGroup(job.location), job.url, company.board, job.postedAt]
        );
        seenIds.push(id);
      }
      ok++;
    } catch (err) {
      failed++;
      console.error(`[fetch] ${company.name} (${company.board}:${company.slug}) failed:`, err.message);
    }
  }

  // Mark jobs no longer present on any board as inactive rather than deleting them.
  if (seenIds.length > 0) {
    await pool.query(
      `UPDATE jobs SET is_active = false WHERE is_active = true AND NOT (id = ANY($1))`,
      [seenIds]
    );
  }

  console.log(`[fetch] done: ${ok} boards ok, ${failed} failed, ${seenIds.length} active jobs`);
}

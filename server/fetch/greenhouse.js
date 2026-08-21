export async function fetchGreenhouseJobs(slug) {
  const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=false`);
  if (!res.ok) throw new Error(`Greenhouse ${slug}: HTTP ${res.status}`);
  const data = await res.json();
  return (data.jobs || []).map((j) => ({
    externalId: String(j.id),
    title: j.title,
    location: j.location?.name || 'Unknown',
    url: j.absolute_url,
    postedAt: j.updated_at ? new Date(j.updated_at) : null,
  }));
}

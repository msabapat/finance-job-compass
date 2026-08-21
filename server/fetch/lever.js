export async function fetchLeverJobs(slug) {
  const res = await fetch(`https://api.lever.co/v0/postings/${slug}?mode=json`);
  if (!res.ok) throw new Error(`Lever ${slug}: HTTP ${res.status}`);
  const data = await res.json();
  return (data || []).map((j) => ({
    externalId: String(j.id),
    title: j.text,
    location: j.categories?.location || 'Unknown',
    url: j.hostedUrl,
    postedAt: j.createdAt ? new Date(j.createdAt) : null,
  }));
}

import { appendFile, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { readContent } from './lib/content.mjs';
import { isLive, liveMoment, publishMoment } from './lib/schedule.mjs';

const mode = process.argv[2] || 'list';
if (!['list', 'due'].includes(mode)) {
  console.error('usage: node scripts/schedule.mjs [list|due]');
  process.exit(2);
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const now = publishMoment();
// The hourly check publishes anything whose moment fell since the previous run, with a short overlap for runner delay.
const WINDOW_MIN = Number(process.env.PUBLISH_WINDOW_MINUTES || 70);
const minus = (moment, minutes) => { const d = new Date(`${moment.replace(' ', 'T')}:00Z`); d.setUTCMinutes(d.getUTCMinutes() - minutes); return d.toISOString().slice(0, 16).replace('T', ' '); };
const since = minus(now, WINDOW_MIN);
const files = (await readdir('content/posts')).filter(file => file.endsWith('.md')).sort();
const rows = [];

for (const name of files) {
  const file = path.join('content/posts', name);
  const { metadata } = await readContent(file);
  const published = String(metadata.published || '').trim();
  const dated = DATE.test(published);
  const live = isLive(metadata, now) && dated;
  rows.push({
    id: String(metadata.tracker_id || metadata.content_id || name),
    moment: dated ? liveMoment(metadata) : '-',
    state: metadata.draft === true ? 'draft' : live ? 'live' : dated ? 'scheduled' : 'unscheduled',
    slug: String(metadata.slug || '')
  });
}

const goingLive = rows.filter(row => row.state === 'live' && row.moment > since && row.moment <= now);

// GitHub can skip scheduled runs for hours, so a time window alone can miss a post.
// The main check compares every live post with the production sitemap and deploys if any is missing.
async function missingFromProduction() {
  const site = JSON.parse(await readFile('data/site.json', 'utf8'));
  const base = String(process.env.PRODUCTION_URL || site.url || '').replace(/\/$/, '');
  try {
    const response = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();
    return rows.filter(row => row.state === 'live' && !xml.includes(`${base}${row.slug}<`));
  } catch (error) {
    console.log(`Could not read the production sitemap (${error.message}); using the time window only.`);
    return null;
  }
}

if (mode === 'due') {
  const missing = await missingFromProduction();
  const due = goingLive.length > 0 || (missing?.length ?? 0) > 0;
  if (missing?.length) console.log(`${missing.length} live post(s) missing from production: ${missing.map(row => row.slug).join(', ')}`);
  console.log(goingLive.length
    ? `${goingLive.length} post(s) went live between ${since} and ${now}: ${goingLive.map(row => row.slug).join(', ')}`
    : `Nothing went live between ${since} and ${now}.`
  );
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `due=${due}\n`);
} else {
  console.log(`Publishing schedule as of ${now}\n`);
  for (const row of rows) console.log(`${row.id}\t${row.moment}\t${row.state}\t${row.slug}`);
}

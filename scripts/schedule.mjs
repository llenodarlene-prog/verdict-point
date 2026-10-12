import { appendFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { readContent } from './lib/content.mjs';
import { isLive, publishDate } from './lib/schedule.mjs';

const mode = process.argv[2] || 'list';
if (!['list', 'due'].includes(mode)) {
  console.error('usage: node scripts/schedule.mjs [list|due]');
  process.exit(2);
}

const today = publishDate();
const files = (await readdir('content/posts')).filter(file => file.endsWith('.md')).sort();
const rows = [];

for (const name of files) {
  const file = path.join('content/posts', name);
  const { metadata } = await readContent(file);
  const published = String(metadata.published || '').trim();
  const live = isLive(metadata, today) && /^\d{4}-\d{2}-\d{2}$/.test(published);
  rows.push({
    id: String(metadata.tracker_id || metadata.content_id || name),
    published: published || '-',
    state: metadata.draft === true ? 'draft' : (published > today ? 'scheduled' : live ? 'live' : 'unscheduled'),
    slug: String(metadata.slug || '')
  });
}

const goingLive = rows.filter(row => row.state === 'live' && row.published === today);

if (mode === 'due') {
  const due = goingLive.length > 0;
  console.log(due
    ? `${goingLive.length} post(s) go live on ${today}: ${goingLive.map(row => row.slug).join(', ')}`
    : `Nothing goes live on ${today}.`
  );
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `due=${due}\n`);
} else {
  console.log(`Publishing schedule as of ${today}\n`);
  for (const row of rows) console.log(`${row.id}\t${row.published}\t${row.state}\t${row.slug}`);
}

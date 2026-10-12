// Scheduled publishing: an article or blog with draft: false goes live on its `published` date.
// Until that date, production treats it like a draft; staging still previews it (noindex).
import { readFileSync } from 'node:fs';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function releasePolicy(file = 'data/release.json') {
  try { return JSON.parse(readFileSync(file, 'utf8')).launch_policy || {}; } catch { return {}; }
}

// Today's date in the publishing time zone. PUBLISH_DATE overrides it for previews and tests.
export function publishDate(env = process.env, policy = releasePolicy()) {
  if (env.PUBLISH_DATE) {
    if (!DATE.test(env.PUBLISH_DATE)) throw new Error(`PUBLISH_DATE must be YYYY-MM-DD, got ${env.PUBLISH_DATE}`);
    return env.PUBLISH_DATE;
  }
  return new Intl.DateTimeFormat('en-CA', { timeZone: policy.publish_timezone || 'UTC' }).format(new Date());
}

export const isPost = metadata => ['article', 'blog'].includes(String(metadata.type).toLowerCase());

export function isScheduled(metadata, today) {
  return isPost(metadata) && metadata.draft !== true && DATE.test(String(metadata.published)) && String(metadata.published) > today;
}

export const isLive = (metadata, today) => metadata.draft !== true && !isScheduled(metadata, today);

// Daily cadence: at most one article and one blog per publication date, from cadence_start_date onward.
export function cadenceViolations(posts, policy = releasePolicy()) {
  const start = policy.cadence_start_date || '0000-00-00';
  const byDay = new Map();
  for (const { metadata, file } of posts) {
    if (metadata.draft === true || !isPost(metadata) || !DATE.test(String(metadata.published)) || metadata.published < start) continue;
    const key = `${metadata.published} ${String(metadata.type).toLowerCase()}`;
    byDay.set(key, [...(byDay.get(key) || []), file]);
  }
  return [...byDay].filter(([, files]) => files.length > 1)
    .map(([key, files]) => `${key.replace(' ', ': ')} scheduled more than once per day (${files.join(', ')})`);
}

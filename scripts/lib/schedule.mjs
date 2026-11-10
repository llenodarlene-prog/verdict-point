// Scheduled publishing: an article or blog with draft: false goes live on its `published` date,
// at its optional `publish_time` (HH:MM, 24-hour, in publish_timezone; default 00:00).
// Until then, production treats it like a draft; staging still previews it (noindex).
import { readFileSync } from 'node:fs';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

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

// The current moment in the publishing time zone as 'YYYY-MM-DD HH:MM'. PUBLISH_DATE (date only) means the end of that day.
export function publishMoment(env = process.env, policy = releasePolicy()) {
  if (env.PUBLISH_DATE) return `${publishDate(env, policy)} 23:59`;
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: policy.publish_timezone || 'UTC', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date(env.PUBLISH_NOW_MS ? Number(env.PUBLISH_NOW_MS) : Date.now())).map(p => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}

export const publishTime = metadata => { const t = String(metadata.publish_time ?? '').trim(); return TIME.test(t) ? t : '00:00'; };
export const validPublishTime = metadata => metadata.publish_time === undefined || TIME.test(String(metadata.publish_time).trim());
// The moment a post goes live, as 'YYYY-MM-DD HH:MM'.
export const liveMoment = metadata => `${metadata.published} ${publishTime(metadata)}`;

export const isPost = metadata => ['article', 'blog'].includes(String(metadata.type).toLowerCase());

// `now` is a date ('YYYY-MM-DD', compared by date only) or a moment ('YYYY-MM-DD HH:MM').
export function isScheduled(metadata, now) {
  if (!isPost(metadata) || metadata.draft === true || !DATE.test(String(metadata.published))) return false;
  return String(now).length > 10 ? liveMoment(metadata) > now : String(metadata.published) > now;
}

export const isLive = (metadata, today) => metadata.draft !== true && !isScheduled(metadata, today);

// Daily cadence: at most max_posts_per_day posts (any type, default 2) per publication date, from cadence_start_date onward.
export function cadenceViolations(posts, policy = releasePolicy()) {
  const start = policy.cadence_start_date || '0000-00-00';
  const byDay = new Map();
  for (const { metadata, file } of posts) {
    if (metadata.draft === true || !isPost(metadata) || !DATE.test(String(metadata.published)) || metadata.published < start) continue;
    byDay.set(metadata.published, [...(byDay.get(metadata.published) || []), file]);
  }
  const limit = Number(policy.max_posts_per_day) || 2;
  return [...byDay].filter(([, files]) => files.length > limit)
    .map(([day, files]) => `${day}: ${files.length} posts scheduled; maximum is ${limit} per day (${files.join(', ')})`);
}

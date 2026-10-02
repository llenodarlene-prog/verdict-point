import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readContent } from './lib/content.mjs';

const readJson = async file => JSON.parse(await readFile(file, 'utf8'));
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]))).flat();
}
const [site, nav, authors, release, launch] = await Promise.all([
  readJson('data/site.json'), readJson('data/navigation.json'), readJson('data/authors.json'), readJson('data/release.json'), readJson('data/launch-content-plan.json')
]);
const failures = [];
const fail = message => failures.push(message);
const validDate = value => /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?Z)?$/.test(String(value || ''));
const approval = (name, value, extra = []) => {
  if (value?.approved !== true) fail(`${name} must be explicitly approved`);
  if (!value?.reviewer) fail(`${name} is missing reviewer`);
  if (!validDate(value?.reviewed_at)) fail(`${name} has an invalid reviewed_at date`);
  for (const field of extra) if (!value?.[field]) fail(`${name} is missing ${field}`);
};
if (site.launch_status !== 'ready') fail(`data/site.json launch_status must be "ready"; found "${site.launch_status}"`);
if (site.verified_contact_details !== true) fail('verified_contact_details must be true before production');
if (release.schema_version !== 2) fail('data/release.json schema_version must be 2');
if (!Object.values(authors).some(author => author.verified === true && author.publishable === true)) fail('at least one author must be verified and publishable');
approval('contact approval', release.contact, ['email']);
approval('privacy approval', release.privacy, ['policy_effective_date']);
approval('staging review', release.staging_review);
approval('production approval', release.production_approval, ['change_reference']);

// Launch policy: core pages complete plus a minimum number of published blogs. The 20-item tracker plan
// is the editorial backlog, not a launch requirement; drafts never block a release.
const policy = release.launch_policy || {};
const minimumBlogs = Number(policy.minimum_published_blogs);
if (!Number.isInteger(minimumBlogs) || minimumBlogs < 1) fail('launch_policy.minimum_published_blogs must be a whole number of at least 1');
const requiredPages = Array.isArray(policy.required_pages) ? policy.required_pages : [];
const legalPages = Array.isArray(policy.legal_pages) ? policy.legal_pages : [];
if (!requiredPages.length) fail('launch_policy.required_pages must list the core website pages');
for (const page of legalPages) if (!requiredPages.includes(page)) fail(`legal page ${page} must also be listed in launch_policy.required_pages`);
for (const item of [...nav.primary, ...nav.footer]) if (item.url.endsWith('/') && !requiredPages.includes(item.url)) fail(`navigation page ${item.url} must be listed in launch_policy.required_pages`);
if (!String(policy.publication_cadence || '').trim()) fail('launch_policy.publication_cadence must describe post-launch publishing');

const pages = [];
for (const file of (await walk('content')).filter(item => item.endsWith('.md'))) {
  const { metadata, body } = await readContent(file);
  pages.push({ file, metadata, body });
  if (metadata.draft === true) continue;
  if (/before (?:production )?(?:publication|launch)|does not yet verify|do not invent|placeholder/i.test(body)) fail(`${file}: unresolved prelaunch language remains`);
}
for (const route of requiredPages) {
  const page = pages.find(item => item.metadata.slug === route);
  if (!page) fail(`required page ${route} does not exist`);
  else if (page.metadata.draft === true) fail(`required page ${route} is still a draft`);
}

const published = pages.filter(page => page.metadata.draft !== true && ['article', 'blog'].includes(String(page.metadata.type).toLowerCase()));
const launchIds = new Set(launch.map(item => `${item.type}:${item.content_number}`));
const counts = new Map();
for (const page of published) {
  const id = page.metadata.tracker_id;
  if (!launchIds.has(id)) fail(`${page.file}: published content must map to a tracker record (${id || 'missing tracker_id'})`);
  counts.set(id, (counts.get(id) || 0) + 1);
}
for (const [id, count] of counts) if (count > 1) fail(`tracker item ${id} is published more than once`);
const publishedBlogs = published.filter(page => String(page.metadata.type).toLowerCase() === 'blog');
if (publishedBlogs.length < minimumBlogs) fail(`launch requires at least ${minimumBlogs} published blog(s); found ${publishedBlogs.length}`);

const contactPage = pages.find(page => page.metadata.slug === '/contact/');
if (!contactPage || !contactPage.body.includes(`mailto:${release.contact?.email}`)) fail('contact page must contain the approved mailto address');
const privacyPage = pages.find(page => page.metadata.slug === '/privacy/');
if (!privacyPage || !privacyPage.body.includes(release.privacy?.policy_effective_date || '__missing__')) fail('privacy page must contain the approved policy effective date');

// Every published item, including one added the day before a deploy, must pass the full research and content validators.
const here = path.dirname(fileURLToPath(import.meta.url));
for (const script of ['check-research.mjs', 'check-content.mjs']) {
  const result = spawnSync(process.execPath, [path.join(here, script)], { cwd: process.cwd(), encoding: 'utf8' });
  if (result.status !== 0) fail(`${script} failed for published content:\n${(result.stderr || result.stdout).trim()}`);
}

if (failures.length) { console.error([...new Set(failures)].map(message => `ERROR: ${message}`).join('\n')); process.exit(1); }
console.log(`Production release gate passed for ${site.name}: ${requiredPages.length} core pages, ${published.length} published item(s) including ${publishedBlogs.length} blog(s); ${launch.length - published.length} backlog item(s) remain drafts.`);

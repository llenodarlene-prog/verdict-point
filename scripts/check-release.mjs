import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { readContent } from './lib/content.mjs';

const readJson = async file => JSON.parse(await readFile(file, 'utf8'));
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]))).flat();
}
const [site, authors, release, launch] = await Promise.all([
  readJson('data/site.json'), readJson('data/authors.json'), readJson('data/release.json'), readJson('data/launch-content-plan.json')
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
if (release.schema_version !== 1) fail('data/release.json schema_version must be 1');
if (!Object.values(authors).some(author => author.verified === true && author.publishable === true)) fail('at least one author must be verified and publishable');
approval('contact approval', release.contact, ['email']);
approval('privacy approval', release.privacy, ['policy_effective_date']);
approval('staging review', release.staging_review);
approval('production approval', release.production_approval, ['change_reference']);

const expectedIds = launch.map(item => `${item.type}:${item.content_number}`).sort();
const requiredIds = Array.isArray(release.required_content_ids) ? [...release.required_content_ids].sort() : [];
if (JSON.stringify(requiredIds) !== JSON.stringify(expectedIds)) fail('required_content_ids must equal the complete 20-item launch set');
const pages = [];
for (const file of (await walk('content')).filter(item => item.endsWith('.md'))) {
  const { metadata, body } = await readContent(file);
  pages.push({ file, metadata, body });
  if (metadata.draft === true) continue;
  if (/before (?:production )?(?:publication|launch)|does not yet verify|do not invent|placeholder/i.test(body)) fail(`${file}: unresolved prelaunch language remains`);
}
const published = pages.filter(page => page.metadata.draft !== true && ['article', 'blog'].includes(String(page.metadata.type).toLowerCase()));
const counts = new Map();
for (const page of published) counts.set(page.metadata.tracker_id, (counts.get(page.metadata.tracker_id) || 0) + 1);
for (const id of requiredIds) {
  if (!counts.has(id)) fail(`required launch content is not published: ${id}`);
  else if (counts.get(id) !== 1) fail(`required launch content must be published exactly once: ${id}`);
}
const contactPage = pages.find(page => page.metadata.slug === '/contact/');
if (!contactPage || !contactPage.body.includes(`mailto:${release.contact?.email}`)) fail('contact page must contain the approved mailto address');
const privacyPage = pages.find(page => page.metadata.slug === '/privacy/');
if (!privacyPage || !privacyPage.body.includes(release.privacy?.policy_effective_date || '__missing__')) fail('privacy page must contain the approved policy effective date');
if (failures.length) { console.error([...new Set(failures)].map(message => `ERROR: ${message}`).join('\n')); process.exit(1); }
console.log(`Production release gate passed for ${site.name}: ${requiredIds.length} required content items approved.`);

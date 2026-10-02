import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const readJson = async file => JSON.parse(await readFile(file, 'utf8'));
const [site, nav, architecture, content, launch, links, provenance, manifest] = await Promise.all([
  readJson('data/site.json'), readJson('data/navigation.json'), readJson('data/site-architecture.json'),
  readJson('data/content-plan.json'), readJson('data/launch-content-plan.json'), readJson('data/interlinking-plan.json'),
  readJson('data/tracker-provenance.json'), readJson('REPOSITORY-MANIFEST.json')
]);
const failures = [];
const fail = message => failures.push(message);
const workbook = await readFile('data/source/5-Site-SEO-GEO-AEO-Content-Keyword-Tracker.xlsx').catch(() => null);
if (!workbook) fail('original tracker workbook is missing from data/source');
else if (createHash('sha256').update(workbook).digest('hex') !== provenance.sha256) fail('preserved workbook SHA-256 differs from tracker provenance');
if (site.tracker_sha256 !== provenance.sha256 || manifest.tracker_sha256 !== provenance.sha256) fail('tracker SHA-256 mismatch');
if (content.length !== 100) fail(`content plan must contain 100 records; found ${content.length}`);
if (content.filter(item => item.type === 'Article').length !== 50) fail('content plan must contain 50 articles');
if (content.filter(item => item.type === 'Blog').length !== 50) fail('content plan must contain 50 blogs');
if (launch.length !== 20) fail(`launch plan must contain 20 records; found ${launch.length}`);
if (links.length !== 20) fail(`interlinking plan must contain 20 records; found ${links.length}`);
const architecturePrimary = architecture.filter(item => item.nav_type === 'Primary').map(item => `${item.main_navigation}|${item.url}`);
const navigationPrimary = nav.primary.map(item => `${item.label}|${item.url}`);
if (JSON.stringify(architecturePrimary) !== JSON.stringify(navigationPrimary)) fail('primary navigation differs from tracker architecture or order');
const architectureFooter = architecture.filter(item => item.nav_type === 'Footer only').map(item => `${item.main_navigation}|${item.url}`);
const navigationFooter = nav.footer.filter(item => item.url !== '/sitemap.xml').map(item => `${item.label}|${item.url}`);
if (JSON.stringify(architectureFooter) !== JSON.stringify(navigationFooter)) fail('footer navigation differs from tracker architecture or order');
const keys = new Set();
const slugs = new Set();
const launchKeys = new Set(launch.map(item => `${item.type}:${item.content_number}`));
for (const item of content) {
  const key = `${item.type}:${item.content_number}`;
  if (keys.has(key)) fail(`duplicate content key ${key}`); keys.add(key);
  for (const field of ['working_title', 'primary_keyword', 'cluster', 'status']) if (!item[field]) fail(`${key}: missing ${field}`);
  if (item.url_slug) {
    if (!/^\/.+\/$/.test(item.url_slug)) fail(`${key}: invalid URL slug ${item.url_slug}`);
    if (slugs.has(item.url_slug)) fail(`${key}: duplicate URL slug ${item.url_slug}`); slugs.add(item.url_slug);
  } else if (launchKeys.has(key)) fail(`${key}: launch record is missing URL slug`);
}
for (const item of links) {
  const key = `${item.type}:${item.content_number}`;
  if (!launchKeys.has(key)) fail(`${key}: interlinking record has no launch record`);
  const contentItem = content.find(record => `${record.type}:${record.content_number}` === key);
  if (!contentItem) fail(`${key}: not found in complete content plan`);
  else if (contentItem.url_slug !== item.url_slug) fail(`${key}: slug differs between plan and interlinking data`);
  if (!item.primary_silo_hub || !Array.isArray(item.approved_outbound_targets)) fail(`${key}: incomplete silo plan`);
  for (const target of item.approved_outbound_targets || []) if (!slugs.has(target)) fail(`${key}: unknown outbound target ${target}`);
}
if (failures.length) { console.error(failures.map(message => `ERROR: ${message}`).join('\n')); process.exit(1); }
console.log(`Validated tracker conformity: ${content.length} content, ${launch.length} launch, ${links.length} silo records.`);

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { readContent } from './lib/content.mjs';
import { validateResearchRecord } from './lib/workflow.mjs';

const readJson = async file => JSON.parse(await readFile(file, 'utf8'));
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]))).flat();
}

const [launch, links] = await Promise.all([readJson('data/launch-content-plan.json'), readJson('data/interlinking-plan.json')]);
const failures = [];
const researchFiles = (await walk('content/research')).filter(file => file.endsWith('.json')).sort();
const contentFiles = (await walk('content')).filter(file => file.endsWith('.md')).sort();
const records = new Map();

for (const file of researchFiles) {
  const research = await readFile(file, 'utf8').then(JSON.parse).catch(() => null);
  if (!research) { failures.push(`${file}: invalid JSON`); continue; }
  if (records.has(research.tracker_id)) failures.push(`${file}: duplicate research tracker_id also used by ${records.get(research.tracker_id).file}`);
  const record = launch.find(item => `${item.type}:${item.content_number}` === research.tracker_id);
  const silo = links.find(item => `${item.type}:${item.content_number}` === research.tracker_id);
  if (!record || !silo) failures.push(`${file}: tracker_id does not identify an exact launch record`);
  else for (const message of validateResearchRecord(research, { record, silo })) failures.push(`${file}: ${message}`);
  records.set(research.tracker_id, { file, research });
}

let contentItems = 0;
for (const file of contentFiles) {
  const { metadata } = await readContent(file);
  if (!['article', 'blog'].includes(String(metadata.type || '').toLowerCase())) continue;
  contentItems += 1;
  const researchPath = String(metadata.research_record || '').trim();
  if (!researchPath.startsWith('content/research/') || !researchPath.endsWith('.json')) { failures.push(`${file}: missing valid research_record path`); continue; }
  const linked = await readFile(researchPath, 'utf8').then(JSON.parse).catch(() => null);
  if (!linked) failures.push(`${file}: referenced research record is missing or invalid JSON`);
  else if (linked.tracker_id !== metadata.tracker_id) failures.push(`${file}: research record tracker_id differs from content tracker_id`);
}

if (failures.length) {
  console.error([...new Set(failures)].map(message => `ERROR: ${message}`).join('\n'));
  process.exit(1);
}
const stages = researchFiles.reduce((result, file) => {
  const item = [...records.values()].find(value => value.file === file)?.research;
  if (item) result[item.status] = (result[item.status] || 0) + 1;
  return result;
}, {});
console.log(`Validated ${researchFiles.length} research records linked to ${contentItems} article/blog drafts (${JSON.stringify(stages)}).`);

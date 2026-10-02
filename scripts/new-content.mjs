import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createResearchScaffold } from './lib/workflow.mjs';

const [typeInput, numberInput] = process.argv.slice(2);
const type = String(typeInput || '').toLowerCase();
const number = String(numberInput || '');
if (!['article', 'blog'].includes(type) || !/^\d+$/.test(number)) {
  console.error('Usage: npm run new:content -- <article|blog> <content-number>');
  process.exit(2);
}
const [launch, links] = await Promise.all([
  readFile('data/launch-content-plan.json', 'utf8').then(JSON.parse),
  readFile('data/interlinking-plan.json', 'utf8').then(JSON.parse)
]);
const record = launch.find(item => item.type.toLowerCase() === type && item.content_number === number);
const silo = links.find(item => item.type.toLowerCase() === type && item.content_number === number);
if (!record || !silo) throw new Error(`No launch tracker record for ${type}:${number}`);
if (!String(record.status).startsWith('Ready')) throw new Error(`${type}:${number} is not ready: ${record.status}`);
const leaf = record.url_slug.split('/').filter(Boolean).at(-1);
const target = path.join('content', 'posts', `${type}-${number}-${leaf}.md`);
const researchTarget = path.join('content', 'research', `${type}-${number}.json`);
const firstSection = type === 'article' ? 'Key Statistics and Data' : 'Key Takeaways';
const faq = type === 'blog' ? '\n## Frequently Asked Questions\n\n### [Question]\n\n[Direct answer.]\n' : '';
const frontMatter = {
  title: record.working_title, seo_title: record.seo_title || record.working_title, description: record.meta_description || `${record.primary_keyword}: complete this description from verified research before publication.`,
  slug: record.url_slug, type, schema: 'Article', draft: true, tracker_id: `${record.type}:${record.content_number}`,
  primary_keyword: record.primary_keyword, cluster: record.cluster, launch_silo: record.launch_silo,
  silo_role: record.silo_role, approved_internal_links: silo.approved_outbound_targets.join('; '), research_record: researchTarget,
  ai_exceptions: '', ai_exception_reason: '', author: '', published: '', modified: ''
};
const lines = ['---', ...Object.entries(frontMatter).map(([key, value]) => `${key}: ${value}`), '---', '', `# ${record.working_title}`, '', '[Introduction with the exact primary keyword.]', '', `## ${firstSection}`, '', '[Context sentence before bullets, a table, or data points.]', '', '## [Main Section]', '', '[Evidence-led analysis with cited primary sources.]', faq, '## The Bottom Line', '', '[Substantive conclusion.]', '', '## Resources', '', '- [Source title](https://example.com/)'];
const research = createResearchScaffold(record, silo, frontMatter);
for (const file of [target, researchTarget]) {
  try { await readFile(file); throw new Error(`${file} already exists`); } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
await mkdir(path.dirname(target), { recursive: true });
await mkdir(path.dirname(researchTarget), { recursive: true });
await writeFile(target, lines.join('\n') + '\n');
await writeFile(researchTarget, JSON.stringify(research, null, 2) + '\n');
console.log(`Created ${target} and ${researchTarget} from tracker ${record.type}:${record.content_number}`);

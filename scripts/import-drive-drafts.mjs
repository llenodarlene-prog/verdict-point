import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createResearchScaffold } from './lib/workflow.mjs';
import { readContent } from './lib/content.mjs';

const json = async file => JSON.parse(await readFile(file, 'utf8'));
const [manifest, launch, links] = await Promise.all([json('data/google-drive-sources.json'), json('data/launch-content-plan.json'), json('data/interlinking-plan.json')]);
const reports = [];
await mkdir('content/posts', { recursive: true });
for (const record of launch) {
  const type = record.type.toLowerCase();
  const number = Number(record.content_number);
  const source = manifest.files.find(f => new RegExp(`^${record.type} ${String(number).padStart(2, '0')} - `).test(f.title));
  const brief = manifest.files.find(f => new RegExp(`^${type === 'article' ? 'A' : 'B'}${String(number).padStart(2, '0')} - `).test(f.title));
  if (!source || !brief) throw new Error(`Missing draft or research brief for ${record.type}:${number}`);
  const raw = await readFile(source.path, 'utf8');
  const normalized = raw.replace(/\r\n/g, '\n').replace(/\\([#.:$=\-])/g, '$1');
  const lines = normalized.split('\n');
  const h1 = lines.findIndex(line => /^#\s+\S/.test(line));
  if (h1 < 0) throw new Error(`${source.title}: no H1 found; review source formatting`);
  let body = lines.slice(h1).join('\n').replace(/\nEND OF (?:ARTICLE|BLOG)[\s\S]*$/i, '').trim();
  // Newer Docs use Heading 1 for every section. Preserve one H1 and normalize later sections.
  let seenH1 = false;
  body = body.split('\n').map(line => {
    if (/^#\s/.test(line)) { if (seenH1) return '#' + line; seenH1 = true; }
    if (/^(Key Statistics and Data|Key Takeaways|Frequently Asked Questions|Resources)\s*$/.test(line)) return '## ' + line.trim();
    return line.replace(/^•\s*/, '- ');
  }).join('\n');
  const leaf = record.url_slug.split('/').filter(Boolean).at(-1);
  const target = `content/posts/${type}-${number}-${leaf}.md`;
  let existing;
  try { existing = await readContent(target); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (existing && existing.metadata.draft !== true) throw new Error(`Refusing to overwrite publishable content: ${target}`);
  const silo = links.find(item => item.type === record.type && item.content_number === record.content_number);
  const researchPath = `content/research/${type}-${number}.json`;
  const sourceDescription = normalized.match(/^\**Meta Description\**:\s*([^\n]+)/im)?.[1]?.replace(/\*\*/g, '').trim();
  const fm = { title: record.working_title, seo_title: record.seo_title || record.working_title, description: record.meta_description || sourceDescription || `Editorial draft about ${record.primary_keyword}. Source and publication review pending.`, slug: record.url_slug, type, schema: 'Article', draft: true, tracker_id: `${record.type}:${number}`, primary_keyword: record.primary_keyword, cluster: record.cluster, launch_silo: record.launch_silo, silo_role: record.silo_role, approved_internal_links: silo.approved_outbound_targets.join('; '), research_record: researchPath, source_document: source.url, author: '', published: '', modified: '' };
  await writeFile(target, ['---', ...Object.entries(fm).map(([key, value]) => `${key}: ${value}`), '---', '', body, ''].join('\n'));
  let research;
  try { research = await json(researchPath); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (!research) {
    research = createResearchScaffold(record, silo, fm);
    research.recovery = { research_brief: brief.url, research_snapshot: brief.path, draft_snapshot: source.path, status_note: 'Source documents recovered. Structured evidence and publication sign-off are pending; source assertions are not treated as verified approval.' };
    await writeFile(researchPath, JSON.stringify(research, null, 2) + '\n');
  }
  reports.push({ tracker_id: fm.tracker_id, path: target, source_id: source.id, sha256: createHash('sha256').update(raw).digest('hex'), approximate_words: body.split(/\s+/).length, editorial_status: 'draft', structured_research_status: research.status });
}
await writeFile('data/drive-import-report.json', JSON.stringify(reports, null, 2) + '\n');
console.log(`Imported ${reports.length} Drive drafts; existing publication and evidence approvals preserved.`);

import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { readContent } from './lib/content.mjs';
import { auditCitations, compileKillPattern, validateResearchRecord } from './lib/workflow.mjs';

const readJson = async file => JSON.parse(await readFile(file, 'utf8'));
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]))).flat();
}
const [launch, links, authors, assets, killList] = await Promise.all([
  readJson('data/launch-content-plan.json'), readJson('data/interlinking-plan.json'), readJson('data/authors.json'),
  readJson('data/assets.json'), readJson('data/ai-kill-list.json')
]);
const failures = [];
const fail = message => failures.push(message);
const norm = value => String(value ?? '').trim();
const lower = value => norm(value).toLowerCase();
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const killPatterns = killList.filter(item => ['high', 'medium'].includes(lower(item.severity))).flatMap(item => norm(item.avoid_flag).split(/\s*\/\s*/).filter(Boolean).map(term => ({ term, severity: lower(item.severity), scope: lower(item.applies_to), pattern: compileKillPattern(term, item.applies_to) })));
const authorList = Object.values(authors || {});
const assetList = Array.isArray(assets) ? assets : Object.values(assets || {});
const files = (await walk('content')).filter(file => file.endsWith('.md'));
let publishedChecked = 0;
const titleStopWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'into', 'nor', 'of', 'on', 'or', 'per', 'the', 'to', 'via', 'vs', 'with', 'without']);
const isTitleCase = heading => heading.split(/\s+/).every((token, index, words) => {
  const word = token.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '');
  if (!word || /[A-Z].*[A-Z]|[a-z][A-Z]|\d/.test(word)) return true;
  if (index > 0 && index < words.length - 1 && titleStopWords.has(word.toLowerCase())) return true;
  return word !== word.toLowerCase();
});

for (const file of files) {
  const { metadata, body } = await readContent(file);
  if (metadata.draft === true || !['article', 'blog'].includes(lower(metadata.type))) continue;
  publishedChecked += 1;
  const trackerId = norm(metadata.tracker_id);
  const record = launch.find(item => `${item.type}:${item.content_number}` === trackerId);
  const silo = links.find(item => `${item.type}:${item.content_number}` === trackerId);
  if (!record || !silo) { fail(`${file}: tracker_id must identify an exact launch record`); continue; }
  const expected = { type: lower(record.type), title: norm(record.working_title), primary_keyword: norm(record.primary_keyword), cluster: norm(record.cluster), slug: norm(record.url_slug) };
  for (const [field, value] of Object.entries(expected)) if (norm(metadata[field]) !== value) fail(`${file}: ${field} differs from tracker (${norm(metadata[field])} != ${value})`);
  const seoTitle = norm(metadata.seo_title);
  const description = norm(metadata.description);
  if (record.seo_title ? seoTitle !== norm(record.seo_title) : !lower(seoTitle).includes(lower(record.primary_keyword))) fail(`${file}: SEO title is not tracker-approved or does not contain the exact keyword`);
  if (record.meta_description ? description !== norm(record.meta_description) : !lower(description).includes(lower(record.primary_keyword))) fail(`${file}: meta description is not tracker-approved or does not contain the exact keyword`);
  if (seoTitle.length > 60) fail(`${file}: SEO title is ${seoTitle.length} characters; maximum is 60`);
  const words = body.replace(/[#*_`>\[\]()|]/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (words.length < 2000 || words.length > 2600) fail(`${file}: publishable word count is ${words.length}, expected 2000-2500 and never above 2600`);
  else if (words.length > 2500 && metadata.word_count_exception !== 'approved') fail(`${file}: ${words.length} words requires word_count_exception: approved`);
  const keyword = lower(record.primary_keyword);
  const keywordRegex = new RegExp(escapeRegex(keyword), 'g');
  const count = (lower(body).match(keywordRegex) || []).length;
  if (count < 8) fail(`${file}: exact primary keyword appears ${count} times; expected at least 8`);
  const h1 = body.match(/^#\s+(.+)$/m)?.[1] || '';
  const introduction = body.replace(/^#\s+.+$/m, '').split(/^##\s+/m)[0];
  if (!lower(h1).includes(keyword)) fail(`${file}: H1 does not contain the exact primary keyword`);
  if (!lower(introduction).includes(keyword)) fail(`${file}: introduction does not contain the exact primary keyword`);
  const h2s = [...body.matchAll(/^##\s+(.+)$/gm)].map(match => match[1].trim());
  const headings = [...body.matchAll(/^#{1,3}\s+(.+)$/gm)].map(match => match[1].trim());
  for (const heading of headings) if (!isTitleCase(heading)) fail(`${file}: heading is not Title Case (${heading})`);
  const required = expected.type === 'article' ? 'Key Statistics and Data' : 'Key Takeaways';
  if (h2s[0] !== required) fail(`${file}: first H2 must be ${required}`);
  const faqAt = h2s.indexOf('Frequently Asked Questions');
  const resourcesAt = h2s.indexOf('Resources');
  if (expected.type === 'blog' && faqAt < 0) fail(`${file}: blog needs Frequently Asked Questions`);
  if (resourcesAt < 0) fail(`${file}: missing Resources section`);
  if (faqAt >= 0 && resourcesAt >= 0 && faqAt > resourcesAt) fail(`${file}: Frequently Asked Questions must come before Resources`);
  if (body.includes('—')) fail(`${file}: em dash is prohibited`);
  const statisticsText = body.match(/^##\s+Key Statistics and Data\s*$([\s\S]*?)(?=^##\s+|$)/m)?.[1] || '';
  const aiExceptions = new Set(norm(metadata.ai_exceptions).split(';').map(lower).filter(Boolean));
  for (const { term, severity, scope, pattern } of killPatterns) {
    let haystack = scope.includes('title') ? `${metadata.title}\n${metadata.seo_title}` : scope.includes('stats') ? statisticsText : `${metadata.title}\n${metadata.seo_title}\n${metadata.description}\n${body}`;
    if (lower(term) === 'key takeaways' && expected.type === 'blog') haystack = haystack.replace(/^##\s+Key Takeaways\s*$/gm, '');
    if (!pattern.test(haystack)) continue;
    if (aiExceptions.has(lower(term))) {
      if (!norm(metadata.ai_exception_reason)) fail(`${file}: AI exception for "${term}" needs ai_exception_reason`);
      continue;
    }
    fail(`${file}: ${severity}-severity AI kill-list phrase or pattern "${term}"`);
  }
  for (const term of ['click here', 'learn more', 'our guide', 'our page', 'deep dive']) if (new RegExp(`\\b${term.replace(' ', '\\s+')}\\b`, 'i').test(body)) fail(`${file}: mechanical anchor phrase "${term}"`);
  const approved = [...silo.approved_outbound_targets].sort();
  // Page links only: Markdown images (![alt](/assets/...)) are validated separately against data/assets.json.
  const actual = [...new Set([...body.matchAll(/(?<!!)\[[^\]]+\]\((\/[^)#?\s]+\/?)(?:#[^)]+)?\)/g)].map(match => match[1]).filter(value => value !== '/'))].sort();
  if (JSON.stringify(actual) !== JSON.stringify(approved)) fail(`${file}: internal link set differs from the exact tracker-approved set`);
  const resourcesOffset = body.search(/^##\s+Resources\s*$/m);
  const contextualBody = resourcesOffset < 0 ? body : body.slice(0, resourcesOffset);
  const lines = contextualBody.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const previous = lines.slice(0, index).reverse().find(value => value.trim())?.trim() || '';
    if (/^#{2,3}\s+/.test(line) && /^#{1,3}\s+/.test(previous)) fail(`${file}: adjacent headings need contextual copy (${line})`);
    const startsBlock = /^###\s+/.test(line) || (/^[-*]\s+/.test(line) && !/^[-*]\s+/.test(previous)) || (line.startsWith('|') && /^\s*\|?(?:\s*:?-+:?\s*\|)+/.test(lines[index + 1] || ''));
    if (startsBlock && (!previous || /^#{1,3}\s+|^[-*]\s+|^\|/.test(previous))) fail(`${file}: add contextual prose before ${line.slice(0, 60)}`);
    if (/^[-*]\s+/.test(line) && !/^[-*]\s+\*\*[^*]+\*\*[:.]?\s+\S+/.test(line)) fail(`${file}: body bullet needs a bold lead and complete explanation (${line.slice(0, 60)})`);
    if (line.startsWith('|')) {
      const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
      if (cells.some(cell => !cell)) fail(`${file}: table row has an empty cell`);
    }
  }
  const h2Sections = [...contextualBody.matchAll(/^##\s+(.+)$/gm)];
  for (let index = 0; index < h2Sections.length; index += 1) {
    const start = h2Sections[index].index;
    const end = h2Sections[index + 1]?.index ?? contextualBody.length;
    const section = contextualBody.slice(start, end);
    const h3Count = (section.match(/^###\s+/gm) || []).length;
    if (h3Count === 1) fail(`${file}: H3 subsections must appear in pairs or groups under ${h2Sections[index][1]}`);
    if (h2Sections[index][1].trim() === 'Frequently Asked Questions' && h3Count < 2) fail(`${file}: FAQ needs at least two H3 questions`);
  }
  if (expected.type === 'blog' && faqAt >= 0 && resourcesAt > faqAt) {
    const faqSection = body.match(/^##\s+Frequently Asked Questions\s*$([\s\S]*?)(?=^##\s+Resources\s*$)/m)?.[1] || '';
    const questions = [...faqSection.matchAll(/^###\s+(.+)$/gm)];
    for (let index = 0; index < questions.length; index += 1) {
      const question = questions[index][1].trim();
      const answer = faqSection.slice((questions[index].index || 0) + questions[index][0].length, questions[index + 1]?.index ?? faqSection.length).trim();
      if (!question.endsWith('?')) fail(`${file}: FAQ H3 must be a question (${question})`);
      if (!answer || /^#{1,3}\s+/.test(answer)) fail(`${file}: FAQ question needs a direct answer (${question})`);
    }
  }
  if (/\[(?:question|direct answer|context|evidence|source title|introduction|main section|substantive conclusion)[^\]]*\]/i.test(body)) fail(`${file}: drafting placeholders remain`);
  const author = authorList.find(item => item.name === metadata.author);
  if (!author || author.verified !== true || author.publishable !== true) fail(`${file}: author must match a verified, publishable author record`);
  const researchPath = norm(metadata.research_record);
  if (!researchPath.startsWith('content/research/') || !researchPath.endsWith('.json')) fail(`${file}: missing valid research_record path`);
  else {
    const research = await readFile(researchPath, 'utf8').then(JSON.parse).catch(() => null);
    if (!research) fail(`${file}: research record is missing or invalid JSON`);
    else {
      for (const message of validateResearchRecord(research, { record, silo, metadata, requireVerified: true })) fail(`${file}: ${message}`);
      for (const message of auditCitations(body, research.sources || [], research.claims || [], { minContextual: 2, maxContextual: 3 })) fail(`${file}: ${message}`);
    }
  }
  for (const match of body.matchAll(/!\[([^\]]*)\]\((\/[^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const [alt, src] = [match[1], match[2]];
    const asset = assetList.find(item => (item.path || item.src) === src);
    if (!asset) fail(`${file}: image ${src} is absent from data/assets.json`);
    else {
      if (asset.rights_status !== 'approved' || !asset.width || !asset.height || !asset.alt_guidance) fail(`${file}: image ${src} lacks approved rights, dimensions, or alt guidance`);
      if (!alt.trim()) fail(`${file}: image ${src} has empty alt text`);
      if (!(await stat(path.join('.', src.replace(/^\//, ''))).catch(() => null))) fail(`${file}: image file ${src} does not exist`);
    }
  }
}
if (failures.length) { console.error([...new Set(failures)].map(message => `ERROR: ${message}`).join('\n')); process.exit(1); }
console.log(`Validated ${publishedChecked} published content items; skipped ${files.length - publishedChecked} pages or drafts.`);

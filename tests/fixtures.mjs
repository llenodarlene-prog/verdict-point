import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const readJson = async file => JSON.parse(await readFile(file, 'utf8'));
const writeJson = (file, value) => writeFile(file, JSON.stringify(value, null, 2) + '\n');
const frontMatter = fields => ['---', ...Object.entries(fields).map(([key, value]) => `${key}: ${value}`), '---'].join('\n');

export function completeResearch(record, silo, metadata) {
  const sourceUrls = ['https://sources.example/one', 'https://sources.example/two', 'https://sources.example/three'];
  return {
    tracker_id: `${record.type}:${record.content_number}`,
    status: 'verified',
    research_question: 'What does the best available evidence show?',
    research_brief: { purpose: 'Explain the evidence', audience: 'General readers', publication_year: '2026', data_period: '2024-2026', scope_limitations: 'Public evidence only' },
    keyword_research: {
      approved_primary_keyword: record.primary_keyword,
      intent: record.intent || 'Informational',
      serp_checked_at: '2026-09-20',
      tools: [{ name: 'Ahrefs', status: 'verified', retrieved_at: '2026-09-20' }, { name: 'Ubersuggest', status: 'verified', retrieved_at: '2026-09-20' }],
      queries: ['short-tail', 'long-tail', 'commercial', 'problem', 'question'].map((type, index) => ({ keyword: `${record.primary_keyword} ${type}`, type, volume: 100 + index, difficulty: 30 + index, cpc: 1.5 + index, intent: 'Informational', ranking_url: `https://ranking.example/${index + 1}`, retrieved_at: '2026-09-20', tool: index % 2 ? 'Ubersuggest' : 'Ahrefs' }))
    },
    sources: sourceUrls.map((url, index) => ({ url, title: `Primary Source ${index + 1}`, publisher: `Publisher ${index + 1}`, source_type: 'Official dataset', year: '2025', published_at: '2025-12-01', accessed_at: '2026-09-20', scope: 'National sample', method: 'Published methodology', limitations: 'Reported limitations apply', verified: true })),
    statistics: [{ claim: 'A measured result was reported.', source_url: sourceUrls[0], data_year: '2025', geography: 'United States', population: 'Adults', sample: '1,000 respondents', denominator: 'All respondents', unit: 'Percent', method: 'Survey', limitations: 'Sampling limits apply', sponsored: false, partial_year: false, estimate: false, verified: true }],
    competitors: Array.from({ length: 5 }, (_, index) => ({ title: `Competitor ${index + 1}`, url: `https://competitor.example/${index + 1}`, publisher: `Competitor Publisher ${index + 1}`, format: 'Article', updated_at: '2026-08-01', headings: ['Overview'], coverage: ['Core topic'], sources: ['Primary source'], data_assets: ['Table'], link_patterns: ['Contextual citations'], trust_signals: ['Named author'], covered_well: 'Clear definitions', gaps: 'Limited methodology detail' })),
    content_gaps: ['Method detail', 'Reader interpretation'],
    value_add: 'Connects evidence limits to practical interpretation.',
    plan: {
      reader_title: record.working_title,
      seo_title: metadata.seo_title,
      meta_description: metadata.description,
      slug: record.url_slug,
      search_intent: record.intent || 'Informational',
      secondary_keywords: ['supporting query'],
      outline: ['Key Statistics and Data', 'Evidence Review', 'Practical Interpretation', 'The Bottom Line'],
      evidence_map: ['Primary Source 1 supports the measured claim'],
      visuals: ['No visual required for this fixture'],
      internal_links: silo.approved_outbound_targets,
      external_link_opportunities: sourceUrls,
      excluded_claims: ['Unsupported causal claims'],
      drafting_cautions: ['Preserve the evidence year']
    },
    claims: sourceUrls.map((source_url, index) => ({ statement: `Verified claim ${index + 1}`, source_url, verified: true })),
    fact_check: { completed: true, reviewer: 'Fixture Reviewer', reviewed_at: '2026-09-21' },
    qa: { completed: true, reviewer: 'Fixture QA', reviewed_at: '2026-09-22' }
  };
}

function publishableBody(record, silo) {
  const keywordLines = Array.from({ length: 7 }, (_, index) => `${record.primary_keyword} helps frame evidence question ${index + 1} without changing the source limits.`).join('\n\n');
  const internal = silo.approved_outbound_targets.map((target, index) => `Related evidence is organized through [approved topic ${index + 1}](${target}) for readers comparing the launch set.`).join('\n\n');
  const filler = Array.from({ length: 155 }, () => 'Careful evidence helps readers compare methods, limits, groups, dates, and reported measures.').join(' ');
  return `# ${record.working_title}

This ${record.primary_keyword} review explains how to read the available evidence and its limits.

## Key Statistics and Data

The evidence summary uses [primary source one](https://sources.example/one), [primary source two](https://sources.example/two), and [primary source three](https://sources.example/three) near the claims they support.

${keywordLines}

## Evidence Review

${internal}

${filler}

## Practical Interpretation

Readers should compare the year, population, denominator, unit, and method before applying a reported measure. Source limitations remain part of the result.

## The Bottom Line

The evidence is useful when its scope and method remain visible. It should not support claims beyond the measured population or period.

## Resources

- [Primary Source One](https://sources.example/one)
- [Primary Source Two](https://sources.example/two)
- [Primary Source Three](https://sources.example/three)`;
}

export async function createContentFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'backlink-content-fixture-'));
  await Promise.all([cp('data', path.join(root, 'data'), { recursive: true }), mkdir(path.join(root, 'content/posts'), { recursive: true }), mkdir(path.join(root, 'content/research'), { recursive: true }), mkdir(path.join(root, 'assets'), { recursive: true })]);
  const [launch, links] = await Promise.all([readJson('data/launch-content-plan.json'), readJson('data/interlinking-plan.json')]);
  const record = launch.find(item => String(item.working_title).toLowerCase().includes(String(item.primary_keyword).toLowerCase()));
  const silo = links.find(item => item.type === record.type && item.content_number === record.content_number);
  const metadata = {
    title: record.working_title,
    seo_title: record.seo_title || `${record.primary_keyword} Evidence Review`,
    description: record.meta_description || `${record.primary_keyword} evidence, methods, limits, and interpretation for readers comparing current published measures.`,
    slug: record.url_slug,
    type: record.type.toLowerCase(),
    schema: 'Article',
    draft: false,
    tracker_id: `${record.type}:${record.content_number}`,
    primary_keyword: record.primary_keyword,
    cluster: record.cluster,
    research_record: `content/research/${record.type.toLowerCase()}-${record.content_number}.json`,
    author: 'Fixture Author',
    published: '2026-09-22',
    modified: '2026-09-22'
  };
  await writeJson(path.join(root, 'data/authors.json'), { fixture: { name: 'Fixture Author', verified: true, publishable: true } });
  const contentPath = path.join(root, 'content/posts/fixture.md');
  await writeFile(contentPath, `${frontMatter(metadata)}\n\n${publishableBody(record, silo)}\n`);
  const researchPath = path.join(root, metadata.research_record);
  await writeJson(researchPath, completeResearch(record, silo, metadata));
  return { root, record, silo, metadata, researchPath, contentPath };
}

// A launch-ready copy of the real site: real pages, all 20 tracker posts, and their research records.
// The real repository publishes Blog 1 and keeps the other 19 items as drafts; the fixture adds a
// production approval so tests exercise the launch policy rather than the missing sign-off.
export async function createLaunchFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'verdict-launch-fixture-'));
  await Promise.all(['data', 'content', 'src', 'assets'].map(dir => cp(dir, path.join(root, dir), { recursive: true })));
  const site = await readJson(path.join(root, 'data/site.json'));
  site.launch_status = 'ready'; site.verified_contact_details = true;
  await writeJson(path.join(root, 'data/site.json'), site);
  const release = await readJson(path.join(root, 'data/release.json'));
  for (const key of ['contact', 'privacy', 'staging_review']) Object.assign(release[key], { approved: true, reviewer: release[key].reviewer || 'Fixture Reviewer', reviewed_at: release[key].reviewed_at || '2026-09-20' });
  release.production_approval = { approved: true, reviewer: 'Release Reviewer', reviewed_at: '2026-09-22', change_reference: 'CHANGE-2026-001' };
  await writeJson(path.join(root, 'data/release.json'), release);
  return { root, posts: path.join(root, 'content/posts') };
}

// Finds the post file for a tracker id inside a fixture.
export async function postFile(root, trackerId) {
  const dir = path.join(root, 'content/posts');
  for (const name of await readdir(dir)) {
    const file = path.join(dir, name);
    if ((await readFile(file, 'utf8')).includes(`\ntracker_id: ${trackerId}\n`)) return file;
  }
  throw new Error(`no post for ${trackerId}`);
}

export async function setDraft(file, draft) {
  const text = await readFile(file, 'utf8');
  await writeFile(file, text.replace(/^draft: (?:true|false)$/m, `draft: ${draft}`));
}

// Publishes one more fully researched tracker item into a launch fixture, as a post-launch daily release would.
export async function publishFixtureArticle(root) {
  const [launch, links] = await Promise.all([readJson('data/launch-content-plan.json'), readJson('data/interlinking-plan.json')]);
  const record = launch.find(item => item.type === 'Article' && String(item.working_title).toLowerCase().includes(String(item.primary_keyword).toLowerCase()));
  const silo = links.find(item => item.type === record.type && item.content_number === record.content_number);
  const trackerId = `${record.type}:${record.content_number}`;
  const metadata = {
    title: record.working_title, seo_title: record.seo_title || `${record.primary_keyword} Evidence Review`,
    description: record.meta_description || `${record.primary_keyword} evidence, methods, limits, and interpretation for readers comparing current published measures.`,
    slug: record.url_slug, type: 'article', schema: 'Article', draft: false, tracker_id: trackerId, primary_keyword: record.primary_keyword,
    cluster: record.cluster, research_record: `content/research/article-${record.content_number}.json`, author: 'Fixture Author', published: '2026-09-22', modified: '2026-09-22'
  };
  await rm(await postFile(root, trackerId));
  const authors = await readJson(path.join(root, 'data/authors.json'));
  authors.fixture = { name: 'Fixture Author', verified: true, publishable: true };
  await writeJson(path.join(root, 'data/authors.json'), authors);
  await writeFile(path.join(root, 'content/posts/published-fixture.md'), `${frontMatter(metadata)}\n\n${publishableBody(record, silo)}\n`);
  await writeJson(path.join(root, metadata.research_record), completeResearch(record, silo, metadata));
  return { record, trackerId, slug: record.url_slug };
}

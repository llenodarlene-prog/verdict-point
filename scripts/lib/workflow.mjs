const clean = value => String(value ?? '').trim();
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
const dateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?Z$/;

export function normalizeHttpUrl(value) {
  try {
    const url = new URL(clean(value));
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    url.hash = '';
    return url.href;
  } catch { return null; }
}

export function isValidReviewDate(value, now = new Date()) {
  const text = clean(value);
  if (!dateOnly.test(text) && !dateTime.test(text)) return false;
  const parsed = new Date(dateOnly.test(text) ? `${text}T00:00:00.000Z` : text);
  if (Number.isNaN(parsed.valueOf())) return false;
  if (dateOnly.test(text) && parsed.toISOString().slice(0, 10) !== text) return false;
  return dateOnly.test(text) ? text <= now.toISOString().slice(0, 10) : parsed <= now;
}

export function compileKillPattern(term, scope = '') {
  const value = clean(term);
  if (!value) throw new Error('AI kill-list term cannot be empty');
  const pattern = value.split(/([XY])/).map(part => ['X', 'Y'].includes(part) ? '[^\\n]+?' : escapeRegex(part).replaceAll('\\ ', '\\s+')).join('');
  const prefix = '(?<![A-Za-z0-9])';
  const suffix = '(?![A-Za-z0-9])';
  return new RegExp(String(scope).toLowerCase().includes('title') && /[XY]/.test(value) ? `^${pattern}${suffix}` : `${prefix}${pattern}${suffix}`, 'iu');
}

const validPath = value => /^\/[A-Za-z0-9._~!$&'()*+,;=:@%\/-]*$/.test(value) && !value.includes('\\') && !value.includes('//');
const routePath = value => {
  const parsed = new URL(value, 'https://local.invalid');
  return parsed.pathname === '/' ? '/' : `${parsed.pathname.replace(/\/$/, '')}/`;
};

export function validateRedirects(records, generatedRoutes = []) {
  if (!Array.isArray(records)) throw new Error('data/redirects.json must be an array');
  const routes = new Set([...generatedRoutes].map(routePath));
  routes.add('/sitemap.xml/'); routes.add('/feed.xml/'); routes.add('/robots.txt/');
  const map = new Map();
  for (const [index, item] of records.entries()) {
    const from = clean(item.from);
    const to = clean(item.to);
    const status = Number(item.status || 301);
    const normalizedDestination = normalizeHttpUrl(to);
    if (normalizedDestination && new URL(normalizedDestination).protocol !== 'https:') throw new Error(`redirect ${from}: external destination must use HTTPS`);
    const externalUrl = normalizedDestination && new URL(normalizedDestination).protocol === 'https:' ? normalizedDestination : null;
    const external = Boolean(externalUrl);
    if (!validPath(from) || /[?#]/.test(from)) throw new Error(`redirect ${index + 1}: from must be a safe root-relative path without query or fragment`);
    if (!external && (!validPath(to) || /[?#]/.test(to))) throw new Error(`redirect ${from}: to must be a safe root-relative path or approved absolute HTTP(S) URL`);
    if (![301, 302, 307, 308].includes(status)) throw new Error(`redirect ${from}: unsupported status ${status}`);
    if (external) {
      const approval = item.external_approval;
      const destination = new URL(externalUrl);
      if (!approval || approval.approved !== true) throw new Error(`redirect ${from}: external destination requires explicit approval`);
      if (clean(approval.host).toLowerCase() !== destination.host.toLowerCase()) throw new Error(`redirect ${from}: external approval host does not match destination`);
      for (const field of ['purpose', 'reviewer']) if (!clean(approval[field])) throw new Error(`redirect ${from}: external approval missing ${field}`);
      if (!isValidReviewDate(approval.reviewed_at)) throw new Error(`redirect ${from}: external approval has an invalid or future reviewed_at date`);
    }
    const fromRoute = routePath(from);
    const toRoute = external ? externalUrl : routePath(to);
    if (fromRoute === toRoute || map.has(fromRoute)) throw new Error(`redirect ${from}: duplicate or self redirect`);
    if (routes.has(fromRoute)) throw new Error(`redirect ${from}: source collides with a generated route`);
    map.set(fromRoute, toRoute);
  }
  for (const start of map.keys()) {
    const seen = new Set([start]);
    let next = map.get(start);
    while (map.has(next)) {
      if (seen.has(next)) throw new Error(`redirect cycle includes ${start}`);
      seen.add(next); next = map.get(next);
    }
    if (!normalizeHttpUrl(next) && !routes.has(next)) throw new Error(`redirect ${start}: internal target does not resolve to a generated route (${next})`);
  }
  return records.map(item => `Redirect ${Number(item.status || 301)} ${clean(item.from)} ${clean(item.to)}`).join('\n');
}

export function assertUniqueRoute(route, file, routes) {
  if (routes.has(route)) throw new Error(`${file}: duplicate slug ${route} also used by ${routes.get(route)}`);
  routes.set(route, file);
}

export function createResearchScaffold(record, silo, frontMatter) {
  return {
    tracker_id: `${record.type}:${record.content_number}`, status: 'scaffolded', research_question: record.data_source_plan || '',
    research_brief: { purpose: '', audience: '', publication_year: '', data_period: '', scope_limitations: '' },
    keyword_research: {
      approved_primary_keyword: record.primary_keyword, intent: record.intent || '', serp_checked_at: '',
      tools: [{ name: 'Ubersuggest', status: 'pending', retrieved_at: '' }],
      queries: ['short-tail', 'long-tail', 'commercial', 'problem', 'question'].map(type => ({ keyword: '', type, volume: null, difficulty: null, cpc: null, intent: '', ranking_url: '', retrieved_at: '', tool: '' }))
    },
    sources: [{ url: '', title: '', publisher: '', source_type: '', year: '', published_at: '', accessed_at: '', scope: '', method: '', limitations: '', verified: false }],
    statistics: [{ claim: '', source_url: '', data_year: '', geography: '', population: '', sample: '', denominator: '', unit: '', method: '', limitations: '', sponsored: false, partial_year: false, estimate: false, verified: false }],
    competitors: Array.from({ length: 5 }, () => ({ title: '', url: '', publisher: '', format: '', updated_at: '', headings: [], coverage: [], sources: [], data_assets: [], link_patterns: [], trust_signals: [], covered_well: '', gaps: '' })),
    content_gaps: [], value_add: '',
    plan: {
      reader_title: record.working_title, seo_title: record.seo_title || record.working_title,
      meta_description: record.meta_description || frontMatter.description, slug: record.url_slug, search_intent: record.intent || '',
      secondary_keywords: [], outline: [], evidence_map: [], visuals: [], internal_links: silo.approved_outbound_targets,
      external_link_opportunities: [], excluded_claims: [], drafting_cautions: []
    },
    claims: [{ statement: '', source_url: '', verified: false }],
    fact_check: { completed: false, reviewer: '', reviewed_at: '' },
    qa: { completed: false, reviewer: '', reviewed_at: '' }
  };
}

function externalUrls(value) {
  const urls = [];
  for (const match of String(value).matchAll(/https?:\/\/[^\s<>()\]]+/giu)) {
    const normalized = normalizeHttpUrl(match[0].replace(/[.,;:!?]+$/g, ''));
    if (normalized) urls.push(normalized);
  }
  return [...new Set(urls)];
}

function linkedExternalUrls(value) {
  const urls = [];
  for (const match of String(value).matchAll(/\[[^\]]+\]\(<?(https?:\/\/[^\s>)]+)>?(?:\s+["'][^"']*["'])?\)/giu)) {
    const normalized = normalizeHttpUrl(match[1]);
    if (normalized) urls.push(normalized);
  }
  for (const match of String(value).matchAll(/<(https?:\/\/[^>]+)>/giu)) {
    const normalized = normalizeHttpUrl(match[1]);
    if (normalized) urls.push(normalized);
  }
  return [...new Set(urls)];
}

export function analyzeExternalLinks(body) {
  const resourcesOffset = body.search(/^##\s+Resources\s*$/m);
  const contextualBody = resourcesOffset < 0 ? body : body.slice(0, resourcesOffset);
  const linkedContextual = linkedExternalUrls(contextualBody);
  const linkedAll = linkedExternalUrls(body);
  const all = externalUrls(body);
  return {
    contextual: linkedContextual,
    all,
    bare: all.filter(url => !linkedAll.includes(url)),
    resources: resourcesOffset < 0 ? [] : linkedExternalUrls(body.slice(resourcesOffset))
  };
}

export function auditCitations(body, sources = [], claims = [], { minContextual = 2, maxContextual = 3 } = {}) {
  const { contextual, all, bare } = analyzeExternalLinks(body);
  const verified = new Set(sources.filter(source => source.verified === true).map(source => normalizeHttpUrl(source.url)).filter(Boolean));
  const contextualSet = new Set(contextual);
  const failures = [];
  if (contextual.length < minContextual || contextual.length > maxContextual) failures.push(`needs ${minContextual}-${maxContextual} distinct contextual external source links before Resources; found ${contextual.length}`);
  for (const url of bare) failures.push(`bare external URL must use a descriptive Markdown link (${url})`);
  for (const url of all) if (!verified.has(url)) failures.push(`external link is absent from verified research sources (${url})`);
  for (const claim of claims) {
    const source = normalizeHttpUrl(claim.source_url);
    if (claim.verified === true && (!source || !contextualSet.has(source))) failures.push(`verified claim source is not cited contextually (${claim.source_url})`);
  }
  return failures;
}

const arrayHasContent = value => Array.isArray(value) && value.length > 0;
const validYear = value => /^\d{4}(?:[-–]\d{2,4})?$/.test(clean(value)) || /^not applicable$/i.test(clean(value));
const validEvidenceDate = (value, now) => isValidReviewDate(value, now) || /^(not stated|not applicable)$/i.test(clean(value));

export function validateResearchRecord(research, { record, silo, metadata = null, requireVerified = false, now = new Date() } = {}) {
  const failures = [];
  const fail = message => failures.push(message);
  if (!research || typeof research !== 'object' || Array.isArray(research)) return ['research record must be a JSON object'];
  const expectedId = record ? `${record.type}:${record.content_number}` : null;
  if (expectedId && research.tracker_id !== expectedId) fail(`research tracker_id must equal ${expectedId}`);
  const stages = ['scaffolded', 'researched', 'planned', 'verified'];
  if (!stages.includes(research.status)) fail(`research status must be one of ${stages.join(', ')}`);
  if (requireVerified && research.status !== 'verified') fail('research status must be verified for publication');
  const stage = Math.max(0, stages.indexOf(research.status));
  const fullResearch = requireVerified || stage >= 1;
  const fullPlan = requireVerified || stage >= 2;
  const fullSignoff = requireVerified || stage >= 3;

  for (const field of ['purpose', 'audience', 'publication_year', 'data_period', 'scope_limitations']) if (fullResearch && !clean(research.research_brief?.[field])) fail(`research brief missing ${field}`);
  if (clean(research.research_brief?.publication_year) && !validYear(research.research_brief.publication_year)) fail('research brief publication_year is invalid');
  if (record && research.keyword_research?.approved_primary_keyword !== record.primary_keyword) fail('keyword research does not preserve the tracker primary keyword');
  for (const field of ['intent', 'serp_checked_at']) if (fullResearch && !clean(research.keyword_research?.[field])) fail(`keyword research missing ${field}`);
  if (clean(research.keyword_research?.serp_checked_at) && !isValidReviewDate(research.keyword_research.serp_checked_at, now)) fail('keyword research serp_checked_at is invalid or future-dated');
  const tools = research.keyword_research?.tools || [];
  // Ubersuggest is the required platform. Historical Ahrefs entries are optional, kept with their attribution, and still date-checked.
  const ubersuggest = tools.find(item => item.name === 'Ubersuggest');
  if (!ubersuggest) fail('Ubersuggest keyword research entry is missing');
  else if (fullResearch && (ubersuggest.status !== 'verified' || !isValidReviewDate(ubersuggest.retrieved_at, now))) fail('Ubersuggest keyword research is not verified with a valid retrieval date');
  for (const tool of tools) {
    if (clean(tool.retrieved_at) && !isValidReviewDate(tool.retrieved_at, now)) fail(`${tool.name} retrieval date is invalid or future-dated`);
    else if (tool.name !== 'Ubersuggest' && tool.status === 'verified' && !clean(tool.retrieved_at)) fail(`${tool.name} is marked verified without a retrieval date`);
  }
  const queries = research.keyword_research?.queries || [];
  for (const type of ['short-tail', 'long-tail', 'commercial', 'problem', 'question']) if (!queries.some(item => item.type === type)) fail(`keyword research missing a ${type} query`);
  for (const [index, query] of queries.entries()) {
    if (!fullResearch && !clean(query.keyword)) continue;
    for (const field of ['keyword', 'type', 'intent', 'ranking_url', 'retrieved_at', 'tool']) if (!clean(query[field])) fail(`keyword query ${index + 1} missing ${field}`);
    if (clean(query.ranking_url) && !normalizeHttpUrl(query.ranking_url)) fail(`keyword query ${index + 1} has an invalid ranking_url`);
    if (clean(query.retrieved_at) && !isValidReviewDate(query.retrieved_at, now)) fail(`keyword query ${index + 1} has an invalid or future retrieval date`);
    for (const [field, limits] of Object.entries({ volume: [0, Infinity], difficulty: [0, 100], cpc: [0, Infinity] })) {
      const value = query[field];
      if (typeof value !== 'number' || !Number.isFinite(value) || value < limits[0] || value > limits[1]) fail(`keyword query ${index + 1} has invalid ${field}`);
    }
  }

  const sources = research.sources || [];
  if (fullResearch && (!Array.isArray(sources) || sources.length < 3)) fail('research record needs at least three sources');
  const sourceUrls = new Set();
  for (const [index, source] of sources.entries()) {
    if (!fullResearch && !clean(source.url)) continue;
    for (const field of ['url', 'title', 'publisher', 'source_type', 'year', 'published_at', 'accessed_at', 'scope', 'method', 'limitations']) if (!clean(source[field])) fail(`research source ${index + 1} missing ${field}`);
    const url = normalizeHttpUrl(source.url);
    if (!url) fail(`research source ${index + 1} has an invalid URL`);
    else if (sourceUrls.has(url)) fail(`research source ${index + 1} duplicates another source URL`);
    else sourceUrls.add(url);
    if (clean(source.year) && !validYear(source.year)) fail(`research source ${index + 1} has an invalid year`);
    if (clean(source.published_at) && !validEvidenceDate(source.published_at, now)) fail(`research source ${index + 1} has an invalid published_at date`);
    if (clean(source.accessed_at) && !isValidReviewDate(source.accessed_at, now)) fail(`research source ${index + 1} has an invalid or future accessed_at date`);
    if (fullResearch && source.verified !== true) fail(`research source ${index + 1} is not verified`);
  }

  const statistics = research.statistics || [];
  if (fullResearch && !arrayHasContent(statistics)) fail('research record needs at least one fully specified statistic or measured fact');
  for (const [index, statistic] of statistics.entries()) {
    if (!fullResearch && !clean(statistic.claim)) continue;
    for (const field of ['claim', 'source_url', 'data_year', 'geography', 'population', 'sample', 'denominator', 'unit', 'method', 'limitations']) if (!clean(statistic[field])) fail(`statistic ${index + 1} missing ${field}`);
    const source = normalizeHttpUrl(statistic.source_url);
    if (!source || !sourceUrls.has(source)) fail(`statistic ${index + 1} source_url does not match a verified research source`);
    if (clean(statistic.data_year) && !validYear(statistic.data_year)) fail(`statistic ${index + 1} has an invalid data_year`);
    for (const field of ['sponsored', 'partial_year', 'estimate', 'verified']) if (typeof statistic[field] !== 'boolean') fail(`statistic ${index + 1} missing boolean ${field}`);
    if (fullResearch && statistic.verified !== true) fail(`statistic ${index + 1} is not verified`);
  }

  const competitors = research.competitors || [];
  if (fullResearch && (!Array.isArray(competitors) || competitors.length < 5)) fail('research record needs five competitor reviews');
  const competitorUrls = new Set();
  for (const [index, competitor] of competitors.entries()) {
    if (!fullResearch && !clean(competitor.url)) continue;
    for (const field of ['title', 'url', 'publisher', 'format', 'updated_at', 'covered_well', 'gaps']) if (!clean(competitor[field])) fail(`competitor ${index + 1} missing ${field}`);
    const url = normalizeHttpUrl(competitor.url);
    if (!url) fail(`competitor ${index + 1} has an invalid URL`);
    else if (competitorUrls.has(url)) fail(`competitor ${index + 1} duplicates another competitor URL`);
    else competitorUrls.add(url);
    if (clean(competitor.updated_at) && !validEvidenceDate(competitor.updated_at, now)) fail(`competitor ${index + 1} has an invalid updated_at date`);
    for (const field of ['headings', 'coverage', 'sources', 'data_assets', 'link_patterns', 'trust_signals']) if (!arrayHasContent(competitor[field])) fail(`competitor ${index + 1} missing ${field}`);
  }
  if (fullResearch && (!arrayHasContent(research.content_gaps) || !clean(research.value_add))) fail('research record needs content gaps and value-add');

  const plan = research.plan || {};
  if (fullPlan) {
    for (const field of ['reader_title', 'seo_title', 'meta_description', 'slug', 'search_intent']) if (!clean(plan[field])) fail(`content plan missing ${field}`);
    for (const field of ['secondary_keywords', 'outline', 'evidence_map', 'visuals', 'internal_links', 'external_link_opportunities', 'excluded_claims', 'drafting_cautions']) if (!arrayHasContent(plan[field])) fail(`content plan missing ${field}`);
  }
  if (record && clean(plan.slug) && plan.slug !== record.url_slug) fail('content plan slug differs from tracker');
  if (metadata && fullPlan && (plan.seo_title !== metadata.seo_title || plan.meta_description !== metadata.description)) fail('content plan SEO fields differ from the draft');
  if (silo && Array.isArray(plan.internal_links)) {
    const actual = [...plan.internal_links].sort();
    const expected = [...silo.approved_outbound_targets].sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) fail('content plan internal links differ from tracker approvals');
  }

  const claims = research.claims || [];
  if (fullResearch && !arrayHasContent(claims)) fail('research record needs verified material claims');
  for (const [index, claim] of claims.entries()) {
    if (!fullResearch && !clean(claim.statement)) continue;
    const source = normalizeHttpUrl(claim.source_url);
    if (!clean(claim.statement) || !source || !sourceUrls.has(source) || (fullResearch && claim.verified !== true)) fail(`claim ${index + 1} is incomplete, unverified, or not tied to a verified source`);
  }
  for (const [name, signoff] of [['fact-check', research.fact_check], ['research QA', research.qa]]) {
    if (fullSignoff && (signoff?.completed !== true || !clean(signoff?.reviewer) || !isValidReviewDate(signoff?.reviewed_at, now))) fail(`${name} sign-off is incomplete or has an invalid date`);
    else if (clean(signoff?.reviewed_at) && !isValidReviewDate(signoff.reviewed_at, now)) fail(`${name} sign-off has an invalid or future date`);
  }
  return [...new Set(failures)];
}

// Commands that only print or search their arguments and never execute them.
const nonExecutingCommands = new Set(['echo', 'printf', 'grep', 'egrep', 'fgrep', 'rg', 'cat', 'head', 'tail', 'wc', 'ls']);

export function isProtectedPush(command, currentBranch = '') {
  const normalized = clean(command).replace(/\\\r?\n/g, ' ');
  const segments = normalized.split(/(?:&&|\|\||[;\n])/);
  // A pipe into a shell or eval can run text that looks harmless on its own.
  const pipesIntoShell = /\|\s*(?:\S*\/)?(?:ba|z|da|k)?sh\b|\|\s*(?:eval|xargs|source)\b/i.test(normalized);
  // `push` must be its own shell word, so `.push(` and `block-protected-push.sh` do not count.
  const pushWord = /(?:^|\s)['"]?push['"]?(?=\s|$)/i;
  for (const segment of segments) {
    const leading = segment.trim().split(/\s+/)[0]?.replace(/^.*\//, '').toLowerCase() || '';
    if (!pipesIntoShell && nonExecutingCommands.has(leading) && !/[`]|\$\(|[<>]\(/.test(segment)) continue;
    const match = segment.match(/(?:^|[\s\/'"])git['"]?(?=\s|$)([\s\S]*?)(?:^|\s)['"]?push['"]?(?=\s|$)([\s\S]*)$/i);
    if (!match) {
      if (pushWord.test(segment) && /[\\`$(){}*?\[\]]/.test(segment)) return true;
      continue;
    }
    const after = match[2];
    if (/[\\`$(){}*?\[\]]|''|""/.test(segment) || /['"][^'"\s]+['"][^\s]|[^\s]['"][^'"\s]+['"]/.test(segment)) return true;
    if (/(?:^|\s)--(?:all|mirror)(?:\s|$)/.test(after)) return true;
    const tokens = after.trim().split(/\s+/).map(token => token.replace(/^['"]|['"]$/g, '')).filter(Boolean);
    const refs = tokens.filter(token => !token.startsWith('-') && !/^(?:origin|upstream|github)$/i.test(token));
    for (const token of refs) {
      const unforced = token.replace(/^\+/, '');
      const destination = unforced.includes(':') ? unforced.split(':').at(-1) : unforced;
      const short = destination.replace(/^refs\/heads\//i, '');
      if (/^(?:main|staging)$/i.test(short)) return true;
    }
    if (!refs.length && ['main', 'staging'].includes(clean(currentBranch).toLowerCase())) return true;
  }
  return false;
}

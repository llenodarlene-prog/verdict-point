import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { assertUniqueRoute, auditCitations, compileKillPattern, createResearchScaffold, isProtectedPush, validateRedirects, validateResearchRecord } from '../scripts/lib/workflow.mjs';

test('dynamic and literal AI kill-list patterns match intended text', () => {
  assert.equal(compileKillPattern('why X matters', 'Titles').test('Why Investing Matters'), true);
  assert.equal(compileKillPattern('Company Deep Dive: X', 'Titles').test('Company Deep Dive: Stripe'), true);
  assert.equal(compileKillPattern('why X matters', 'Titles').test('Why Investing Matters in 2026'), true);
  assert.equal(compileKillPattern('not just X, but Y', 'All content').test('Not just speed, but accuracy'), true);
  assert.equal(compileKillPattern('Overall,', 'All content').test('Overall, the result holds.'), true);
  assert.equal(compileKillPattern('delve', 'All content').test('We delve into it.'), true);
  assert.equal(compileKillPattern('why X matters', 'Titles').test('Why Matters'), false);
});

test('redirects resolve to generated routes and reject missing targets, cycles, and collisions', () => {
  assert.match(validateRedirects([{ from: '/old/', to: '/investing/', status: 301 }], ['/', '/investing/']), /Redirect 301/);
  assert.match(validateRedirects([{ from: '/older/', to: '/old/' }, { from: '/old/', to: '/investing/' }], ['/', '/investing/']), /older/);
  assert.throws(() => validateRedirects([{ from: '/old/', to: '/missing/' }], ['/']), /does not resolve/);
  assert.throws(() => validateRedirects([{ from: '/a/', to: '/b/' }, { from: '/b/', to: '/a/' }], ['/']), /cycle/);
  assert.throws(() => validateRedirects([{ from: '/investing/', to: '/' }], ['/', '/investing/']), /collides/);
  assert.throws(() => validateRedirects([{ from: '/old/', to: 'https://outside.example/' }], ['/']), /explicit approval/);
  assert.throws(() => validateRedirects([{ from: '/old/', to: 'http://outside.example/', external_approval: { approved: true } }], ['/']), /must use HTTPS/);
  assert.match(validateRedirects([{ from: '/old/', to: 'https://outside.example/', external_approval: { approved: true, host: 'outside.example', purpose: 'Approved domain move', reviewer: 'Release Reviewer', reviewed_at: '2026-09-20' } }], ['/']), /outside\.example/);
});

test('duplicate source routes are rejected before output is written', () => {
  const routes = new Map();
  assertUniqueRoute('/about/', 'about.md', routes);
  assert.throws(() => assertUniqueRoute('/about/', 'copy.md', routes), /duplicate slug/);
});

test('protected push analysis covers git global options and protected refs', () => {
  assert.equal(isProtectedPush('git push origin main', 'feature/test'), true);
  assert.equal(isProtectedPush('git -C /tmp/repo push origin HEAD:refs/heads/staging', 'feature/test'), true);
  assert.equal(isProtectedPush('git push --mirror origin', 'feature/test'), true);
  assert.equal(isProtectedPush('git push origin', 'main'), true);
  assert.equal(isProtectedPush('git push origin feature/test', 'feature/test'), false);
  assert.equal(isProtectedPush('git status', 'main'), false);
  assert.equal(isProtectedPush('/usr/bin/git push origin main', 'feature/test'), true);
  assert.equal(isProtectedPush("git push origin HEAD:refs/heads/ma''in", 'feature/test'), true);
  assert.equal(isProtectedPush('git push origin HEAD:refs/heads/ma${SAFE}in', 'feature/test'), true);
  assert.equal(isProtectedPush('git push origin HEAD:refs/heads/$(printf main)', 'feature/test'), true);
  assert.equal(isProtectedPush('git push origin ma\\in', 'feature/test'), true);
  assert.equal(isProtectedPush('$(command -v git) push origin main', 'feature/test'), true);
  assert.equal(isProtectedPush('bash -c "git push origin main"', 'feature/test'), true);
  assert.equal(isProtectedPush('echo "git push origin main" | bash', 'feature/test'), true);
  assert.equal(isProtectedPush('$G "push" origin main', 'feature/test'), true);
});

const pushHook = '.claude/hooks/block-protected-push.sh';
// Windows cannot execute a shell script directly, so run it through bash there; elsewhere execute it as-is.
const runPushHook = input => process.platform === 'win32'
  ? spawnSync('bash', [pushHook], { input, encoding: 'utf8' })
  : spawnSync(pushHook, { input, encoding: 'utf8' });

test('protected push hook fails closed and blocks executable-path and shell-construction bypasses', () => {
  for (const command of ['git -C . push origin main', '/usr/bin/git push origin main', "git push origin HEAD:refs/heads/ma''in", 'git push origin HEAD:refs/heads/ma${SAFE}in', 'git push origin HEAD:refs/heads/$(printf main)', 'git push origin ma\\in', '$(command -v git) push origin main', 'bash -c "git push origin staging"']) {
    const bypass = runPushHook(JSON.stringify({ tool_input: { command } }));
    assert.equal(bypass.status, 2, command);
  }
  const invalid = runPushHook('{broken');
  assert.equal(invalid.status, 2);
});

test('protected push guard allows application code, its own filename, documentation strings, and local scripts', () => {
  const allowed = [
    'node -e "const hunks = []; hunks.push({ at: 1 }); console.log(hunks.length)"',
    `node -e "require('child_process').spawnSync('${pushHook}', { input: '{}' })"`,
    `cat ${pushHook}`,
    'echo "Never run git push origin main"',
    'grep -n "git push origin staging" docs/CONTENT-WORKFLOW.md',
    'bash scratchpad/headtest.sh',
    'git log --grep push-guard'
  ];
  for (const command of allowed) {
    assert.equal(isProtectedPush(command, 'feature/test'), false, command);
    assert.equal(runPushHook(JSON.stringify({ tool_input: { command } })).status, 0, command);
  }
});

test('research scaffold includes the complete research-first evidence model', () => {
  const record = { type: 'Article', content_number: '1', primary_keyword: 'test statistics', working_title: 'Test Statistics', url_slug: '/test/', intent: 'Informational' };
  const research = createResearchScaffold(record, { approved_outbound_targets: ['/target/'] }, { description: 'test statistics description' });
  assert.deepEqual(research.keyword_research.tools.map(item => item.name), ['Ubersuggest']);
  assert.deepEqual(research.keyword_research.queries.map(item => item.type), ['short-tail', 'long-tail', 'commercial', 'problem', 'question']);
  assert.equal(research.competitors.length, 5);
  assert.equal(research.status, 'scaffolded');
  for (const field of ['statistics', 'content_gaps', 'plan', 'claims', 'fact_check', 'qa']) assert.ok(Object.hasOwn(research, field));
  for (const field of ['outline', 'evidence_map', 'visuals', 'internal_links', 'external_link_opportunities', 'excluded_claims', 'drafting_cautions']) assert.ok(Array.isArray(research.plan[field]));
});

test('Resources links cannot substitute for two or three contextual verified citations', () => {
  const body = '# Title\n\nIntro.\n\n## Resources\n\n- [One](https://one.example/)\n- [Two](https://two.example/)\n- [Three](https://three.example/)';
  const sources = ['one', 'two', 'three'].map(name => ({ url: `https://${name}.example/`, verified: true }));
  assert.ok(auditCitations(body, sources, []).some(message => message.includes('found 0')));
  const contextual = '# Title\n\n[One](https://one.example/) and [Two](https://two.example/) plus [Three](https://three.example/).\n\n## Resources';
  assert.deepEqual(auditCitations(contextual, sources, [{ statement: 'Claim', source_url: 'https://one.example/', verified: true }]), []);
  assert.ok(auditCitations(contextual, sources, [{ statement: 'Claim', source_url: 'https://four.example/', verified: true }]).some(message => message.includes('not cited contextually')));
  const bare = `${contextual}\nBare URL https://evil.example/path`;
  assert.ok(auditCitations(bare, sources, []).some(message => message.includes('bare external URL')));
  const tooMany = '# Title\n\n[A](https://a.example/) [B](https://b.example/) [C](https://c.example/) [D](https://d.example/)\n\n## Resources';
  const fourSources = ['a', 'b', 'c', 'd'].map(name => ({ url: `https://${name}.example/`, verified: true }));
  assert.ok(auditCitations(tooMany, fourSources, []).some(message => message.includes('found 4')));
});

test('research validation rejects malformed evidence relationships and duplicate competitors', () => {
  const record = { type: 'Article', content_number: '1', primary_keyword: 'test statistics', working_title: 'Test Statistics', url_slug: '/test/', intent: 'Informational' };
  const silo = { approved_outbound_targets: ['/target/'] };
  const research = createResearchScaffold(record, silo, { description: 'test statistics description' });
  research.status = 'researched';
  const failures = validateResearchRecord(research, { record, silo, now: new Date('2026-09-23T23:59:59Z') });
  assert.ok(failures.some(message => message.includes('research brief missing purpose')));
  research.sources = [{ url: 'not-a-url', title: 'Source', publisher: 'Publisher', source_type: 'Report', year: '2025', published_at: '2025-01-01', accessed_at: '2026-09-20', scope: 'Scope', method: 'Method', limitations: 'Limits', verified: true }];
  assert.ok(validateResearchRecord(research, { record, silo }).some(message => message.includes('invalid URL')));
});

test('keyword research requires Ubersuggest and keeps historical Ahrefs data optional', () => {
  const record = { type: 'Article', content_number: '1', primary_keyword: 'test statistics', working_title: 'Test Statistics', url_slug: '/test/', intent: 'Informational' };
  const silo = { approved_outbound_targets: ['/target/'] };
  const now = new Date('2026-09-23T23:59:59Z');
  const toolFailures = research => validateResearchRecord(research, { record, silo, now }).filter(message => /Ubersuggest|Ahrefs/.test(message));
  const research = createResearchScaffold(record, silo, { description: 'test statistics description' });
  research.status = 'researched';
  research.keyword_research.tools = [{ name: 'Ubersuggest', status: 'verified', retrieved_at: '2026-09-20' }];
  assert.deepEqual(toolFailures(research), []);
  research.keyword_research.tools.push({ name: 'Ahrefs', status: 'verified', retrieved_at: '2026-09-18' });
  assert.deepEqual(toolFailures(research), []);
  research.keyword_research.tools[1].retrieved_at = '2027-01-01';
  assert.ok(toolFailures(research).some(message => message.includes('Ahrefs retrieval date')));
  research.keyword_research.tools = [{ name: 'Ahrefs', status: 'verified', retrieved_at: '2026-09-18' }];
  assert.ok(toolFailures(research).some(message => message.includes('Ubersuggest keyword research entry is missing')));
});

test('release manifest defines a launch policy and keeps the 20-item plan as backlog', async () => {
  const [release, launch, nav] = await Promise.all([
    readFile('data/release.json', 'utf8').then(JSON.parse),
    readFile('data/launch-content-plan.json', 'utf8').then(JSON.parse),
    readFile('data/navigation.json', 'utf8').then(JSON.parse)
  ]);
  assert.equal(release.schema_version, 2);
  assert.equal(launch.length, 20, 'the original 20-item editorial plan is preserved');
  assert.equal('required_content_ids' in release, false, 'no fixed launch-set requirement');
  const policy = release.launch_policy;
  assert.equal(policy.minimum_published_blogs, 1);
  for (const item of [...nav.primary, ...nav.footer].filter(entry => entry.url.endsWith('/'))) assert.ok(policy.required_pages.includes(item.url), item.url);
  assert.ok(policy.required_pages.includes('/privacy/') && policy.legal_pages.includes('/privacy/'));
  assert.ok(policy.publication_cadence.trim());
});

test('build copies public assets and emits root server configuration', async () => {
  for (const name of ['horizontal', 'vertical', 'icon', 'social']) assert.ok(await stat(`dist/assets/brand/verdict-point-${name}.png`));
  await assert.rejects(stat('dist/assets/brand/verdict-point-brand-guidelines.png'));
  await assert.rejects(stat('dist/assets/brand/README.md'));
  await assert.rejects(stat('dist/assets/images/README.md'));
  assert.ok(await stat('dist/.htaccess'));
  await assert.rejects(stat('dist/static/.htaccess'));
});

test('workflow actions use immutable SHA pins and production runs the release gate', async () => {
  const files = ['.github/workflows/check.yml', '.github/workflows/deploy-staging.yml', '.github/workflows/deploy-production.yml'];
  for (const file of files) {
    const yaml = await readFile(file, 'utf8');
    for (const line of yaml.match(/^\s*- uses:.+$/gm) || []) assert.match(line, /@[0-9a-f]{40}(?:\s+#.*)?$/);
  }
  const production = await readFile('.github/workflows/deploy-production.yml', 'utf8');
  assert.match(production, /npm run release:check && BUILD_ENV=production npm run verify/);
  const rollback = await readFile('.github/workflows/rollback.yml', 'utf8');
  assert.match(rollback, /\^release-\[a-f0-9\]\{40\}\$/);
});

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
});

test('protected push hook fails closed and blocks executable-path and shell-construction bypasses', () => {
  const hook = '.claude/hooks/block-protected-push.sh';
  for (const command of ['git -C . push origin main', '/usr/bin/git push origin main', "git push origin HEAD:refs/heads/ma''in", 'git push origin HEAD:refs/heads/ma${SAFE}in', 'git push origin HEAD:refs/heads/$(printf main)', 'git push origin ma\\in', '$(command -v git) push origin main']) {
    const bypass = spawnSync(hook, { input: JSON.stringify({ tool_input: { command } }), encoding: 'utf8' });
    assert.equal(bypass.status, 2, command);
  }
  const invalid = spawnSync(hook, { input: '{broken', encoding: 'utf8' });
  assert.equal(invalid.status, 2);
});

test('research scaffold includes the complete research-first evidence model', () => {
  const record = { type: 'Article', content_number: '1', primary_keyword: 'test statistics', working_title: 'Test Statistics', url_slug: '/test/', intent: 'Informational' };
  const research = createResearchScaffold(record, { approved_outbound_targets: ['/target/'] }, { description: 'test statistics description' });
  assert.deepEqual(research.keyword_research.tools.map(item => item.name), ['Ahrefs', 'Ubersuggest']);
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

test('release manifest covers the complete launch set', async () => {
  const [release, launch] = await Promise.all([
    readFile('data/release.json', 'utf8').then(JSON.parse),
    readFile('data/launch-content-plan.json', 'utf8').then(JSON.parse)
  ]);
  assert.deepEqual([...release.required_content_ids].sort(), launch.map(item => `${item.type}:${item.content_number}`).sort());
  assert.equal(release.required_content_ids.length, 20);
});

test('build copies public assets and emits root server configuration', async () => {
  assert.ok(await stat('dist/assets/images/README.md'));
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

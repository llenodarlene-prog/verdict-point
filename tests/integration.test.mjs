import assert from 'node:assert/strict';
import { cp, mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { createContentFixture, createLaunchFixture, postFile, publishFixtureArticle, setDraft } from './fixtures.mjs';

const run = (script, cwd) => spawnSync(process.execPath, [path.resolve(script)], { cwd, encoding: 'utf8' });

test('complete publishable article and verified research record pass the real validators', async () => {
  const fixture = await createContentFixture();
  try {
    const research = run('scripts/check-research.mjs', fixture.root);
    assert.equal(research.status, 0, research.stderr);
    assert.match(research.stdout, /Validated 1 research records linked to 1 article\/blog drafts/);
    const content = run('scripts/check-content.mjs', fixture.root);
    assert.equal(content.status, 0, content.stderr);
    assert.match(content.stdout, /Validated 1 published content items/);
  } finally { await rm(fixture.root, { recursive: true, force: true }); }
});

test('real content validator rejects a broken source relationship', async () => {
  const fixture = await createContentFixture();
  try {
    const research = JSON.parse(await readFile(fixture.researchPath, 'utf8'));
    research.statistics[0].source_url = 'https://unverified.example/statistic';
    await writeFile(fixture.researchPath, JSON.stringify(research, null, 2) + '\n');
    const result = run('scripts/check-content.mjs', fixture.root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /does not match a verified research source/);
  } finally { await rm(fixture.root, { recursive: true, force: true }); }
});

test('draft content research is validated by the normal research gate', async () => {
  const fixture = await createContentFixture();
  try {
    const content = (await readFile(fixture.contentPath, 'utf8')).replace('draft: false', 'draft: true');
    await writeFile(fixture.contentPath, content);
    const research = JSON.parse(await readFile(fixture.researchPath, 'utf8'));
    research.status = 'researched';
    research.research_brief.purpose = '';
    await writeFile(fixture.researchPath, JSON.stringify(research, null, 2) + '\n');
    const result = run('scripts/check-research.mjs', fixture.root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /research brief missing purpose/);
  } finally { await rm(fixture.root, { recursive: true, force: true }); }
});

test('real content validator enforces medium-severity AI terms', async () => {
  const fixture = await createContentFixture();
  try {
    const content = (await readFile(fixture.contentPath, 'utf8')).replace('Careful evidence', 'Robust evidence');
    await writeFile(fixture.contentPath, content);
    const result = run('scripts/check-content.mjs', fixture.root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /medium-severity AI kill-list phrase or pattern "robust"/);
  } finally { await rm(fixture.root, { recursive: true, force: true }); }
});

test('research gate rejects invalid dates, metric ranges, and duplicate competitors', async () => {
  const mutations = [
    { message: /future accessed_at date/, apply: research => { research.sources[0].accessed_at = '2099-01-01'; } },
    { message: /invalid difficulty/, apply: research => { research.keyword_research.queries[0].difficulty = 101; } },
    { message: /duplicates another competitor URL/, apply: research => { research.competitors[1].url = research.competitors[0].url; } }
  ];
  for (const mutation of mutations) {
    const fixture = await createContentFixture();
    try {
      const research = JSON.parse(await readFile(fixture.researchPath, 'utf8'));
      mutation.apply(research);
      await writeFile(fixture.researchPath, JSON.stringify(research, null, 2) + '\n');
      const result = run('scripts/check-research.mjs', fixture.root);
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, mutation.message);
    } finally { await rm(fixture.root, { recursive: true, force: true }); }
  }
});

const env = (cwd, BUILD_ENV) => spawnSync(process.execPath, [path.resolve('scripts/build.mjs')], { cwd, encoding: 'utf8', env: { ...process.env, BUILD_ENV } });
const check = (cwd, BUILD_ENV) => spawnSync(process.execPath, [path.resolve('scripts/check.mjs')], { cwd, encoding: 'utf8', env: { ...process.env, BUILD_ENV } });
const draftRoutes = async root => {
  const routes = [];
  for (const name of await readdir(path.join(root, 'content/posts'))) {
    const head = (await readFile(path.join(root, 'content/posts', name), 'utf8')).split('\n---\n')[0];
    if (/^draft: true$/m.test(head)) routes.push(head.match(/^slug: (\S+)$/m)[1]);
  }
  return routes;
};
const withLaunch = async body => { const fixture = await createLaunchFixture(); try { await body(fixture); } finally { await rm(fixture.root, { recursive: true, force: true }); } };

test('completed pages plus one valid published blog pass the launch gate while 19 drafts remain', () => withLaunch(async ({ root }) => {
  const drafts = await draftRoutes(root);
  assert.ok(drafts.length >= 19, `expected at least 19 drafts, found ${drafts.length}`);
  const result = run('scripts/check-release.mjs', root);
  assert.equal(result.status, 0, result.stderr);
  const backlog = JSON.parse(await readFile(path.join(root, 'data/launch-content-plan.json'), 'utf8')).length;
  assert.match(result.stdout, new RegExp(`including 1 blog\\(s\\); ${backlog - 1} backlog item\\(s\\) remain drafts`));
}));

test('completed pages with zero published blogs fail the launch gate', () => withLaunch(async ({ root }) => {
  await setDraft(await postFile(root, 'Blog:1'), true);
  const result = run('scripts/check-release.mjs', root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /launch requires at least 1 published blog\(s\); found 0/);
}));

test('an incomplete or invalid published blog fails the launch gate', () => withLaunch(async ({ root }) => {
  const file = await postFile(root, 'Blog:1');
  await writeFile(file, (await readFile(file, 'utf8')).replace(/^## Key Takeaways$/m, '## Summary Points').replace(/^author: .+$/m, 'author: Unknown Writer'));
  const result = run('scripts/check-release.mjs', root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /check-content\.mjs failed for published content/);
  assert.match(result.stderr, /first H2 must be Key Takeaways/);
  assert.match(result.stderr, /author must match a verified, publishable author record/);
  const research = path.join(root, 'content/research/blog-1.json');
  await writeFile(file, (await readFile(file, 'utf8')).replace('## Summary Points', '## Key Takeaways').replace('author: Unknown Writer', 'author: Darlene Aberin'));
  const record = JSON.parse(await readFile(research, 'utf8'));
  record.fact_check = { completed: false, reviewer: '', reviewed_at: '' };
  await writeFile(research, JSON.stringify(record, null, 2) + '\n');
  assert.match(run('scripts/check-release.mjs', root).stderr, /fact-check sign-off is incomplete/);
}));

test('missing or draft core pages fail the launch gate', () => withLaunch(async ({ root }) => {
  await setDraft(path.join(root, 'content/pages/privacy.md'), true);
  await rm(path.join(root, 'content/pages/about.md'));
  const result = run('scripts/check-release.mjs', root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /required page \/privacy\/ is still a draft/);
  assert.match(result.stderr, /required page \/about\/ does not exist/);
}));

test('production build excludes drafts from pages, links, listings, sitemap, RSS, and structured data', () => withLaunch(async ({ root }) => {
  const built = env(root, 'production');
  assert.equal(built.status, 0, built.stderr);
  const verified = check(root, 'production');
  assert.equal(verified.status, 0, verified.stderr);
  const dist = path.join(root, 'dist');
  const drafts = await draftRoutes(root);
  const [sitemap, feed, home, hub, blog] = await Promise.all(['sitemap.xml', 'feed.xml', 'index.html', 'legal-tech/index.html', 'legal-tech/clio-legal-software-total-cost/index.html'].map(file => readFile(path.join(dist, file), 'utf8')));
  for (const route of drafts) {
    await assert.rejects(stat(path.join(dist, route, 'index.html')), route);
    assert.equal(sitemap.includes(route), false, `sitemap ${route}`);
    assert.equal(feed.includes(route), false, `feed ${route}`);
    for (const html of [home, hub, blog]) assert.equal(html.includes(`href="${route}"`), false, `link ${route}`);
  }
  assert.match(sitemap, /clio-legal-software-total-cost/);
  assert.match(feed, /clio-legal-software-total-cost/);
  assert.match(hub, /href="\/legal-tech\/clio-legal-software-total-cost\/"/);
  assert.match(blog, /<span class="pending-link">legal technology statistics<\/span>/);
  for (const html of [home, hub]) assert.match(html, /<meta name="robots" content="index,follow">/);
  const nav = JSON.parse(await readFile(path.join(root, 'data/navigation.json'), 'utf8'));
  for (const item of nav.primary) assert.equal(drafts.includes(item.url), false, item.url);
}));

test('a second valid published item after launch passes without requiring all 20', () => withLaunch(async ({ root }) => {
  const { slug } = await publishFixtureArticle(root);
  const result = run('scripts/check-release.mjs', root);
  assert.equal(result.status, 0, result.stderr);
  const backlog = JSON.parse(await readFile(path.join(root, 'data/launch-content-plan.json'), 'utf8')).length;
  assert.match(result.stdout, new RegExp(`2 published item\\(s\\) including 1 blog\\(s\\); ${backlog - 2} backlog item\\(s\\) remain drafts`));
  assert.equal(env(root, 'production').status, 0);
  assert.equal(check(root, 'production').status, 0);
  await stat(path.join(root, 'dist', slug, 'index.html'));
}));

test('staging builds keep drafts available but noindex', () => withLaunch(async ({ root }) => {
  assert.equal(env(root, 'staging').status, 0);
  const verified = check(root, 'staging');
  assert.equal(verified.status, 0, verified.stderr);
  const [draft] = await draftRoutes(root);
  const html = await readFile(path.join(root, 'dist', draft, 'index.html'), 'utf8');
  assert.match(html, /<meta name="robots" content="noindex,nofollow,noarchive">/);
  const home = await readFile(path.join(root, 'dist/index.html'), 'utf8');
  assert.match(home, /<meta name="robots" content="noindex,nofollow,noarchive">/);
  assert.doesNotMatch(await readFile(path.join(root, 'dist/sitemap.xml'), 'utf8'), new RegExp(draft));
}));

const runDated = (script, cwd, PUBLISH_DATE, BUILD_ENV = 'production') => spawnSync(process.execPath, [path.resolve(script)], { cwd, encoding: 'utf8', env: { ...process.env, BUILD_ENV, PUBLISH_DATE } });
const schedule = async (file, date) => writeFile(file, (await readFile(file, 'utf8')).replace(/^published: .+$/m, `published: ${date}`).replace(/^modified: .+$/m, `modified: ${date}`));

test('a post scheduled for a future date stays out of production until that date', () => withLaunch(async ({ root }) => {
  const { slug } = await publishFixtureArticle(root);
  await schedule(path.join(root, 'content/posts/published-fixture.md'), '2030-01-15');
  for (const script of ['scripts/build.mjs', 'scripts/check.mjs']) { const result = runDated(script, root, '2030-01-14'); assert.equal(result.status, 0, result.stderr); }
  await assert.rejects(stat(path.join(root, 'dist', slug, 'index.html')));
  assert.equal((await readFile(path.join(root, 'dist/sitemap.xml'), 'utf8')).includes(slug), false);
  assert.match(runDated('scripts/check-release.mjs', root, '2030-01-14').stdout, /1 published item\(s\)/);
  assert.equal(runDated('scripts/build.mjs', root, '2030-01-15').status, 0);
  await stat(path.join(root, 'dist', slug, 'index.html'));
  assert.match(await readFile(path.join(root, 'dist/sitemap.xml'), 'utf8'), new RegExp(slug));
}));

test('staging previews a scheduled post before its date', () => withLaunch(async ({ root }) => {
  const { slug } = await publishFixtureArticle(root);
  await schedule(path.join(root, 'content/posts/published-fixture.md'), '2030-01-15');
  assert.equal(runDated('scripts/build.mjs', root, '2030-01-14', 'staging').status, 0);
  await stat(path.join(root, 'dist', slug, 'index.html'));
}));

test('three posts on the same publication date fail the cadence check', () => withLaunch(async ({ root }) => {
  await publishFixtureArticle(root);
  const fixture = path.join(root, 'content/posts/published-fixture.md');
  await schedule(fixture, '2030-01-15');
  for (const suffix of ['copy', 'copy-two']) await writeFile(path.join(root, `content/posts/published-fixture-${suffix}.md`), (await readFile(fixture, 'utf8')).replace(/^slug: (.+)$/m, `slug: $1${suffix}/`));
  const result = run('scripts/check-content.mjs', root);
  assert.match(result.stderr, /publication cadence: 2030-01-15: 3 posts scheduled; maximum is 2 per day/);
}));

test('llms.txt and hub hasPart list live posts only, adding a scheduled post on its date', () => withLaunch(async ({ root }) => {
  const { slug } = await publishFixtureArticle(root);
  await schedule(path.join(root, 'content/posts/published-fixture.md'), '2030-01-15');
  const hubOf = async () => { const html = await readFile(path.join(root, 'dist', slug.split('/')[1], 'index.html'), 'utf8'); return html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]; };
  assert.equal(runDated('scripts/build.mjs', root, '2030-01-14').status, 0);
  assert.equal((await readFile(path.join(root, 'dist/llms.txt'), 'utf8')).includes(slug), false);
  assert.equal((await hubOf()).includes(`${slug}#article`), false);
  assert.equal(runDated('scripts/build.mjs', root, '2030-01-15').status, 0);
  assert.match(await readFile(path.join(root, 'dist/llms.txt'), 'utf8'), new RegExp(slug));
  assert.match(await hubOf(), new RegExp(`${slug}#article`));
}));

test('silo check requires spoke-to-pillar body links and ignores Resources links', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'verdict-silo-fixture-'));
  try {
  for (const dir of ['data', 'content']) await cp(dir, path.join(root, dir), { recursive: true });
  assert.equal(run('scripts/check-silos.mjs', root).status, 0, run('scripts/check-silos.mjs', root).stderr);
  const file = path.join(root, 'content/posts/blog-13-law-firm-seo-practice-area-pages.md');
  const pillar = '/legal-marketing/law-firm-marketing-statistics/';
  const text = await readFile(file, 'utf8');
  const unlinked = text.replace(`[law firm marketing statistics](${pillar})`, 'law firm marketing statistics');
  await writeFile(file, unlinked.replace(/^## Resources$/m, `## Resources\n\n- [Pillar](${pillar})`));
  const result = run('scripts/check-silos.mjs', root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /blog-13-law-firm-seo-practice-area-pages\.md: spoke has no body link up to its pillar/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

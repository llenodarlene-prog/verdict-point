import assert from 'node:assert/strict';
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { createContentFixture, createReleaseFixture } from './fixtures.mjs';

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

test('complete 20-item release passes and a missing item fails the real gate', async () => {
  const fixture = await createReleaseFixture();
  try {
    const pass = run('scripts/check-release.mjs', fixture.root);
    assert.equal(pass.status, 0, pass.stderr);
    await rm(path.join(fixture.root, 'content/posts/item-20.md'));
    const fail = run('scripts/check-release.mjs', fixture.root);
    assert.notEqual(fail.status, 0);
    assert.match(fail.stderr, /required launch content is not published/);
  } finally { await rm(fixture.root, { recursive: true, force: true }); }
});

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readJson = async file => JSON.parse(await readFile(file, 'utf8'));
test('tracker counts and hashes are stable', async () => {
  const [site, plan, launch, links, provenance] = await Promise.all([
    readJson('data/site.json'), readJson('data/content-plan.json'), readJson('data/launch-content-plan.json'),
    readJson('data/interlinking-plan.json'), readJson('data/tracker-provenance.json')
  ]);
  assert.equal(plan.length, 100); assert.equal(launch.length, 20); assert.equal(links.length, 20);
  assert.equal(site.tracker_sha256, provenance.sha256);
});

test('public domain and brand identity are complete', async () => {
  const site = await readJson('data/site.json');
  assert.match(site.url, /^https:\/\/[a-z0-9.-]+$/); assert.ok(site.name); assert.ok(site.tagline);
  assert.ok(site.fonts.display); assert.ok(site.fonts.body); assert.match(site.theme.ink, /^#[0-9A-F]{6}$/i);
});

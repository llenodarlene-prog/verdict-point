import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('Drive import recovers every launch draft deterministically and protects published posts', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'verdict-drive-'));
  try {
    for (const dir of ['data', 'content', 'sources', 'scripts']) await cp(dir, path.join(root, dir), { recursive: true });
    // Start from the pre-publication state so the import can run; the test re-publishes one post below.
    for (const item of JSON.parse(await readFile(path.join(root, 'data/launch-content-plan.json'), 'utf8'))) {
      const posts = path.join(root, 'content/posts');
      for (const name of (await import('node:fs')).readdirSync(posts)) {
        const file = path.join(posts, name);
        const text = await readFile(file, 'utf8');
        if (text.includes(`tracker_id: ${item.type}:${item.content_number}
`)) await writeFile(file, text.replace('draft: false', 'draft: true'));
      }
    }
    const run = () => spawnSync(process.execPath, ['scripts/import-drive-drafts.mjs'], { cwd: root, encoding: 'utf8' });
    const first = run(); assert.equal(first.status, 0, first.stderr);
    const reportPath = path.join(root, 'data/drive-import-report.json');
    const before = await readFile(reportPath, 'utf8');
    assert.equal(JSON.parse(before).length, 20);
    assert.equal(run().status, 0);
    assert.equal(await readFile(reportPath, 'utf8'), before);
    const post = path.join(root, JSON.parse(before)[0].path);
    const published = (await readFile(post, 'utf8')).replace('draft: true', 'draft: false');
    await writeFile(post, published);
    const rejection = run(); assert.notEqual(rejection.status, 0);
    assert.match(rejection.stderr, /Refusing to overwrite publishable content/);
    assert.equal(await readFile(post, 'utf8'), published);
  } finally { await rm(root, { recursive: true, force: true }); }
});

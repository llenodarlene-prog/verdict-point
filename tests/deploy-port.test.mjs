import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, readFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { tmpdir } from 'node:os';

test('deploy propagates Hostinger/custom SSH ports through SSH and rsync and rejects unsafe ports before network calls', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'verdict-port-'));
  const script = path.resolve('scripts/deploy-atomic.sh');
  try {
    const bin = path.join(root, 'bin'); await mkdir(bin);
    const log = path.join(root, 'calls');
    const mock = '#!/usr/bin/env node\nrequire("node:fs").appendFileSync(process.env.CALL_LOG, JSON.stringify({ tool: require("node:path").basename(process.argv[1]), args: process.argv.slice(2) }) + "\\n");\n';
    for (const name of ['ssh', 'rsync']) await writeFile(path.join(bin, name), mock, { mode: 0o755 });
    const base = { ...process.env, PATH: `${bin}:${process.env.PATH}`, CALL_LOG: log, DEPLOY_HOST: 'test.invalid', DEPLOY_USER: 'testuser', DEPLOY_ROOT: '/srv/verdict-test', DEPLOY_SSH_KEY: 'TEST_FIXTURE_ONLY', SSH_KNOWN_HOSTS: 'TEST_FIXTURE_ONLY', GITHUB_SHA: 'a'.repeat(40) };
    for (const port of ['', '65002', '22']) {
      await writeFile(log, '');
      const result = spawnSync('bash', [script], { cwd: root, env: { ...base, DEPLOY_PORT: port }, encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      const calls = (await readFile(log, 'utf8')).trim().split('\n').map(JSON.parse);
      assert.equal(calls.length, 3);
      const expected = port || '65002';
      for (const call of calls.filter(c => c.tool === 'ssh')) assert.equal(call.args[call.args.indexOf('-p') + 1], expected);
      const rsync = calls.find(c => c.tool === 'rsync');
      assert.match(rsync.args[rsync.args.indexOf('-e') + 1], new RegExp(`ssh -p ${expected} `));
    }
    for (const port of ['0', '65536', '-1', '22; touch /tmp/unsafe', 'abc']) {
      await writeFile(log, '');
      const result = spawnSync('bash', [script], { cwd: root, env: { ...base, DEPLOY_PORT: port }, encoding: 'utf8' });
      assert.equal(result.status, 2);
      assert.equal(await readFile(log, 'utf8'), '');
    }
  } finally { await rm(root, { recursive: true, force: true }); }
});

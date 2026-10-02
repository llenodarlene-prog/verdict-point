import { execFileSync } from 'node:child_process';
import { isProtectedPush } from './lib/workflow.mjs';

let payload = '';
for await (const chunk of process.stdin) payload += chunk;
let parsed;
try { parsed = JSON.parse(payload); } catch { console.error('Unable to parse hook payload.'); process.exit(2); }
const command = String(parsed.tool_input?.command || parsed.command || '');
const cPath = command.match(/(?:^|\s)-C\s+(?:"([^"]+)"|'([^']+)'|(\S+))/)?.slice(1).find(Boolean);
let currentBranch = '';
try { currentBranch = execFileSync('git', [...(cPath ? ['-C', cPath] : []), 'branch', '--show-current'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch {}
if (isProtectedPush(command, currentBranch)) {
  console.error('Direct pushes to main or staging are blocked. Use a feature branch and pull request.');
  process.exit(2);
}

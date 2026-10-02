import { readFile, writeFile, rename, rm } from 'node:fs/promises';
import { createSign } from 'node:crypto';

const manifest = JSON.parse(await readFile('data/google-drive-sources.json', 'utf8'));
const sa = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || 'null');
if (!sa?.client_email || !sa?.private_key) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is required; share the source folder with this service account as Viewer.');
const enc = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const unsigned = `${enc({ alg: 'RS256', typ: 'JWT' })}.${enc({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/drive.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
const signature = createSign('RSA-SHA256').update(unsigned).sign(sa.private_key).toString('base64url');
const auth = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }) });
if (!auth.ok) throw new Error(`Google authentication failed (${auth.status}); credentials are never printed.`);
const { access_token } = await auth.json();
const headers = { Authorization: `Bearer ${access_token}` };
const cache = new Map();
async function metadata(id) {
  if (!cache.has(id)) {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=id,name,mimeType,parents,modifiedTime,trashed&supportsAllDrives=true`, { headers });
    if (!response.ok) throw new Error(`Cannot read approved Drive file ${id} (${response.status})`);
    cache.set(id, await response.json());
  }
  return cache.get(id);
}
async function underRoot(id, seen = new Set()) {
  if (id === manifest.root_folder_id) return true;
  if (seen.has(id)) return false;
  seen.add(id);
  const item = await metadata(id);
  for (const parent of item.parents || []) if (await underRoot(parent, seen)) return true;
  return false;
}
const staged = [];
try {
  for (const file of manifest.files) {
    if (!/^sources\/google-drive\/[A-Za-z0-9_-]+\.md$/.test(file.path)) throw new Error('Unsafe snapshot destination');
    const info = await metadata(file.id);
    if (info.trashed || info.mimeType !== 'application/vnd.google-apps.document' || !await underRoot(file.id)) throw new Error(`Approved file moved, deleted, or changed type: ${file.id}`);
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}/export?mimeType=text%2Fmarkdown`, { headers });
    if (!response.ok) throw new Error(`Export failed for ${file.id} (${response.status})`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length || bytes.length > 10 * 1024 * 1024) throw new Error('Empty or oversized source export');
    const temp = file.path + '.pending';
    await writeFile(temp, bytes); staged.push({ temp, path: file.path });
    file.modified_time = info.modifiedTime;
  }
  for (const file of staged) await rename(file.temp, file.path);
  // Stable audit metadata: avoid creating a PR solely because a check ran on a new day.
  await writeFile('data/google-drive-sources.json', JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Read ${staged.length} approved Drive documents. Run import and verification before review.`);
} finally { for (const file of staged) await rm(file.temp, { force: true }); }

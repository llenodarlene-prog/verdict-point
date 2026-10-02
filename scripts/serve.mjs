import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

const build = spawn(process.execPath, ['scripts/build.mjs'], { stdio: 'inherit', env: { ...process.env, BUILD_ENV: 'local' } });
await new Promise((resolve, reject) => build.on('exit', code => code === 0 ? resolve() : reject(new Error('Build failed'))));
const root = path.resolve('dist');
const port = Number(process.env.PORT || 8080);
createServer(async (request, response) => {
  try {
    const raw = decodeURIComponent((request.url || '/').split('?')[0]);
    const relative = raw === '/' ? 'index.html' : raw.replace(/^\//, '');
    let file = path.resolve(root, relative);
    if (!file.startsWith(`${root}${path.sep}`) && file !== path.join(root, 'index.html')) throw new Error('Forbidden');
    if ((await stat(file).catch(() => null))?.isDirectory()) file = path.join(file, 'index.html');
    const data = await readFile(file);
    const types = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.xml':'application/xml', '.json':'application/json', '.txt':'text/plain' };
    response.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' }); response.end(data);
  } catch {
    const page = await readFile(path.join(root, '404', 'index.html')).catch(() => Buffer.from('Not found'));
    response.writeHead(404, { 'content-type': 'text/html; charset=utf-8' }); response.end(page);
  }
}).listen(port, () => console.log(`Preview: http://localhost:${port}`));

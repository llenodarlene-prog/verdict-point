import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');
const site = JSON.parse(await readFile('data/site.json', 'utf8'));
const nav = JSON.parse(await readFile('data/navigation.json', 'utf8'));
const buildEnv = process.env.BUILD_ENV || 'local';
const shouldIndex = buildEnv === 'production' && site.launch_status === 'ready';
const failures = [];
async function walk(dir) { const entries = await readdir(dir, { withFileTypes: true }); return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]))).flat(); }
const exists = async file => Boolean(await stat(file).catch(() => null));
if (!(await exists(path.join(dist, 'index.html')))) failures.push('dist/index.html is missing');
const files = await walk(dist);
const htmlFiles = files.filter(file => file.endsWith('.html'));
const titles = new Map();
const expectedUrls = new Set();
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const rel = path.relative(dist, file);
  const route = rel === 'index.html' ? '/' : `/${path.dirname(rel).replaceAll(path.sep, '/')}/`;
  const expectedCanonical = `${site.url.replace(/\/$/, '')}${route}`;
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  if (!title) failures.push(`${rel}: missing title`); else if (titles.has(title)) failures.push(`${rel}: duplicate title also used by ${titles.get(title)}`); else titles.set(title, rel);
  const description = html.match(/<meta name="description" content="([^"]*)">/)?.[1] || '';
  if (description.length < 40 || description.length > 180) failures.push(`${rel}: description length is ${description.length}, expected 40-180`);
  if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1) failures.push(`${rel}: must contain exactly one h1`);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  const ogUrl = html.match(/<meta property="og:url" content="([^"]+)">/)?.[1];
  if (canonical !== expectedCanonical) failures.push(`${rel}: canonical mismatch (${canonical})`);
  if (ogUrl !== expectedCanonical) failures.push(`${rel}: og:url mismatch (${ogUrl})`);
  const robots = html.match(/<meta name="robots" content="([^"]+)">/)?.[1];
  if (route !== '/404/' && robots !== (shouldIndex ? 'index,follow' : 'noindex,nofollow,noarchive')) failures.push(`${rel}: incorrect robots directive ${robots}`);
  if (robots === 'index,follow') expectedUrls.add(expectedCanonical);
  if (!html.includes('fonts.googleapis.com/css2?')) failures.push(`${rel}: approved fonts are not loaded`);
  for (const item of [...nav.primary, ...nav.footer]) if (!html.includes(`href="${item.url}"`)) failures.push(`${rel}: missing shared navigation URL ${item.url}`);
  for (const image of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="[^"]+"/.test(image[0])) failures.push(`${rel}: image missing useful alt text`);
    const src = image[0].match(/\ssrc="([^"]+)"/)?.[1];
    if (src?.startsWith('/') && !(await exists(path.join(dist, src)))) failures.push(`${rel}: missing image ${src}`);
  }
  for (const match of html.matchAll(/href="(\/[^"#?]*)/g)) {
    const href = match[1]; if (/\.[a-z0-9]+$/i.test(href)) continue;
    const target = href === '/' ? path.join(dist, 'index.html') : path.join(dist, href.replace(/^\//, '').replace(/\/$/, ''), 'index.html');
    if (!(await exists(target))) failures.push(`${rel}: broken internal link ${href}`);
  }
  const schemaText = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  try { JSON.parse(schemaText); } catch { failures.push(`${rel}: invalid JSON-LD`); }
  if (html.includes('property="article:published_time"')) {
    if (!/property="article:published_time" content="\d{4}-\d{2}-\d{2}"/.test(html)) failures.push(`${rel}: invalid article published date`);
    if (!/property="article:modified_time" content="\d{4}-\d{2}-\d{2}"/.test(html)) failures.push(`${rel}: invalid article modified date`);
  }
}
for (const required of ['sitemap.xml', 'feed.xml', 'robots.txt', 'build-manifest.json', '.htaccess']) if (!(await exists(path.join(dist, required)))) failures.push(`missing ${required}`);
if (await exists(path.join(dist, 'static/.htaccess'))) failures.push('.htaccess must be at dist root, not dist/static');
const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8').catch(() => '');
for (const url of expectedUrls) if (!url.endsWith('/404/') && !sitemap.includes(`<loc>${url}</loc>`)) failures.push(`sitemap missing ${url}`);
const feed = await readFile(path.join(dist, 'feed.xml'), 'utf8').catch(() => '');
if (!/<updated>[^<]+<\/updated>/.test(feed)) failures.push('feed.xml missing updated timestamp');
const robotsText = await readFile(path.join(dist, 'robots.txt'), 'utf8').catch(() => '');
if (shouldIndex && !robotsText.includes(`Sitemap: ${site.url}/sitemap.xml`)) failures.push('production robots.txt lacks canonical sitemap');
if (!shouldIndex && !/Allow:\s*\//.test(robotsText)) failures.push('non-indexable robots.txt must remain crawlable for noindex discovery');
if (failures.length) { console.error([...new Set(failures)].map(message => `ERROR: ${message}`).join('\n')); process.exit(1); }
console.log(`Validated ${htmlFiles.length} generated HTML files with no errors.`);

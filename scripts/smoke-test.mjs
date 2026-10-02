const base = String(process.env.SMOKE_URL || '').replace(/\/$/, '');
if (!/^https:\/\//.test(base)) throw new Error('SMOKE_URL must be HTTPS');
const expectedBrand = String(process.env.SMOKE_BRAND || '');
const expectedRobots = String(process.env.SMOKE_EXPECT_ROBOTS || 'noindex');
const canonicalBase = String(process.env.SMOKE_CANONICAL_URL || base).replace(/\/$/, '');
const home = await fetch(`${base}/`);
if (!home.ok) throw new Error(`/: HTTP ${home.status}`);
const html = await home.text();
if (expectedBrand && !html.includes(expectedBrand)) throw new Error('/: expected brand name not found');
if (!html.includes(`<link rel="canonical" href="${canonicalBase}/">`)) throw new Error('/: canonical mismatch');
if (!html.includes(`<meta name="robots" content="${expectedRobots}`)) throw new Error(`/: expected ${expectedRobots} robots directive`);
for (const route of ['/robots.txt', '/sitemap.xml']) {
  const response = await fetch(`${base}${route}`);
  if (!response.ok) throw new Error(`${route}: HTTP ${response.status}`);
  const text = await response.text();
  if (route === '/sitemap.xml' && !text.includes(`${canonicalBase}/`)) throw new Error('/sitemap.xml: canonical site URL not found');
}
const missing = await fetch(`${base}/__smoke-test-missing-page__`);
if (missing.status !== 404) throw new Error(`/404 behavior: expected HTTP 404, received ${missing.status}`);
console.log(`Smoke test passed for ${base}`);

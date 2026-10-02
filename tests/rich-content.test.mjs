import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { renderChart, resetCharts } from '../scripts/lib/charts.mjs';
import { markdownToHtml } from '../scripts/lib/content.mjs';
import { articleSchema, extractFaq } from '../scripts/lib/seo.mjs';

const spec = { type: 'bar', title: 'Seats', labels: ['1', '10'], series: [{ name: 'Cost', values: [588, 5880] }], prefix: '$', source: 'Pricing page' };

test('charts render accessible SVG with a data table and reject malformed data', () => {
  resetCharts();
  const html = renderChart(JSON.stringify(spec));
  assert.match(html, /<svg[^>]+role="img"[^>]+aria-labelledby="chart-1-title chart-1-desc"/);
  assert.match(html, /<details class="chart-data">[\s\S]*<td>\$5,880<\/td>/);
  assert.match(html, /Source: Pricing page/);
  assert.throws(() => renderChart(JSON.stringify({ ...spec, series: [{ name: 'Cost', values: [1] }] })), /one numeric value per label/);
  assert.throws(() => renderChart(JSON.stringify({ ...spec, type: 'pie' })), /unknown type/);
  assert.throws(() => renderChart(JSON.stringify({ ...spec, type: 'grouped', series: [] })), /series is required/);
});

test('every chart in data/charts.json renders', async () => {
  const charts = JSON.parse(await readFile('data/charts.json', 'utf8'));
  for (const [id, chart] of Object.entries(charts)) assert.doesNotThrow(() => renderChart(JSON.stringify(chart)), id);
});

test('Markdown supports chart blocks, captioned table variants, callouts, and figures', () => {
  const md = [
    '```chart', 'fees', '```', '',
    'Table: Fees by method {.data}', '| Method | Rate |', '| --- | ---: |', '| Card | 2.95% |', '',
    '> **Budget Check**', '> Keep every subscription.', '> Count it.', '',
    '![Pen on a contract](/img.jpg "Get it in writing.")'
  ].join('\n');
  const html = markdownToHtml(md, { chart: id => `<chart ${id.trim()}>`, image: ({ alt, src, caption }) => `<fig ${alt}|${src}|${caption}>` });
  assert.match(html, /<chart fees>/);
  assert.match(html, /<table class="table--data"><caption>Fees by method<\/caption>/);
  assert.match(html, /<td class="num">2\.95%<\/td>/);
  assert.match(html, /<aside class="callout"><p class="callout-title">Budget Check<\/p><p>Keep every subscription\. Count it\.<\/p><\/aside>/);
  assert.match(html, /<fig Pen on a contract\|\/img\.jpg\|Get it in writing\.>/);
  assert.match(markdownToHtml('```js\n<b>\n```'), /<pre><code>&lt;b&gt;<\/code><\/pre>/);
});

test('article schema includes image, breadcrumbs, FAQ, and omits an unverified author', () => {
  const body = '# T\n\n## Frequently Asked Questions\n\nIntro.\n\n### Is It Priced Per User?\n\nYes. See [pricing](https://x.example/).\n\n### Does It Change?\n\nIt can.\n\n## Resources\n\n- **A:** b';
  assert.deepEqual(extractFaq(body).map(item => item.question), ['Is It Priced Per User?', 'Does It Change?']);
  assert.equal(extractFaq(body)[0].answer, 'Yes. See pricing.');
  const schema = articleSchema({
    metadata: { title: 'T', description: 'D', schema: 'BlogPosting', primary_keyword: 'k', secondary_keywords: 'a; b', author: '' },
    url: 'https://site.example/t/', site: { name: 'S', locale: 'en-US' }, siteUrl: 'https://site.example', body,
    image: { path: '/i.jpg', width: 1600, height: 900, alt: 'Alt' }, crumbs: [{ name: 'Home', url: 'https://site.example/' }, { name: 'T', url: 'https://site.example/t/' }]
  });
  const [article, crumbs, faq] = schema['@graph'];
  assert.equal(article['@type'], 'BlogPosting');
  assert.equal(article.image.url, 'https://site.example/i.jpg');
  assert.equal(article.keywords, 'k, a, b');
  assert.equal('author' in article, false);
  assert.equal(crumbs.itemListElement.length, 2);
  assert.equal(faq.mainEntity.length, 2);
});

test('content check counts page links but not Markdown images', async () => {
  const source = await readFile('scripts/check-content.mjs', 'utf8');
  const pattern = new RegExp(source.match(/body\.matchAll\(\/(.+?)\/g\)\]\.map\(match => match\[1\]\)\.filter\(value => value !== '\/'\)/)[1], 'g');
  const body = '[Billing](/law-firms/law-firm-billing-statistics/) and ![Pen](/assets/images/pen-1600.jpg "Caption")';
  assert.deepEqual([...body.matchAll(pattern)].map(match => match[1]), ['/law-firms/law-firm-billing-statistics/']);
});

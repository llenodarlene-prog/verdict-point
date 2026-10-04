import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { escapeHtml, markdownToHtml, readContent } from './lib/content.mjs';
import { renderAbout } from './lib/about.mjs';
import { contactEmail, renderContact } from './lib/contact.mjs';
import { renderHome } from './lib/home.mjs';
import { renderHub } from './lib/hub.mjs';
import { renderChart, resetCharts } from './lib/charts.mjs';
import { articleSchema, headMeta } from './lib/seo.mjs';
import { assertUniqueRoute, validateRedirects } from './lib/workflow.mjs';

const cwd = process.cwd();
const dist = path.join(cwd, 'dist');
const readJson = async file => JSON.parse(await readFile(file, 'utf8'));
const [site, nav, redirects, homeCopy, aboutCopy, hubCopy, contactCopy, footerCopy, assetList, chartData] = await Promise.all([
  readJson('data/site.json'), readJson('data/navigation.json'), readJson('data/redirects.json'), readJson('data/home-page.json'), readJson('data/about-page.json'), readJson('data/hub-pages.json'), readJson('data/contact-page.json'), readJson('data/footer.json'), readJson('data/assets.json'), readJson('data/charts.json')
]);
const buildEnv = process.env.BUILD_ENV || 'local';
const siteUrl = String(site.url).replace(/\/$/, '');
if (!/^https:\/\//.test(siteUrl)) throw new Error('SITE_URL must be an absolute HTTPS URL');
if (buildEnv === 'production' && process.env.SITE_URL && process.env.SITE_URL.replace(/\/$/, '') !== siteUrl) throw new Error('SITE_URL differs from approved tracker domain');
const indexable = buildEnv === 'production' && site.launch_status === 'ready';
const robots = indexable ? 'index,follow' : 'noindex,nofollow,noarchive';

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]))).flat();
}
const replace = (template, values) => Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value ?? '')), template);
const list = items => items.map(item => `<li><a href="${escapeHtml(item.url)}">${escapeHtml(item.label)}</a></li>`).join('');
const cleanSlug = slug => slug === '/' ? '' : slug.replace(/^\//, '').replace(/\/$/, '');
const canonical = slug => `${siteUrl}${slug === '/' ? '/' : `/${cleanSlug(slug)}/`}`;
const isoDate = value => value ? new Date(`${value}T00:00:00Z`).toISOString() : null;
const uniqueFonts = [...new Set(Object.values(site.fonts || {}).filter(Boolean))];
const fontLinks = uniqueFonts.length ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?${uniqueFonts.map(font => `family=${encodeURIComponent(font).replaceAll('%20', '+')}:wght@400;500;600;700`).join('&')}&display=swap" rel="stylesheet">` : '';

function contentCards(items, heading) {
  if (!items.length) return `<section class="content-list"><h2>${escapeHtml(heading)}</h2><p>No published items are available yet.</p></section>`;
  return `<section class="content-list"><h2>${escapeHtml(heading)}</h2><div class="card-grid">${items.map(item => `<article class="content-card"><p class="eyebrow">${escapeHtml(item.type)}</p><h3><a href="${escapeHtml(item.slug)}">${escapeHtml(item.title)}</a></h3><p>${escapeHtml(item.description)}</p></article>`).join('')}</div></section>`;
}

await mkdir(dist, { recursive: true });
for (const folder of ['styles', 'scripts']) await cp(path.join('src', folder), path.join(dist, folder), { recursive: true });
// Source documentation (README files, notes, briefs) stays in the repository and is never deployed.
const sourceDocumentation = /\.(?:md|markdown|txt|docx?)$/i;
await cp('assets', path.join(dist, 'assets'), { recursive: true, filter: source => !sourceDocumentation.test(source) });
const [base, headerTemplate, footerTemplate] = await Promise.all([
  readFile('src/layouts/base.html', 'utf8'), readFile('src/partials/header.html', 'utf8'), readFile('src/partials/footer.html', 'utf8')
]);
// Footer columns come from the approved copy; any footer navigation link not already in a column (such as the sitemap) sits on the bottom line.
const footerColumnUrls = new Set(footerCopy.columns.flatMap(column => column.links.map(link => link.url)));
const footerColumns = footerCopy.columns.map(column => `<nav class="footer-column" aria-label="${escapeHtml(column.heading)}"><h2>${escapeHtml(column.heading)}</h2><ul>${list(column.links)}</ul></nav>`).join('');
const shared = {
  NAME: site.name, TAGLINE: site.tagline, YEAR: new Date().getUTCFullYear(), PRIMARY_NAV: list(nav.primary),
  FOOTER_NAV: list(nav.footer.filter(item => !footerColumnUrls.has(item.url))), FOOTER_COLUMNS: footerColumns,
  FOOTER_DESCRIPTION: escapeHtml(footerCopy.description), FOOTER_DISCLAIMER: escapeHtml(footerCopy.disclaimer)
};
const header = replace(headerTemplate, shared);
// Images resolve through data/assets.json so every rendered image carries registered dimensions and alt guidance.
const assetFor = src => {
  const asset = assetList.find(item => item.path === src);
  return asset ? { path: asset.path, width: asset.width, height: asset.height, alt: asset.alt_guidance } : null;
};
const smallVariant = src => assetFor(src.replace(/-(1600|1200)\.jpg$/, '-800.jpg'));
function figure({ alt, src, caption }, { eager = false, className = 'post-figure' } = {}) {
  const asset = assetFor(src);
  if (!asset) throw new Error(`image ${src} is not registered in data/assets.json`);
  const small = smallVariant(src);
  const srcset = small && small.path !== src ? ` srcset="${escapeHtml(small.path)} 800w, ${escapeHtml(src)} ${asset.width}w" sizes="(max-width: 820px) 100vw, 820px"` : '';
  return `<figure class="${className}"><img src="${escapeHtml(src)}"${srcset} width="${asset.width}" height="${asset.height}" alt="${escapeHtml(alt || asset.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}</figure>`;
}
// A chart block holds a chart id from data/charts.json, so chart data never counts toward article word totals.
const chartBlock = block => {
  const id = block.trim();
  if (!chartData[id]) throw new Error(`chart "${id}" is not defined in data/charts.json`);
  return renderChart(JSON.stringify(chartData[id]));
};
const defaultShareImage = assetFor('/assets/brand/verdict-point-social.png');
const logoImage = assetFor('/assets/brand/verdict-point-icon.png');
const footer = replace(footerTemplate, shared);
const sourceFiles = (await walk('content')).filter(file => file.endsWith('.md')).sort();
const parsed = [];
const sourceRoutes = new Map();
// Production omits drafts entirely; their routes are remembered so links to them can be unlinked below.
const excludedDraftRoutes = new Set();
for (const file of sourceFiles) {
  const { metadata, body } = await readContent(file);
  if (metadata.draft === true && buildEnv === 'production') { if (metadata.slug) excludedDraftRoutes.add(metadata.slug); continue; }
  for (const field of ['title', 'description', 'slug', 'type']) if (!metadata[field]) throw new Error(`${file}: missing ${field}`);
  if (!/^\/(?:$|.*\/)$/.test(metadata.slug)) throw new Error(`${file}: slug must start and end with /`);
  assertUniqueRoute(metadata.slug, file, sourceRoutes);
  parsed.push({ ...metadata, body, source: file, article: ['article', 'blog'].includes(String(metadata.type).toLowerCase()) });
}
const publishedPosts = parsed.filter(page => page.article && page.draft !== true).sort((a, b) => String(b.modified || b.published).localeCompare(String(a.modified || a.published)));
// Listing cards show each post's registered featured image at its small size.
for (const post of publishedPosts) {
  const thumb = post.image ? (smallVariant(post.image) || assetFor(post.image)) : null;
  post.card_image = thumb ? { src: thumb.path, width: thumb.width, height: thumb.height, alt: post.image_alt || thumb.alt } : null;
}
const pages = [];
for (const page of parsed) {
  const { body, source, article, ...metadata } = page;
  const url = canonical(metadata.slug);
  if (article && metadata.draft !== true) for (const field of ['published', 'modified', 'author']) if (!metadata[field]) throw new Error(`${source}: published content missing ${field}`);
  const featured = metadata.image ? assetFor(metadata.image) : null;
  if (metadata.image && !featured) throw new Error(`${source}: featured image ${metadata.image} is not registered in data/assets.json`);
  const hub = nav.primary.find(item => item.url !== '/' && metadata.slug.startsWith(item.url));
  const crumbs = [{ name: 'Home', url: `${siteUrl}/` }, ...(hub && hub.url !== metadata.slug ? [{ name: hub.label, url: canonical(hub.url) }] : []), { name: metadata.title, url }];
  const schema = article ? articleSchema({ metadata, url, site, siteUrl, image: featured, body, crumbs, logo: logoImage }) : {
    '@context': 'https://schema.org', '@type': metadata.schema || 'WebPage', name: metadata.title, description: metadata.description,
    url, isPartOf: { '@type': 'WebSite', name: site.name, url: siteUrl }
  };
  // Designed pages render from approved copy files; everything else renders from Markdown.
  const designed = article ? null : { home: () => renderHome(homeCopy, publishedPosts, nav, { chart: chartBlock }), about: () => renderAbout(aboutCopy),
    contact: () => renderContact(contactCopy, contactEmail(body, source)),
    hub: () => {
      const hub = hubCopy.hubs[metadata.slug];
      if (!hub) throw new Error(`${source}: no approved hub copy for ${metadata.slug} in data/hub-pages.json`);
      return renderHub(hub, hubCopy.shared, publishedPosts.filter(post => post.slug.startsWith(metadata.slug)), nav,
        { slug: metadata.slug, chart: chartBlock, allPosts: publishedPosts, sections: homeCopy.coverage.cards, closing: homeCopy.closing });
    } }[metadata.template];
  resetCharts();
  let renderedBody = designed ? designed() : markdownToHtml(body, { chart: chartBlock, image: figure });
  if (article) {
    // Posts open with a breadcrumb trail, then the H1, then the featured image.
    const trail = `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${crumbs.map((crumb, i) => i < crumbs.length - 1 ? `<li><a href="${escapeHtml(crumb.url.replace(siteUrl, '') || '/')}">${escapeHtml(crumb.name)}</a></li>` : `<li aria-current="page">${escapeHtml(crumb.name)}</li>`).join('')}</ol></nav>`;
    renderedBody = trail + renderedBody;
    if (featured) renderedBody = renderedBody.replace(/(<\/h1>)/, `$1${figure({ alt: metadata.image_alt || featured.alt, src: featured.path, caption: '' }, { eager: true, className: 'post-featured' })}`);
  }
  if (!designed && !article && metadata.slug === '/') renderedBody += contentCards(publishedPosts.slice(0, 12), 'Latest Research');
  else if (!designed && !article && metadata.schema === 'CollectionPage') renderedBody += contentCards(publishedPosts.filter(post => post.slug.startsWith(metadata.slug)), 'Published Coverage');
  // A link to an unpublished draft becomes plain text in production; it turns back into a link once that item publishes.
  if (excludedDraftRoutes.size) renderedBody = renderedBody.replace(/<a href="(\/[^"#?]*)(?:[#?][^"]*)?"[^>]*>([\s\S]*?)<\/a>/g, (link, href, text) => excludedDraftRoutes.has(href) ? `<span class="pending-link">${text}</span>` : link);
  const title = metadata.seo_title || metadata.title;
  // An approved SEO title that already names the brand is used as written, without a repeated suffix.
  const fullTitle = title.includes(site.name) ? title : `${title} | ${site.name}`;
  const html = replace(base, {
    LANG: site.locale || 'en-US', TITLE: escapeHtml(fullTitle), DESCRIPTION: escapeHtml(metadata.description), ROBOTS: metadata.noindex === true ? 'noindex,nofollow' : robots,
    CANONICAL: url, OG_TYPE: article ? 'article' : 'website', SCHEMA: JSON.stringify(schema).replaceAll('<', '\\u003c'), FONT_LINKS: fontLinks,
    ARTICLE_META: headMeta({ metadata, site, siteUrl, image: featured || defaultShareImage, article }),
    HEADER: header, FOOTER: footer, CONTENT: designed ? `<div class="home" data-page-slug="${escapeHtml(metadata.slug)}">${renderedBody}</div>` : `<article class="shell prose" data-page-slug="${escapeHtml(metadata.slug)}">${renderedBody}</article>`
  });
  const target = metadata.slug === '/' ? path.join(dist, 'index.html') : path.join(dist, cleanSlug(metadata.slug), 'index.html');
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html);
  pages.push({ ...metadata, source, url, article });
}

const indexed = pages.filter(page => page.noindex !== true && page.draft !== true);
const sitemap = indexed.map(page => `  <url><loc>${page.url}</loc>${page.modified || page.published ? `<lastmod>${escapeHtml(page.modified || page.published)}</lastmod>` : ''}</url>`).join('\n');
await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap}\n</urlset>\n`);
const posts = indexed.filter(page => page.article).sort((a, b) => String(b.modified).localeCompare(String(a.modified)));
const updated = isoDate(posts[0]?.modified || posts[0]?.published) || site.source_modified || '2026-09-22T00:00:00Z';
await writeFile(path.join(dist, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"><title>${escapeHtml(site.name)}</title><id>${siteUrl}/</id><link href="${siteUrl}/feed.xml" rel="self"/><updated>${updated}</updated>${posts.slice(0, 20).map(page => `<entry><title>${escapeHtml(page.title)}</title><id>${page.url}</id><link href="${page.url}"/><updated>${isoDate(page.modified || page.published)}</updated></entry>`).join('')}</feed>\n`);
const robotsText = await readFile(indexable ? 'src/static/robots-production.txt' : 'src/static/robots-staging.txt', 'utf8');
await writeFile(path.join(dist, 'robots.txt'), robotsText.replaceAll('{{SITE_URL}}', siteUrl));
const htaccess = await readFile('src/static/.htaccess', 'utf8');
await writeFile(path.join(dist, '.htaccess'), htaccess.replace('{{REDIRECTS}}', validateRedirects(redirects, pages.map(page => page.slug))));
await writeFile(path.join(dist, 'build-manifest.json'), JSON.stringify({ brand: site.name, environment: buildEnv, indexable, siteUrl, trackerSha256: site.tracker_sha256, pages: pages.map(page => ({ slug: page.slug, source: page.source, modified: page.modified || null })) }, null, 2) + '\n');
console.log(`Built ${pages.length} pages for ${site.name} (${buildEnv}; indexable=${indexable})`);

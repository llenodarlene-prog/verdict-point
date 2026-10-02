import { escapeHtml } from './content.mjs';

const plain = text => String(text || '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`>]/g, '').replace(/\s+/g, ' ').trim();
const meta = (attr, key, value) => value ? `<meta ${attr}="${key}" content="${escapeHtml(value)}">` : '';

// FAQ pairs come from the "## Frequently Asked Questions" section: each ### heading and the prose under it.
export function extractFaq(markdown) {
  const section = markdown.split(/^## /m).find(part => /^Frequently Asked Questions\b/i.test(part));
  if (!section) return [];
  return section.split(/^### /m).slice(1).map(block => {
    const [question, ...rest] = block.split('\n');
    return { question: plain(question), answer: plain(rest.join(' ')) };
  }).filter(item => item.question && item.answer);
}

export const wordCount = markdown => plain(markdown.replace(/```[\s\S]*?```/g, '').replace(/^\|.*$/gm, '')).split(' ').filter(Boolean).length;

// Head tags shared by every page, plus article-only Open Graph fields.
export function headMeta({ metadata, site, siteUrl, image, article }) {
  const title = metadata.seo_title || metadata.title;
  const tags = [
    meta('property', 'og:site_name', site.name),
    meta('property', 'og:locale', String(site.locale || 'en-US').replace('-', '_')),
    meta('property', 'og:image', image && `${siteUrl}${image.path}`),
    meta('property', 'og:image:width', image?.width),
    meta('property', 'og:image:height', image?.height),
    meta('property', 'og:image:alt', image?.alt),
    meta('name', 'twitter:title', title),
    meta('name', 'twitter:description', metadata.description),
    meta('name', 'twitter:image', image && `${siteUrl}${image.path}`),
    meta('name', 'twitter:image:alt', image?.alt)
  ];
  if (article) {
    tags.push(meta('property', 'article:section', metadata.cluster));
    for (const tag of [metadata.primary_keyword, ...String(metadata.secondary_keywords || '').split(';')].map(t => t?.trim()).filter(Boolean)) tags.push(meta('property', 'article:tag', tag));
    if (metadata.draft !== true) tags.push(meta('property', 'article:published_time', metadata.published), meta('property', 'article:modified_time', metadata.modified));
  }
  return tags.filter(Boolean).join('\n  ');
}

export function articleSchema({ metadata, url, site, siteUrl, image, body, crumbs, logo }) {
  const article = {
    '@type': metadata.schema === 'BlogPosting' ? 'BlogPosting' : 'Article',
    '@id': `${url}#article`, headline: metadata.title, description: metadata.description, url, mainEntityOfPage: url,
    inLanguage: site.locale || 'en-US', articleSection: metadata.cluster, wordCount: wordCount(body),
    keywords: [metadata.primary_keyword, ...String(metadata.secondary_keywords || '').split(';')].map(t => t?.trim()).filter(Boolean).join(', '),
    publisher: { '@type': 'Organization', name: site.name, url: siteUrl, ...(logo ? { logo: { '@type': 'ImageObject', url: `${siteUrl}${logo.path}`, width: logo.width, height: logo.height } } : {}) }
  };
  if (image) article.image = { '@type': 'ImageObject', url: `${siteUrl}${image.path}`, width: image.width, height: image.height, caption: image.alt };
  if (metadata.published) article.datePublished = metadata.published;
  if (metadata.modified) article.dateModified = metadata.modified;
  // Only a named, verified author is emitted; drafts without one carry no author claim.
  if (metadata.author) article.author = { '@type': 'Person', name: metadata.author };
  const graph = [article, {
    '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`,
    itemListElement: crumbs.map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, name: crumb.name, item: crumb.url }))
  }];
  const faq = extractFaq(body);
  if (faq.length) graph.push({ '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: faq.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) });
  return { '@context': 'https://schema.org', '@graph': graph };
}

import { escapeHtml } from './content.mjs';

// Line icons used across the designed pages. Decorative only.
const icons = {
  source: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/>',
  definition: '<path d="M5 6h14M5 12h9M5 18h12"/>',
  compare: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
  revisit: '<path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v5h-5"/>',
  scale: '<path d="M12 4v16M7 20h10M5 8h14"/><path d="m5 8-3 6a3 3 0 0 0 6 0L5 8ZM19 8l-3 6a3 3 0 0 0 6 0l-3-6Z"/>',
  building: '<path d="M4 20V6l8-3 8 3v14M2 20h20"/><path d="M9 20v-5h6v5M8 9h1M12 9h1M16 9h0M8 12h1M12 12h1M16 12h0"/>',
  chip: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',
  megaphone: '<path d="M4 10v4h3l8 4V6l-8 4H4Z"/><path d="M18 9a4 4 0 0 1 0 6M8 14v4a1 1 0 0 0 1 1h1.5"/>',
  briefcase: '<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12h18"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.5 1.1.5 1.6h6c0-.5 0-1.2.5-1.6A6 6 0 0 0 12 3Z"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16 9.5"/>',
  handshake: '<path d="m3 11 4-4 4 2 3-2 3 1 4 4"/><path d="m7 15 3 3 2-1 2 2 5-5M3 11l4 4M21 12l-3 3"/>',
  table: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M3 14.5h18M9 5v14"/>',
  calculator: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h0M12 12h0M16 12h0M8 16h0M12 16h0M16 16h0"/>',
  users: '<circle cx="9" cy="9" r="3"/><path d="M3 19a6 6 0 0 1 12 0"/><path d="M16 6a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5"/>',
  survey: '<path d="M9 4h6v3H9z"/><path d="M8 5.5H6.5A1.5 1.5 0 0 0 5 7v12a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V7a1.5 1.5 0 0 0-1.5-1.5H16M8.5 12h7M8.5 16h5"/>',
  map: '<path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2V6Z"/><path d="M9 4v14M15 6v14"/>',
  shield: '<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z"/><path d="m9 12 2.2 2.2L15 10"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
};
export const icon = (name, className = 'icon') => `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[name] || icons.check}</svg>`;
// Section icons, keyed by hub URL.
export const sectionIcons = { '/legal/': 'scale', '/law-firms/': 'building', '/legal-tech/': 'chip', '/legal-marketing/': 'megaphone', '/legal-business/': 'briefcase' };

// Approved editorial photography, served at two widths. The hero loads eagerly because it is above the fold.
export function photo(image, { eager = false, sizes, className = 'home-photo' }) {
  return `<img class="${className}" src="${escapeHtml(image.src)}" srcset="${escapeHtml(image.small)} 800w, ${escapeHtml(image.src)} ${image.width}w" sizes="${sizes}" width="${image.width}" height="${image.height}" alt="${escapeHtml(image.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}
// Full-bleed section background. The photograph is atmosphere behind text, so it is hidden from assistive technology.
export const backdrop = (image, { eager = false } = {}) => image ? `<div class="backdrop" aria-hidden="true">${photo({ ...image, alt: image.alt }, { eager, sizes: '100vw', className: 'backdrop-photo' })}</div>` : '';

const sectionLabel = (slug, nav) => {
  const root = `/${String(slug).split('/').filter(Boolean)[0] || ''}/`;
  return nav.primary.find(item => item.url === root)?.label || '';
};
const formatDate = value => {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
};
export function postCard(post, nav, { size = 'standard', linkLabel = '' } = {}) {
  const date = post.modified || post.published;
  const label = sectionLabel(post.slug, nav);
  const image = post.card_image;
  const media = image ? `<a class="post-card-media" href="${escapeHtml(post.slug)}" tabindex="-1" aria-hidden="true"><img src="${escapeHtml(image.src)}" width="${image.width}" height="${image.height}" alt="${escapeHtml(image.alt)}" loading="lazy" decoding="async"></a>` : '';
  return `<article class="post-card post-card--${size}${image ? ' post-card--media' : ''}" data-reveal>
    ${media}
    <div class="post-card-body">
      ${label ? `<p class="card-label">${escapeHtml(label)}</p>` : ''}
      <h3><a href="${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a></h3>
      ${date ? `<p class="card-date"><time datetime="${escapeHtml(date)}">${escapeHtml(formatDate(date))}</time></p>` : ''}
      <p>${escapeHtml(post.description)}</p>
      ${linkLabel ? `<a class="text-link" href="${escapeHtml(post.slug)}">${escapeHtml(linkLabel)}</a>` : ''}
    </div>
  </article>`;
}

// A chart from published research, shown beside the piece it comes from. Renders only when that piece is published.
export function dataHighlight(highlight, posts, nav, chart, { reverse = false } = {}) {
  if (!highlight || !chart) return '';
  const post = posts.find(item => item.slug === highlight.post);
  if (!post) return '';
  return `
  <section class="home-section data-highlight" aria-labelledby="data-highlight-heading">
    <div class="shell split split--chart${reverse ? ' split--reverse' : ''}">
      <div class="glass chart-panel" data-reveal>${chart(highlight.chart)}</div>
      <div class="measure" data-reveal>
        <p class="card-label">${escapeHtml(highlight.label)}</p>
        <h2 id="data-highlight-heading">${escapeHtml(post.title)}</h2>
        <p>${escapeHtml(post.description)}</p>
        <a class="button button--primary" href="${escapeHtml(post.slug)}">${escapeHtml(highlight.link)}</a>
      </div>
    </div>
  </section>`;
}

export function closingBand(closing, { id = 'closing-heading' } = {}) {
  return `
  <section class="closing-cta has-backdrop" aria-labelledby="${id}">
    ${backdrop(closing.image)}
    <div class="shell">
      <div class="glass glass--dark closing-panel" data-reveal>
        <h2 id="${id}">${escapeHtml(closing.heading)}</h2>
        <p>${escapeHtml(closing.copy)}</p>
        <a class="button button--gold" href="${escapeHtml(closing.cta.url)}">${escapeHtml(closing.cta.label)}</a>
      </div>
    </div>
  </section>`;
}

const paragraphs = items => items.map(text => `<p>${escapeHtml(text)}</p>`).join('');

export function renderHome(copy, posts, nav, { chart } = {}) {
  const { hero, trust, positioning, coverage, methodology, featured, audience, latest, closing } = copy;
  const latestPosts = posts.slice(0, latest.limit);
  // Featured and latest sections only render once published research exists; drafts never appear here.
  const primaryUrl = posts.length ? hero.primary_cta.url : hero.primary_cta.fallback_url;

  const heroCards = posts.slice(0, 2).map(post => `<a class="glass hero-card" href="${escapeHtml(post.slug)}">
        <span class="card-label">${escapeHtml(sectionLabel(post.slug, nav))}</span>
        <span class="hero-card-title">${escapeHtml(post.title)}</span>
        <span class="hero-card-link">${escapeHtml(featured.link)}${icon('arrow', 'icon icon--inline')}</span>
      </a>`).join('');

  const featuredSection = posts.length ? `
  <section class="home-section featured" aria-labelledby="featured-heading">
    <div class="shell">
      <header class="section-intro" data-reveal><p class="card-label">${escapeHtml(featured.label)}</p><h2 id="featured-heading">${escapeHtml(featured.heading)}</h2><p>${escapeHtml(featured.intro)}</p></header>
      <div class="featured-grid">
        ${postCard(posts[0], nav, { size: 'large', linkLabel: featured.link })}
        ${posts.length > 1 ? `<div class="featured-stack">${posts.slice(1, 3).map(post => postCard(post, nav, { size: 'row' })).join('')}</div>` : ''}
      </div>
    </div>
  </section>` : '';

  const latestSection = posts.length ? `
  <section class="home-section latest" id="latest-analysis" aria-labelledby="latest-heading">
    <div class="shell">
      <h2 id="latest-heading" data-reveal>${escapeHtml(latest.heading)}</h2>
      <div class="post-grid">${latestPosts.map(post => postCard(post, nav)).join('')}</div>
    </div>
  </section>` : '';

  return `
  <section class="home-hero hero--immersive has-backdrop" aria-labelledby="home-heading">
    ${backdrop(hero.image, { eager: true })}
    <div class="shell hero-grid">
      <div class="glass hero-copy">
        <p class="eyebrow">${escapeHtml(hero.eyebrow)}</p>
        <h1 id="home-heading">${escapeHtml(hero.heading)}</h1>
        ${paragraphs(hero.copy)}
        <div class="cta-row">
          <a class="button button--primary" href="${escapeHtml(primaryUrl)}">${escapeHtml(hero.primary_cta.label)}</a>
          <a class="button button--secondary" href="${escapeHtml(hero.secondary_cta.url)}">${escapeHtml(hero.secondary_cta.label)}</a>
        </div>
      </div>
      ${heroCards ? `<div class="hero-cards">${heroCards}</div>` : ''}
    </div>
  </section>

  <section class="trust-strip" aria-label="Our editorial standard">
    <div class="shell trust-grid">
      ${trust.map(item => `<div class="glass trust-item" data-reveal><span class="icon-badge">${icon(item.icon)}</span><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.text)}</p></div>`).join('')}
    </div>
  </section>

  <section class="home-section positioning" aria-labelledby="positioning-heading">
    <div class="shell split split--media">
      <div class="media-frame" data-reveal>${positioning.image ? photo(positioning.image, { sizes: '(max-width: 900px) 100vw, 45vw' }) : ''}
        <aside class="glass question-panel" aria-label="${escapeHtml(positioning.questions_label)}">
          <p class="panel-label">${escapeHtml(positioning.questions_label)}</p>
          <ol>${positioning.questions.map(question => `<li>${escapeHtml(question)}</li>`).join('')}</ol>
        </aside>
      </div>
      <div class="measure" data-reveal>
        <h2 id="positioning-heading">${escapeHtml(positioning.heading)}</h2>
        ${paragraphs(positioning.copy)}
      </div>
    </div>
  </section>

  <section class="home-section coverage" id="what-we-cover" aria-labelledby="coverage-heading">
    <div class="shell">
      <header class="section-intro" data-reveal><h2 id="coverage-heading">${escapeHtml(coverage.heading)}</h2><p>${escapeHtml(coverage.intro)}</p></header>
      <div class="coverage-grid">
        ${coverage.cards.map(card => `<article class="coverage-card" data-reveal>
          ${card.image ? `<a class="coverage-media" href="${escapeHtml(card.url)}" tabindex="-1" aria-hidden="true">${photo(card.image, { sizes: '(max-width: 600px) 100vw, 380px', className: 'coverage-photo' })}</a>` : ''}
          <div class="coverage-body">
            <span class="icon-badge">${icon(sectionIcons[card.url])}</span>
            <h3>${escapeHtml(card.label)}</h3>
            <p>${escapeHtml(card.text)}</p>
            <a class="text-link" href="${escapeHtml(card.url)}">${escapeHtml(card.link)}</a>
          </div>
        </article>`).join('')}
      </div>
    </div>
  </section>
${dataHighlight(copy.data_highlight, posts, nav, chart)}
  <section class="home-section methodology has-backdrop" aria-labelledby="methodology-heading">
    ${backdrop(methodology.image)}
    <div class="shell split">
      <div class="measure" data-reveal>
        <h2 id="methodology-heading">${escapeHtml(methodology.heading)}</h2>
        ${paragraphs(methodology.copy)}
        <a class="text-link text-link--light" href="${escapeHtml(methodology.link.url)}">${escapeHtml(methodology.link.label)}</a>
      </div>
      <ol class="step-cards">${methodology.steps.map(step => `<li class="glass glass--dark" data-reveal>${escapeHtml(step)}</li>`).join('')}</ol>
    </div>
  </section>
${featuredSection}
  <section class="home-section audience" aria-labelledby="audience-heading">
    <div class="shell split">
      <div class="measure" data-reveal>
        <h2 id="audience-heading">${escapeHtml(audience.heading)}</h2>
        ${paragraphs(audience.copy)}
        <ul class="chips" aria-label="Who Verdict Point is for">${audience.chips.map(chip => `<li>${escapeHtml(chip)}</li>`).join('')}</ul>
      </div>
      <div class="media-frame media-frame--right audience-visual" data-reveal>${photo(audience.image, { sizes: '(max-width: 900px) 100vw, 40vw' })}</div>
    </div>
  </section>
${latestSection}
${closingBand(closing)}`;
}

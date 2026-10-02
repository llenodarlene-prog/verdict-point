import { escapeHtml } from './content.mjs';

// Small line marks for the trust strip. Decorative only.
const icons = {
  source: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/>',
  definition: '<path d="M5 6h14M5 12h9M5 18h12"/>',
  compare: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
  revisit: '<path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v5h-5"/>'
};
const icon = name => `<svg class="trust-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[name] || ''}</svg>`;

// Approved editorial photography, served at two widths. The hero loads eagerly because it is above the fold.
export function photo(image, { eager = false, sizes }) {
  return `<img class="home-photo" src="${escapeHtml(image.src)}" srcset="${escapeHtml(image.small)} 800w, ${escapeHtml(image.src)} ${image.width}w" sizes="${sizes}" width="${image.width}" height="${image.height}" alt="${escapeHtml(image.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

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
  return `<article class="post-card post-card--${size}">
    ${label ? `<p class="card-label">${escapeHtml(label)}</p>` : ''}
    <h3><a href="${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a></h3>
    ${date ? `<p class="card-date"><time datetime="${escapeHtml(date)}">${escapeHtml(formatDate(date))}</time></p>` : ''}
    <p>${escapeHtml(post.description)}</p>
    ${linkLabel ? `<a class="text-link" href="${escapeHtml(post.slug)}">${escapeHtml(linkLabel)}</a>` : ''}
  </article>`;
}

const paragraphs = items => items.map(text => `<p>${escapeHtml(text)}</p>`).join('');

export function renderHome(copy, posts, nav) {
  const { hero, trust, positioning, coverage, methodology, featured, audience, latest, closing } = copy;
  const latestPosts = posts.slice(0, latest.limit);
  // Featured and latest sections only render once published research exists; drafts never appear here.
  const primaryUrl = posts.length ? hero.primary_cta.url : hero.primary_cta.fallback_url;

  const featuredSection = posts.length ? `
  <section class="home-section featured" aria-labelledby="featured-heading">
    <div class="shell">
      <header class="section-intro"><h2 id="featured-heading">${escapeHtml(featured.heading)}</h2><p>${escapeHtml(featured.intro)}</p></header>
      <div class="featured-grid">
        ${postCard(posts[0], nav, { size: 'large', linkLabel: featured.link })}
        ${posts.length > 1 ? `<div class="featured-stack">${posts.slice(1, 3).map(post => postCard(post, nav)).join('')}</div>` : ''}
      </div>
    </div>
  </section>` : '';

  const latestSection = posts.length ? `
  <section class="home-section latest" id="latest-analysis" aria-labelledby="latest-heading">
    <div class="shell">
      <h2 id="latest-heading">${escapeHtml(latest.heading)}</h2>
      <div class="post-grid">${latestPosts.map(post => postCard(post, nav)).join('')}</div>
    </div>
  </section>` : '';

  return `
  <section class="home-hero" aria-labelledby="home-heading">
    <div class="shell hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">${escapeHtml(hero.eyebrow)}</p>
        <h1 id="home-heading">${escapeHtml(hero.heading)}</h1>
        ${paragraphs(hero.copy)}
        <div class="cta-row">
          <a class="button button--primary" href="${escapeHtml(primaryUrl)}">${escapeHtml(hero.primary_cta.label)}</a>
          <a class="button button--secondary" href="${escapeHtml(hero.secondary_cta.url)}">${escapeHtml(hero.secondary_cta.label)}</a>
        </div>
      </div>
      <div class="hero-visual">${photo(hero.image, { eager: true, sizes: '(max-width: 900px) 100vw, 45vw' })}</div>
    </div>
  </section>

  <section class="trust-strip" aria-label="Our editorial standard">
    <div class="shell trust-grid">
      ${trust.map(item => `<div class="trust-item">${icon(item.icon)}<h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.text)}</p></div>`).join('')}
    </div>
  </section>

  <section class="home-section positioning" aria-labelledby="positioning-heading">
    <div class="shell split">
      <div class="measure">
        <h2 id="positioning-heading">${escapeHtml(positioning.heading)}</h2>
        ${paragraphs(positioning.copy)}
      </div>
      <aside class="question-panel" aria-label="Questions we ask">
        <p class="panel-label">Questions we ask</p>
        <ol>${positioning.questions.map(question => `<li>${escapeHtml(question)}</li>`).join('')}</ol>
      </aside>
    </div>
  </section>

  <section class="home-section coverage" id="what-we-cover" aria-labelledby="coverage-heading">
    <div class="shell">
      <header class="section-intro"><h2 id="coverage-heading">${escapeHtml(coverage.heading)}</h2><p>${escapeHtml(coverage.intro)}</p></header>
      <div class="coverage-grid">
        ${coverage.cards.map(card => `<article class="coverage-card">
          <p class="card-label">${escapeHtml(card.label)}</p>
          <p>${escapeHtml(card.text)}</p>
          <a class="text-link" href="${escapeHtml(card.url)}">${escapeHtml(card.link)}</a>
        </article>`).join('')}
      </div>
    </div>
  </section>

  <section class="home-section methodology" aria-labelledby="methodology-heading">
    <div class="shell split">
      <div class="measure">
        <h2 id="methodology-heading">${escapeHtml(methodology.heading)}</h2>
        ${paragraphs(methodology.copy)}
        <a class="text-link text-link--light" href="${escapeHtml(methodology.link.url)}">${escapeHtml(methodology.link.label)}</a>
      </div>
      <ol class="steps">${methodology.steps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
    </div>
  </section>
${featuredSection}
  <section class="home-section audience" aria-labelledby="audience-heading">
    <div class="shell split split--media">
      <div class="audience-visual">${photo(audience.image, { sizes: '(max-width: 900px) 100vw, 40vw' })}</div>
      <div class="measure">
        <h2 id="audience-heading">${escapeHtml(audience.heading)}</h2>
        ${paragraphs(audience.copy)}
        <ul class="chips" aria-label="Who Verdict Point is for">${audience.chips.map(chip => `<li>${escapeHtml(chip)}</li>`).join('')}</ul>
      </div>
    </div>
  </section>
${latestSection}
  <section class="closing-cta" aria-labelledby="closing-heading">
    <div class="shell measure">
      <h2 id="closing-heading">${escapeHtml(closing.heading)}</h2>
      <p>${escapeHtml(closing.copy)}</p>
      <a class="button button--primary" href="${escapeHtml(closing.cta.url)}">${escapeHtml(closing.cta.label)}</a>
    </div>
  </section>`;
}

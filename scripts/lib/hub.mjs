import { escapeHtml } from './content.mjs';
import { photo, postCard, icon, sectionIcons, dataHighlight, closingBand } from './home.mjs';

// Category hub: hero, topic chips, a chart from published research, featured story, latest analysis, and links to the other sections.
// Only published posts under the hub's slug appear.
export function renderHub(hub, shared, posts, nav, { slug, chart, allPosts = posts, sections = [], closing } = {}) {
  const featured = posts[0];
  const rest = posts.slice(1);
  const others = sections.filter(section => section.url !== slug);
  return `
  <section class="home-hero hub-hero" aria-labelledby="hub-heading">
    <div class="shell hero-grid">
      <div class="hero-copy">
        <p class="eyebrow"><span class="icon-badge icon-badge--small">${icon(sectionIcons[slug])}</span>${escapeHtml(hub.eyebrow)}</p>
        <h1 id="hub-heading">${escapeHtml(hub.heading)}</h1>
        <p>${escapeHtml(hub.copy)}</p>
        <ul class="chips" aria-label="${escapeHtml(shared.topics_heading)}">${hub.topics.map(topic => `<li>${escapeHtml(topic)}</li>`).join('')}</ul>
      </div>
      <div class="media-frame media-frame--right hero-visual">${photo(hub.image, { eager: true, sizes: '(max-width: 900px) 100vw, 45vw' })}</div>
    </div>
  </section>
${featured ? `
  <section class="home-section featured" aria-label="${escapeHtml(shared.featured_label)}">
    <div class="shell">
      <p class="card-label" data-reveal>${escapeHtml(shared.featured_label)}</p>
      ${postCard(featured, nav, { size: 'large', linkLabel: shared.featured_link })}
    </div>
  </section>` : ''}
${dataHighlight(hub.data_highlight ? { ...hub.data_highlight, label: shared.data_label, link: shared.featured_link } : null, allPosts, nav, chart, { reverse: true })}
  <section class="home-section latest" aria-labelledby="hub-latest-heading">
    <div class="shell">
      <h2 id="hub-latest-heading" data-reveal>${escapeHtml(shared.latest_heading)}</h2>
      ${rest.length ? `<div class="post-grid">${rest.map(post => postCard(post, nav)).join('')}</div>` : `<p class="empty-state">${escapeHtml(shared.empty_state)}</p>`}
    </div>
  </section>
${others.length ? `
  <section class="home-section coverage explore" aria-labelledby="explore-heading">
    <div class="shell">
      <h2 id="explore-heading" data-reveal>${escapeHtml(shared.explore_heading)}</h2>
      <div class="explore-grid">
        ${others.map(section => `<a class="glass explore-card" href="${escapeHtml(section.url)}" data-reveal><span class="icon-badge">${icon(sectionIcons[section.url])}</span><span class="explore-label">${escapeHtml(section.label)}</span><span class="explore-text">${escapeHtml(section.text)}</span></a>`).join('')}
      </div>
    </div>
  </section>` : ''}
${closing ? closingBand(closing, { id: 'hub-closing-heading' }) : ''}`;
}

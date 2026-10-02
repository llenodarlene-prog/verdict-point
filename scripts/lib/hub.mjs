import { escapeHtml } from './content.mjs';
import { photo, postCard } from './home.mjs';

// Category hub: hero, featured story, topic chips, latest analysis. Only published posts under the hub's slug appear.
export function renderHub(hub, shared, posts, nav) {
  const square = hub.image.width === hub.image.height;
  const featured = posts[0];
  const rest = posts.slice(1);
  return `
  <section class="home-hero hub-hero" aria-labelledby="hub-heading">
    <div class="shell hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">${escapeHtml(hub.eyebrow)}</p>
        <h1 id="hub-heading">${escapeHtml(hub.heading)}</h1>
        <p>${escapeHtml(hub.copy)}</p>
      </div>
      <div class="hero-visual${square ? ' hero-visual--square' : ''}">${photo(hub.image, { eager: true, sizes: '(max-width: 900px) 100vw, 45vw' })}</div>
    </div>
  </section>

  <section class="hub-topics" aria-labelledby="topics-heading">
    <div class="shell topics-row">
      <h2 id="topics-heading" class="panel-label">${escapeHtml(shared.topics_heading)}</h2>
      <ul class="chips">${hub.topics.map(topic => `<li>${escapeHtml(topic)}</li>`).join('')}</ul>
    </div>
  </section>
${featured ? `
  <section class="home-section featured" aria-label="${escapeHtml(shared.featured_label)}">
    <div class="shell">
      <p class="card-label">${escapeHtml(shared.featured_label)}</p>
      ${postCard(featured, nav, { size: 'large', linkLabel: shared.featured_link })}
    </div>
  </section>` : ''}
  <section class="home-section latest" aria-labelledby="hub-latest-heading">
    <div class="shell">
      <h2 id="hub-latest-heading">${escapeHtml(shared.latest_heading)}</h2>
      ${rest.length ? `<div class="post-grid">${rest.map(post => postCard(post, nav)).join('')}</div>` : `<p class="empty-state">${escapeHtml(shared.empty_state)}</p>`}
    </div>
  </section>`;
}

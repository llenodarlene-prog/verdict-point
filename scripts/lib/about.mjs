import { escapeHtml } from './content.mjs';
import { photo, icon, backdrop } from './home.mjs';

const paragraphs = items => items.map(text => `<p>${escapeHtml(text)}</p>`).join('');
const sourceIcons = ['chip', 'megaphone', 'users', 'survey'];
const tileIcons = ['compare', 'table', 'calculator', 'check', 'survey', 'map'];
const panelIcons = ['revisit', 'shield'];

export function renderAbout(copy) {
  const { hero, why, measurement, research, originality, ai, corrections, audience } = copy;
  return `
  <section class="about-hero hero--immersive has-backdrop" aria-labelledby="about-heading">
    ${backdrop(hero.image, { eager: true })}
    <div class="shell">
      <div class="glass about-hero-copy">
        <p class="eyebrow">${escapeHtml(hero.eyebrow)}</p>
        <h1 id="about-heading">${escapeHtml(hero.heading)}</h1>
        ${paragraphs(hero.copy)}
      </div>
    </div>
  </section>

  <section class="home-section" aria-labelledby="why-heading">
    <div class="shell split">
      <div class="measure" data-reveal>
        <h2 id="why-heading">${escapeHtml(why.heading)}</h2>
        ${paragraphs(why.copy)}
      </div>
      <ul class="source-grid" aria-label="Sources with a point of view">
        ${why.sources.map((source, i) => `<li class="glass" data-reveal><span class="icon-badge">${icon(sourceIcons[i % sourceIcons.length])}</span>${escapeHtml(source)}</li>`).join('')}
      </ul>
    </div>
  </section>

  <section class="home-section coverage" aria-labelledby="measurement-heading">
    <div class="shell">
      <header class="section-intro" data-reveal><h2 id="measurement-heading">${escapeHtml(measurement.heading)}</h2><p>${escapeHtml(measurement.intro)}</p></header>
      <div class="scenario-grid">
        ${measurement.cards.map(card => `<article class="glass scenario-card" data-reveal><p class="card-label">${escapeHtml(card.label)}</p><h3>${escapeHtml(card.question)}</h3></article>`).join('')}
      </div>
      <p class="scenario-closing" data-reveal>${escapeHtml(measurement.closing)}</p>
    </div>
  </section>

  <section class="home-section methodology has-backdrop" id="${escapeHtml(research.id)}" aria-labelledby="research-heading">
    ${backdrop(research.image)}
    <div class="shell">
      <header class="section-intro" data-reveal><h2 id="research-heading">${escapeHtml(research.heading)}</h2><p>${escapeHtml(research.intro)}</p></header>
      <ol class="step-cards step-cards--row">${research.steps.map(step => `<li class="glass glass--dark" data-reveal>${escapeHtml(step)}</li>`).join('')}</ol>
      <div class="process-copy" data-reveal>${paragraphs(research.copy)}</div>
    </div>
  </section>

  <section class="home-section" aria-labelledby="originality-heading">
    <div class="shell split">
      <div class="measure" data-reveal>
        <h2 id="originality-heading" class="statement">${escapeHtml(originality.heading)}</h2>
        ${paragraphs(originality.copy)}
      </div>
      <ul class="tile-grid" aria-label="Examples of original research assets">
        ${originality.tiles.map((tile, i) => `<li class="glass" data-reveal><span class="icon-badge">${icon(tileIcons[i % tileIcons.length])}</span>${escapeHtml(tile)}</li>`).join('')}
      </ul>
    </div>
  </section>

  <section class="home-section coverage" aria-labelledby="ai-heading">
    <div class="shell split split--media">
      <div class="media-frame ai-visual" data-reveal>${photo(ai.image, { sizes: '(max-width: 900px) 100vw, 45vw' })}</div>
      <div class="measure" data-reveal>
        <h2 id="ai-heading">${escapeHtml(ai.heading)}</h2>
        ${paragraphs(ai.copy)}
      </div>
    </div>
  </section>

  <section class="home-section" aria-label="Corrections and independence">
    <div class="shell panel-stack">
      ${corrections.map((panel, i) => `<article class="glass editorial-panel" data-reveal><span class="icon-badge">${icon(panelIcons[i % panelIcons.length])}</span><h2>${escapeHtml(panel.heading)}</h2><p>${escapeHtml(panel.copy)}</p></article>`).join('')}
    </div>
  </section>

  <section class="closing-cta has-backdrop" aria-labelledby="audience-heading">
    ${backdrop(audience.image)}
    <div class="shell">
      <div class="glass glass--dark closing-panel" data-reveal>
        <h2 id="audience-heading">${escapeHtml(audience.heading)}</h2>
        <p>${escapeHtml(audience.copy)}</p>
        <ul class="chips chips--center chips--dark" aria-label="Who Verdict Point writes for">${audience.chips.map(chip => `<li>${escapeHtml(chip)}</li>`).join('')}</ul>
        <p class="audience-closing">${escapeHtml(audience.closing)}</p>
      </div>
    </div>
  </section>`;
}

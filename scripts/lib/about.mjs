import { escapeHtml } from './content.mjs';
import { photo } from './home.mjs';

const paragraphs = items => items.map(text => `<p>${escapeHtml(text)}</p>`).join('');

export function renderAbout(copy) {
  const { hero, why, measurement, research, originality, ai, corrections, audience } = copy;
  return `
  <section class="about-hero" aria-labelledby="about-heading">
    <div class="shell about-hero-copy">
      <p class="eyebrow">${escapeHtml(hero.eyebrow)}</p>
      <h1 id="about-heading">${escapeHtml(hero.heading)}</h1>
      ${paragraphs(hero.copy)}
    </div>
    <div class="shell about-hero-visual">${photo(hero.image, { eager: true, sizes: '(max-width: 1192px) 100vw, 1160px' })}</div>
  </section>

  <section class="home-section" aria-labelledby="why-heading">
    <div class="shell split">
      <div class="measure">
        <h2 id="why-heading">${escapeHtml(why.heading)}</h2>
        ${paragraphs(why.copy)}
      </div>
      <ul class="source-grid" aria-label="Sources with a point of view">
        ${why.sources.map(source => `<li>${escapeHtml(source)}</li>`).join('')}
      </ul>
    </div>
  </section>

  <section class="home-section coverage" aria-labelledby="measurement-heading">
    <div class="shell">
      <header class="section-intro"><h2 id="measurement-heading">${escapeHtml(measurement.heading)}</h2><p>${escapeHtml(measurement.intro)}</p></header>
      <div class="scenario-grid">
        ${measurement.cards.map(card => `<article class="coverage-card scenario-card"><p class="card-label">${escapeHtml(card.label)}</p><h3>${escapeHtml(card.question)}</h3></article>`).join('')}
      </div>
      <p class="scenario-closing">${escapeHtml(measurement.closing)}</p>
    </div>
  </section>

  <section class="home-section methodology" id="${escapeHtml(research.id)}" aria-labelledby="research-heading">
    <div class="shell">
      <header class="section-intro"><h2 id="research-heading">${escapeHtml(research.heading)}</h2><p>${escapeHtml(research.intro)}</p></header>
      <ol class="process">${research.steps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
      <div class="process-copy">${paragraphs(research.copy)}</div>
    </div>
  </section>

  <section class="home-section" aria-labelledby="originality-heading">
    <div class="shell split">
      <div class="measure">
        <h2 id="originality-heading" class="statement">${escapeHtml(originality.heading)}</h2>
        ${paragraphs(originality.copy)}
      </div>
      <ul class="tile-grid" aria-label="Examples of original research assets">
        ${originality.tiles.map(tile => `<li>${escapeHtml(tile)}</li>`).join('')}
      </ul>
    </div>
  </section>

  <section class="home-section coverage" aria-labelledby="ai-heading">
    <div class="shell split">
      <div class="measure">
        <h2 id="ai-heading">${escapeHtml(ai.heading)}</h2>
        ${paragraphs(ai.copy)}
      </div>
      <div class="ai-visual">${photo(ai.image, { sizes: '(max-width: 900px) 100vw, 45vw' })}</div>
    </div>
  </section>

  <section class="home-section" aria-label="Corrections and independence">
    <div class="shell panel-stack">
      ${corrections.map(panel => `<article class="editorial-panel"><h2>${escapeHtml(panel.heading)}</h2><p>${escapeHtml(panel.copy)}</p></article>`).join('')}
    </div>
  </section>

  <section class="closing-cta" aria-labelledby="audience-heading">
    <div class="shell measure">
      <h2 id="audience-heading">${escapeHtml(audience.heading)}</h2>
      <p>${escapeHtml(audience.copy)}</p>
      <ul class="chips chips--center" aria-label="Who Verdict Point writes for">${audience.chips.map(chip => `<li>${escapeHtml(chip)}</li>`).join('')}</ul>
      <p class="audience-closing">${escapeHtml(audience.closing)}</p>
    </div>
  </section>`;
}

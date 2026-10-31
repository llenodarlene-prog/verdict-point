// Legal FAQ hub: every question and answer is rendered into the initial HTML from data/legal-faq.json.
// The browser script only adds search, topic filters, and copy-link buttons on top of this markup.
import { escapeHtml } from './content.mjs';

const inline = (text, icon) => escapeHtml(text)
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => /^https?:/.test(href)
    ? `<a href="${href}" rel="noopener" target="_blank">${label}${icon('external-link')}<span class="visually-hidden"> (opens in a new tab)</span></a>`
    : `<a href="${href}">${label}</a>`);

export function validateFaq(faq) {
  const topics = new Set(faq.topics.map(t => t.id));
  const ids = new Set();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(faq.reviewed || '')) throw new Error('data/legal-faq.json: reviewed date must be YYYY-MM-DD');
  for (const q of faq.questions) {
    if (!q.id || ids.has(q.id)) throw new Error(`data/legal-faq.json: missing or duplicate id ${q.id}`);
    ids.add(q.id);
    if (!topics.has(q.topic)) throw new Error(`data/legal-faq.json: ${q.id} has unknown topic ${q.topic}`);
    if (!q.q?.endsWith('?') || !q.blocks?.length || q.blocks[0][0] !== 'p') throw new Error(`data/legal-faq.json: ${q.id} needs a question and a direct-answer paragraph first`);
    if (!q.blocks.some(([type, value]) => /\]\(\//.test(JSON.stringify(value)))) throw new Error(`data/legal-faq.json: ${q.id} needs a link to a Verdict Point guide or tool`);
    for (const s of q.sources || []) if (!/^https:\/\//.test(s.url) || !s.label) throw new Error(`data/legal-faq.json: ${q.id} has an invalid source`);
    if (/—/.test(JSON.stringify(q))) throw new Error(`data/legal-faq.json: ${q.id} contains an em dash`);
  }
}

function block([type, value, rows], icon) {
  if (type === 'p') return `<p>${inline(value, icon)}</p>`;
  if (type === 'ul' || type === 'ol') return `<${type}>${value.map(item => `<li>${inline(item, icon)}</li>`).join('')}</${type}>`;
  if (type === 'table') return `<div class="faq-table"><table><thead><tr>${value.map(h => `<th scope="col">${inline(h, icon)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${inline(c, icon)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  throw new Error(`legal FAQ: unknown block type ${type}`);
}

export function renderFaqHub(faq, icon) {
  const count = id => faq.questions.filter(q => q.topic === id).length;
  const plain = text => text.replace(/\*\*|\[|\]\([^)]*\)/g, '');
  const search = `<div class="faq-search" role="search"><label for="faq-q">${icon('search')}Search legal-industry questions</label>
<div class="faq-search-row"><input id="faq-q" type="search" autocomplete="off" placeholder="Try billable hours, paralegal, or AI" aria-describedby="faq-count"><button type="button" class="faq-clear" data-faq-clear hidden>${icon('x')}Clear filters</button></div>
<p class="faq-count" id="faq-count" aria-live="polite" data-faq-count>${faq.questions.length} questions</p></div>`;
  const chips = `<div class="faq-chips" role="group" aria-label="Filter by topic" data-faq-chips hidden><button type="button" aria-pressed="true" data-topic="">All topics</button>${faq.topics.filter(t => count(t.id)).map(t => `<button type="button" aria-pressed="false" data-topic="${t.id}">${icon(t.icon)}${escapeHtml(t.name)}</button>`).join('')}</div>`;
  const cards = `<h2 id="faq-topics">Browse by Topic</h2><div class="faq-cards">${faq.topics.map(t => {
    const n = count(t.id), inner = `<span class="faq-card-icon">${icon(t.icon)}</span><span class="faq-card-name">${escapeHtml(t.name)}</span><span class="faq-card-desc">${escapeHtml(t.description)}</span><span class="faq-card-count">${n} ${n === 1 ? 'answer' : 'answers'} so far</span>`;
    return `<a class="faq-card" href="#topic-${t.id}" data-topic-card="${t.id}">${inner}</a>`;
  }).join('')}</div>`;
  const sections = faq.topics.filter(t => count(t.id)).map(t => `<section class="faq-topic" id="topic-${t.id}" data-faq-topic="${t.id}" aria-labelledby="topic-${t.id}-h"><h2 id="topic-${t.id}-h">${icon(t.icon)}${escapeHtml(t.name)}</h2>${
    faq.questions.filter(q => q.topic === t.id).map(q => `<article class="faq-item" id="${q.id}" data-faq-item data-topic="${t.id}" data-terms="${escapeHtml([q.q, q.aliases || '', t.name].join(' ').toLowerCase())}" data-body="${escapeHtml(plain(q.blocks.map(b => JSON.stringify(b.slice(1))).join(' ')).toLowerCase())}">
<h3><a href="#${q.id}">${escapeHtml(q.q)}</a></h3>${q.blocks.map(b => block(b, icon)).join('')}${q.sources?.length ? `<p class="faq-source">Source: ${q.sources.map(s => inline(`[${s.label}](${s.url})`, icon)).join('; ')}</p>` : ''}
<div class="faq-actions"><button type="button" data-faq-copy="${q.id}">${icon('link')}Copy link</button></div></article>`).join('')}</section>`).join('');
  return `<div class="faq" data-faq>${search}${chips}${cards}<h2 id="faq-answers" class="faq-answers-h">Featured Answers</h2><p class="faq-empty" data-faq-empty hidden>No questions match that search. Try a shorter word, or <a href="/contact/">send us the question</a>.</p>${sections}</div>`;
}

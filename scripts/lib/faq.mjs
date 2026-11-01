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

const item = (q, t, icon, plain) => `<article class="faq-item" id="${q.id}" data-faq-item data-topic="${q.subtopic && !t.root ? q.subtopic : q.topic}" data-terms="${escapeHtml([q.q, q.aliases || '', t.name].join(' ').toLowerCase())}" data-body="${escapeHtml(plain(q.blocks.map(b => JSON.stringify(b.slice(1))).join(' ')).toLowerCase())}">
<h3><a href="#${q.id}">${escapeHtml(q.q)}</a></h3>${q.blocks.map(b => block(b, icon)).join('')}${q.sources?.length ? `<p class="faq-source">Source: ${q.sources.map(s => inline(`[${s.label}](${s.url})`, icon)).join('; ')}</p>` : ''}
<div class="faq-actions"><button type="button" data-faq-copy="${q.id}">${icon('link')}Copy link</button></div></article>`;

const searchBox = (n, placeholder, icon) => `<div class="faq-search" role="search"><label for="faq-q">${icon('search')}Search legal-industry questions</label>
<div class="faq-search-row"><input id="faq-q" type="search" autocomplete="off" placeholder="${escapeHtml(placeholder)}" aria-describedby="faq-count"><button type="button" class="faq-clear" data-faq-clear hidden>${icon('x')}Clear filters</button></div>
<p class="faq-count" id="faq-count" aria-live="polite" data-faq-count>${n} questions</p></div>`;
const chipRow = (label, groups, icon) => `<div class="faq-chips" role="group" aria-label="${label}" data-faq-chips hidden><button type="button" aria-pressed="true" data-topic="">All</button>${groups.map(g => `<button type="button" aria-pressed="false" data-topic="${g.id}">${g.icon ? icon(g.icon) : ''}${escapeHtml(g.name)}</button>`).join('')}</div>`;
const plainText = text => text.replace(/\*\*|\[|\]\([^)]*\)/g, '');

// With a topic id the block renders that topic's silo page; without one it renders the root hub's featured answers.
export function renderFaqHub(faq, icon, topicId = '') {
  if (topicId) {
    const t = faq.topics.find(x => x.id === topicId);
    if (!t?.url) throw new Error(`legal FAQ: no launched silo for ${topicId}`);
    const list = faq.questions.filter(q => q.topic === t.id);
    const groups = t.subtopics.map(([id, name]) => ({ id, name, list: list.filter(q => q.subtopic === id) })).filter(g => g.list.length);
    const jump = `<nav class="faq-jump" aria-label="Jump to a subtopic"><ul>${groups.map(g => `<li><a href="#sub-${g.id}">${escapeHtml(g.name)} <span>(${g.list.length})</span></a></li>`).join('')}</ul></nav>`;
    const sections = groups.map(g => `<section class="faq-topic" id="sub-${g.id}" data-faq-topic="${g.id}" aria-labelledby="sub-${g.id}-h"><h2 id="sub-${g.id}-h">${icon(t.icon)}${escapeHtml(g.name)}</h2>${g.list.map(q => item(q, t, icon, plainText)).join('')}</section>`).join('');
    return `<div class="faq" data-faq>${searchBox(list.length, 'Search this topic', icon)}${chipRow('Filter by subtopic', groups, icon)}${jump}<p class="faq-empty" data-faq-empty hidden>No questions here match that search. Try the <a href="/legal-faq/">full Legal FAQ</a>, or <a href="/contact/">send us the question</a>.</p>${sections}</div>`;
  }
  const featured = faq.questions.filter(q => q.featured);
  const count = id => faq.questions.filter(q => q.topic === id).length;
  const shown = faq.topics.filter(t => featured.some(q => q.topic === t.id));
  const cards = `<h2 id="faq-topics">Browse by Topic</h2><div class="faq-cards">${faq.topics.map(t => {
    const n = count(t.id), href = t.url || `#topic-${t.id}`;
    return `<a class="faq-card${t.url ? ' is-silo' : ''}" href="${href}"${t.url ? '' : ` data-topic-card="${t.id}"`}><span class="faq-card-icon">${icon(t.icon)}</span><span class="faq-card-name">${escapeHtml(t.name)}</span><span class="faq-card-desc">${escapeHtml(t.description)}</span><span class="faq-card-count">${t.url ? `${n} answers ${icon('arrow-right')}` : `${n} ${n === 1 ? 'answer' : 'answers'} so far`}</span></a>`;
  }).join('')}</div>`;
  const sections = shown.map(t => { const root = { ...t, root: true }; return `<section class="faq-topic" id="topic-${t.id}" data-faq-topic="${t.id}" aria-labelledby="topic-${t.id}-h"><h2 id="topic-${t.id}-h">${icon(t.icon)}${escapeHtml(t.name)}</h2>${
    featured.filter(q => q.topic === t.id).map(q => item(q, root, icon, plainText)).join('')}${t.url ? `<p class="faq-more"><a href="${t.url}">See all ${count(t.id)} ${escapeHtml(t.name.toLowerCase())} questions ${icon('arrow-right')}</a></p>` : ''}</section>`; }).join('');
  return `<div class="faq" data-faq>${searchBox(featured.length, 'Try billable hours, paralegal, or AI', icon)}${chipRow('Filter by topic', shown, icon)}${cards}<h2 id="faq-answers" class="faq-answers-h">Featured Answers</h2><p class="faq-empty" data-faq-empty hidden>No questions match that search. Try a shorter word, or <a href="/contact/">send us the question</a>.</p>${sections}</div>`;
}

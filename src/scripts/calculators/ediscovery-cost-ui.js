// eDiscovery Cost Calculator interface. The model lives in ediscovery-cost-core.js; this file only reads inputs and writes results.
// Figures never leave the browser: no storage, no network requests, no share links, and results are written with textContent only.
import { GROUPS, compute, EXAMPLE } from './ediscovery-cost-core.js';

const root = document.querySelector('[data-calc="ediscovery-cost"]');
if (root) init(root);

function init(root) {
  const form = root.querySelector('form');
  const out = root.querySelector('[data-out]');
  const live = root.querySelector('[data-live]');
  const stepsWrap = root.querySelector('[data-steps-wrap]');
  const stepsOut = root.querySelector('[data-steps]');
  const fields = GROUPS.flatMap(g => g.fields.map(f => ({ ...f, groupOptional: !!g.optional })));
  const el = (tag, attrs = {}, text) => { const node = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v); if (text !== undefined) node.textContent = text; return node; };
  const SVGNS = 'http://www.w3.org/2000/svg';
  const icon = name => { const svg = document.createElementNS(SVGNS, 'svg'); svg.setAttribute('class', 'ti'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false'); const use = document.createElementNS(SVGNS, 'use'); use.setAttribute('href', `#ti-${name}`); svg.append(use); return svg; };
  const tile = ([iconName, label, value, note]) => { const t = el('div', { class: 'bhc-tile' }); const top = el('span', { class: 'bhc-tile-top' }); top.append(icon(iconName), document.createTextNode(label)); t.append(top, el('span', { class: 'bhc-tile-value' }, value)); if (note) t.append(el('span', { class: 'bhc-tile-note' }, note)); return t; };
  const flash = node => { node.classList.remove('is-updated'); void node.offsetWidth; node.classList.add('is-updated'); };
  const toastEl = el('div', { class: 'bhc-toast', role: 'status' });
  document.body.append(toastEl);
  let toastTimer = null, summary = '', timer = null;
  const toast = message => { toastEl.replaceChildren(icon('check'), document.createTextNode(message)); toastEl.classList.add('is-on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2200); };
  const setLabel = (button, text) => { const node = [...button.childNodes].reverse().find(n => n.nodeType === 3); if (node) node.nodeValue = text; else button.append(document.createTextNode(text)); };
  const labelOf = button => ([...button.childNodes].reverse().find(n => n.nodeType === 3)?.nodeValue || button.textContent).trim();
  const input = key => form.querySelector(`[name="${key}"]`);
  function setError(node, message) {
    node.setAttribute('aria-invalid', message ? 'true' : 'false');
    const box = document.getElementById(`${node.id}-err`);
    if (box) box.textContent = message || '';
  }
  function parse(text) {
    const t = String(text ?? '').trim().replace(/[$,%\s]/g, '');
    if (!t) return null;
    if (!/^\d*\.?\d+$/.test(t)) return NaN;
    const n = Number(t);
    return n <= 1e12 ? n : NaN;
  }
  function read() {
    const values = {};
    let bad = false;
    for (const f of fields) {
      const node = input(f.key);
      setError(node, '');
      if (f.type === 'select') { values[f.key] = node.value; continue; }
      const v = parse(node.value);
      if (v === null) continue;
      let message = '';
      if (Number.isNaN(v)) message = 'Enter a number of zero or more, using digits only.';
      else if (f.type === 'int' && (!Number.isInteger(v) || v < (f.min ?? 0) || v > (f.max ?? 1e12))) message = `Enter a whole number from ${f.min ?? 0} to ${f.max ?? 'any size'}.`;
      else if (f.type === 'pct' && v > 100) message = 'Enter a percentage from 0 to 100.';
      if (message) { setError(node, message); bad = true; continue; }
      values[f.key] = v;
    }
    return { values, bad };
  }
  function run({ announce = true, focus = false } = {}) {
    const { values } = read();
    const r = compute(values);
    if (r.empty) { out.replaceChildren(el('p', { class: 'bhc-empty' }, r.empty)); stepsWrap.hidden = true; summary = ''; return; }
    const head = el('p', { class: 'ldc-answer' });
    head.append(icon(r.headline.icon), el('span', { class: 'ldc-label' }, r.headline.label), el('strong', {}, r.headline.value));
    const grid = el('div', { class: 'bhc-tiles' }); grid.append(...r.tiles.map(tile));
    out.replaceChildren(head, grid, el('p', { class: 'bhc-formula' }, r.formula));
    flash(out);
    const table = el('table', { class: 'bhc-table ldc-table' });
    table.append(el('caption', {}, r.table.caption));
    const hr = el('tr'); for (const h of r.table.head) hr.append(el('th', { scope: 'col' }, h));
    const thead = el('thead'); thead.append(hr); const tbody = el('tbody');
    for (const row of r.table.rows) { const tr = el('tr'); row.forEach((c, i) => tr.append(el(i === 0 ? 'th' : 'td', i === 0 ? { scope: 'row' } : {}, c))); tbody.append(tr); }
    table.append(thead, tbody);
    stepsOut.replaceChildren(table); stepsWrap.hidden = false;
    summary = ['Verdict Point eDiscovery Cost Calculator', `${r.headline.label}: ${r.headline.value}`, ...r.summary, '', 'All inputs were entered by the user. This is arithmetic, not a quote or advice.', `Calculated ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`, location.origin + location.pathname].join('\n');
    if (announce) live.textContent = `${r.headline.label}: ${r.headline.value}.`;
    if (focus && window.matchMedia('(max-width: 767px)').matches) root.querySelector('[data-result-h]').focus();
  }
  async function copyText(button, text) {
    try { await navigator.clipboard.writeText(text); }
    catch { const area = el('textarea'); area.value = text; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0'; document.body.append(area); area.select(); document.execCommand('copy'); area.remove(); }
    const label = labelOf(button); setLabel(button, 'Copied'); live.textContent = 'Copied to clipboard.'; toast('Copied to clipboard.');
    setTimeout(() => setLabel(button, label), 2000);
  }
  form.addEventListener('submit', e => { e.preventDefault(); run({ focus: true }); });
  form.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 300); });
  form.addEventListener('change', () => run());
  root.addEventListener('click', e => {
    const button = e.target.closest('button[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'example') { for (const [k, v] of Object.entries(EXAMPLE)) input(k).value = String(v); run({ focus: true }); live.textContent = 'Example figures loaded.'; }
    if (action === 'clear') { for (const f of fields) { const node = input(f.key); if (f.type === 'select') node.selectedIndex = 0; else node.value = ''; } run({ announce: false }); live.textContent = 'Calculator cleared.'; }
    if (action === 'copy') copyText(button, summary || 'No result to copy yet.');
    if (action === 'print') { stepsWrap.open = true; document.body.dataset.bhcPrint = 'calc'; window.print(); }
  });
  window.addEventListener('afterprint', () => { delete document.body.dataset.bhcPrint; });
  run({ announce: false });
  root.classList.add('bhc-ready');
}

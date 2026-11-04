// Law firm SEO ROI calculator interface. The model lives in law-firm-seo-roi-core.js; this file only reads inputs and writes results.
// Firm figures never leave the browser: no storage, no network requests, no share links, and results are written with textContent only.
import { SHARED, FUNNEL, SCENARIOS, SCENARIO_LABELS, PERCENT_FIELDS, parseFigure, rangeErrors, modelScenario, EXAMPLE } from './law-firm-seo-roi-core.js';

const root = document.querySelector('[data-seo]');
if (root) init(root);

function init(root) {
  const form = root.querySelector('form');
  const out = root.querySelector('[data-out]');
  const live = root.querySelector('[data-live]');
  const stepsWrap = root.querySelector('[data-steps-wrap]');
  const stepsOut = root.querySelector('[data-steps]');
  const page = location.origin + location.pathname;
  const el = (tag, attrs = {}, text) => { const node = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v); if (text !== undefined) node.textContent = text; return node; };
  // Visual helpers: Tabler icons from the page's inline sprite, stat tiles, a result fade, and a short toast.
  const SVGNS = 'http://www.w3.org/2000/svg';
  const icon = name => { const svg = document.createElementNS(SVGNS, 'svg'); svg.setAttribute('class', 'ti'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false'); const use = document.createElementNS(SVGNS, 'use'); use.setAttribute('href', `#ti-${name}`); svg.append(use); return svg; };
  const tile = (iconName, label, value, note) => { const t = el('div', { class: 'bhc-tile' }); const top = el('span', { class: 'bhc-tile-top' }); top.append(icon(iconName), document.createTextNode(label)); t.append(top, el('span', { class: 'bhc-tile-value' }, value)); if (note) t.append(el('span', { class: 'bhc-tile-note' }, note)); return t; };
  const tiles = list => { const wrap = el('div', { class: 'bhc-tiles' }); wrap.append(...list); return wrap; };
  const flash = node => { node.classList.remove('is-updated'); void node.offsetWidth; node.classList.add('is-updated'); };
  const toastEl = el('div', { class: 'bhc-toast', role: 'status' });
  document.body.append(toastEl);
  let toastTimer = null;
  const toast = message => { toastEl.replaceChildren(icon('check'), document.createTextNode(message)); toastEl.classList.add('is-on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2200); };
  // Buttons hold an icon and a text label; feedback swaps only the label.
  const setLabel = (button, text) => { const node = [...button.childNodes].reverse().find(n => n.nodeType === 3); if (node) node.nodeValue = text; else button.append(document.createTextNode(text)); };
  const labelOf = button => ([...button.childNodes].reverse().find(n => n.nodeType === 3)?.nodeValue || button.textContent).trim();
  const num = (v, d = 1) => new Intl.NumberFormat('en-US', { maximumFractionDigits: d }).format(v);
  const money = v => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
  const short = v => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(v);
  const pct = v => v === null ? 'Not available' : `${num(v)}%`;
  const payback = r => r.paybackMonth === null ? 'Not within the period' : `Month ${r.paybackMonth}`;
  const inputs = [...form.querySelectorAll('input')];
  const sharedInput = key => form.querySelector(`[name="${key}"]`);
  const funnelInput = (s, key) => form.querySelector(`[name="${s}.${key}"]`);
  let summary = '', timer = null;

  function setError(input, message) {
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    const box = document.getElementById(`${input.id}-err`);
    if (box) box.textContent = message || '';
  }
  function read() {
    inputs.forEach(i => setError(i, ''));
    const shared = {}, funnels = {}, bad = new Set();
    const take = (input, store, key) => { const v = parseFigure(input.value); if (v === null) return; if (Number.isNaN(v)) { setError(input, 'Enter a number of zero or more, using digits only.'); bad.add(input.name); return; } store[key] = v; };
    for (const key of Object.keys(SHARED)) take(sharedInput(key), shared, key);
    for (const s of SCENARIOS) { funnels[s] = {}; for (const key of Object.keys(FUNNEL)) take(funnelInput(s, key), funnels[s], key); }
    for (const [name, message] of rangeErrors(shared, funnels)) { setError(form.querySelector(`[name="${name}"]`), message); bad.add(name); }
    if (shared.setupCost === undefined && !bad.has('setupCost')) shared.setupCost = 0;
    if (shared.rampMonths === undefined && !bad.has('rampMonths')) shared.rampMonths = 0;
    const sharedReady = Object.keys(SHARED).every(k => shared[k] !== undefined && !bad.has(k));
    const ready = SCENARIOS.filter(s => Object.keys(FUNNEL).every(k => funnels[s][k] !== undefined && !bad.has(`${s}.${k}`)));
    return { shared, funnels, sharedReady, ready };
  }
  // Cumulative profit against cumulative cost for one scenario, one bar pair per month.
  function chart(shared, r) {
    const wrap = el('div', { class: 'viz' });
    const cap = el('p', { class: 'viz-cap' }); cap.append(icon('chart-bar'), document.createTextNode('Base scenario: cumulative profit against cumulative cost'));
    wrap.append(cap);
    const rows = r.rows.length > 12 ? r.rows.filter((row, i) => i % Math.ceil(r.rows.length / 12) === 0 || i === r.rows.length - 1) : r.rows;
    const max = Math.max(...rows.map(x => Math.max(x.cumulativeCost, x.cumulativeProfit)), 1);
    for (const row of rows) {
      const line = el('div', { class: 'viz-row' });
      const track = el('div', { class: 'viz-track', 'aria-hidden': 'true' }); track.style.display = 'grid'; track.style.gap = '2px'; track.style.height = '1.1rem'; track.style.background = 'transparent';
      for (const [v, cls] of [[row.cumulativeProfit, row.net >= 0 ? ' is-accent' : ' is-gold'], [row.cumulativeCost, '']]) { const bg = el('span', { class: 'viz-track' }); bg.style.height = '100%'; const fill = el('span', { class: `viz-fill${cls}` }); fill.style.width = `${v / max * 100}%`; bg.append(fill); track.append(bg); }
      line.append(el('span', {}, `Month ${row.month}`), track, el('span', { class: 'viz-num' }, money(row.net)));
      wrap.append(line);
    }
    const legend = el('ul', { class: 'ldc-legend', 'aria-hidden': 'true' });
    for (const [label, color] of [['Cumulative profit (paid back)', 'var(--accent)'], ['Cumulative profit (not yet)', 'var(--secondary)'], ['Cumulative cost', 'var(--ink)']]) { const li = el('li'); li.append(el('i', { style: `background:${color}` }), document.createTextNode(label)); legend.append(li); }
    wrap.append(legend, el('p', { class: 'bhc-note' }, 'The figure on the right is profit minus cost to date.'));
    return wrap;
  }
  function compare(results) {
    const table = el('table', { class: 'seo-compare' });
    table.append(el('caption', {}, 'Scenario comparison'));
    const hr = el('tr'); hr.append(el('th', { scope: 'col' }, 'Measure')); for (const s of Object.keys(results)) hr.append(el('th', { scope: 'col', class: s === 'base' ? 'is-base' : '' }, SCENARIO_LABELS[s]));
    const thead = el('thead'); thead.append(hr); const tbody = el('tbody');
    const rows = [['New clients', r => num(r.clients)], ['Fee revenue', r => short(r.revenue)], ['Profit', r => short(r.profit)], ['Net return', r => short(r.net)], ['ROI', r => pct(r.roi)], ['Payback month', r => r.paybackMonth === null ? 'None' : String(r.paybackMonth)], ['Cost per client', r => r.costPerClient === null ? 'n/a' : short(r.costPerClient)]];
    for (const [label, f] of rows) { const tr = el('tr'); tr.append(el('th', { scope: 'row' }, label)); for (const [s, r] of Object.entries(results)) tr.append(el('td', { class: s === 'base' ? 'is-base' : '' }, f(r))); tbody.append(tr); }
    table.append(thead, tbody);
    const scroller = el('div', { class: 'seo-scroll' }); scroller.append(table);
    return scroller;
  }
  function run({ announce = true, focus = false } = {}) {
    const { shared, funnels, sharedReady, ready } = read();
    if (!sharedReady || !ready.length) { out.replaceChildren(el('p', { class: 'bhc-empty' }, 'Add your costs, fees, and margin, then fill in at least one scenario to see ROI, payback, and break-even clients.')); stepsWrap.hidden = true; summary = ''; return; }
    const results = Object.fromEntries(ready.map(s => [s, modelScenario(shared, funnels[s])]));
    const lead = results.base ? 'base' : ready[0];
    const r = results[lead];
    const head = el('p', { class: 'ldc-answer' });
    head.append(icon('trending-up'), el('span', { class: 'ldc-label' }, `${SCENARIO_LABELS[lead]} scenario ROI over ${shared.months} months`), el('strong', {}, pct(r.roi)));
    const grid = tiles([
      tile('calendar-check', 'Payback', payback(r), 'First month profit covers cost to date'),
      tile('scale', 'Break-even clients', r.breakEvenClients === null ? 'Not available' : num(r.breakEvenClients), 'Clients needed to cover total cost'),
      tile('users', 'New clients', num(r.clients), `${num(r.leads, 0)} leads, ${num(r.consults, 0)} consultations`),
      tile('report-money', 'Net return', money(r.net), `${money(r.profit)} profit on ${money(r.cost)} cost`)
    ]);
    const formula = el('p', { class: 'bhc-formula' }, `ROI = (profit from fees − total SEO cost) ÷ total SEO cost × 100. Profit from fees = new clients × ${money(shared.feePerMatter)} × ${num(shared.margin)}%. Break-even clients = ${money(r.cost)} ÷ ${money(shared.feePerMatter * shared.margin / 100)}. Fees count in the month the client signs; real collections usually arrive later.`);
    out.replaceChildren(head, grid, ...(ready.length > 1 ? [compare(results)] : []), chart(shared, r), formula);
    flash(out);
    const table = el('table', { class: 'bhc-table ldc-table' });
    table.append(el('caption', {}, `${SCENARIO_LABELS[lead]} scenario by month`));
    const hr = el('tr'); for (const h of ['Month', 'Traffic', 'New clients', 'Cost to date', 'Profit to date']) hr.append(el('th', { scope: 'col' }, h));
    const thead = el('thead'); thead.append(hr); const tbody = el('tbody');
    for (const row of r.rows) { const tr = el('tr'); tr.append(el('td', {}, String(row.month)), el('td', {}, `${num(row.ramp * 100, 0)}%`), el('td', {}, num(row.clients, 2)), el('td', {}, money(row.cumulativeCost)), el('td', {}, money(row.cumulativeProfit))); tbody.append(tr); }
    table.append(thead, tbody);
    stepsOut.replaceChildren(table); stepsWrap.hidden = false;
    const fmt = (key, v) => PERCENT_FIELDS.has(key) ? `${num(v, 2)}%` : /Cost|fee/i.test(key) ? money(v) : num(v);
    summary = ['Verdict Point Law Firm SEO ROI Calculator', ...Object.entries(SHARED).map(([k, l]) => `${l}: ${fmt(k, shared[k])}`), '',
      ...ready.flatMap(s => [`${SCENARIO_LABELS[s]} scenario: ${Object.entries(FUNNEL).map(([k, l]) => `${l.toLowerCase()} ${fmt(k, funnels[s][k])}`).join('; ')}`,
        `  New clients ${num(results[s].clients)}, profit ${money(results[s].profit)}, cost ${money(results[s].cost)}, ROI ${pct(results[s].roi)}, payback ${payback(results[s]).toLowerCase()}`]),
      '', 'All inputs are assumptions entered by the user, not forecasts.', `Calculated ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`, page].join('\n');
    if (announce) live.textContent = `${SCENARIO_LABELS[lead]} scenario ROI: ${pct(r.roi)}. Payback: ${payback(r)}.`;
    if (focus && window.matchMedia('(max-width: 767px)').matches) root.querySelector('#seo-result-h').focus();
  }
  async function copyText(button, text) {
    try { await navigator.clipboard.writeText(text); }
    catch { const area = el('textarea'); area.value = text; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0'; document.body.append(area); area.select(); document.execCommand('copy'); area.remove(); }
    const label = labelOf(button); setLabel(button, 'Copied'); live.textContent = 'Copied to clipboard.'; toast('Copied to clipboard.');
    setTimeout(() => setLabel(button, label), 2000);
  }
  form.addEventListener('submit', e => { e.preventDefault(); run({ focus: true }); });
  form.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 300); });
  root.addEventListener('click', e => {
    const button = e.target.closest('button[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'example') { for (const [k, v] of Object.entries(EXAMPLE.shared)) sharedInput(k).value = String(v); for (const s of SCENARIOS) for (const [k, v] of Object.entries(EXAMPLE.funnels[s])) funnelInput(s, k).value = String(v); run({ focus: true }); live.textContent = 'Example figures loaded.'; }
    if (action === 'copybase') { for (const s of ['low', 'high']) for (const k of Object.keys(FUNNEL)) funnelInput(s, k).value = funnelInput('base', k).value; run(); toast('Base figures copied to low and high. Adjust each one.'); }
    if (action === 'clear') { inputs.forEach(i => { i.value = ''; }); run({ announce: false }); live.textContent = 'Calculator cleared.'; }
    if (action === 'copy') copyText(button, summary || 'No result to copy yet.');
    if (action === 'print') { stepsWrap.open = true; document.body.dataset.bhcPrint = 'seo'; window.print(); }
  });
  window.addEventListener('afterprint', () => { delete document.body.dataset.bhcPrint; });
  run({ announce: false });
  root.classList.add('bhc-ready');
}

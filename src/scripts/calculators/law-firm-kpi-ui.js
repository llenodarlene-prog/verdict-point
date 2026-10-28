// Law firm KPI calculator interface. Formulas live in law-firm-kpi-core.js; this file only reads inputs and writes results.
// Firm figures never leave the browser: no storage, no network requests, no share links, and results are written with textContent only.
import { FIELDS, parseFigure, calculateKpis, consistencyErrors, EXAMPLE } from './law-firm-kpi-core.js';

const root = document.querySelector('[data-kpi]');
if (root) init(root);

function init(root) {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = Object.fromEntries([...root.querySelectorAll('[data-section]')].map(p => [p.dataset.section, p]));
  const live = root.querySelector('[data-live]');
  const inputs = [...root.querySelectorAll('[data-figure]')];
  const page = location.origin + location.pathname;
  const el = (tag, attrs = {}, text) => { const node = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v); if (text !== undefined) node.textContent = text; return node; };
  const num = (v, d = 2) => new Intl.NumberFormat('en-US', { maximumFractionDigits: d }).format(v);
  const money = v => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: Math.abs(v) >= 1000 ? 0 : 2 }).format(v);
  const show = (k, v) => k.unit === 'percent' ? `${num(v, 1)}%` : k.unit === 'moneyPerHour' ? `${money(v)} per billable hour` : money(v);
  const isMoney = key => /Value|revenue|expenses|Spend/.test(key);
  let timer = null;

  function setError(input, message) {
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    const box = document.getElementById(`${input.id}-err`);
    if (box) box.textContent = message || '';
  }
  // One value per figure, read from whichever input holds it (billable hours appears in two sections and stays in sync).
  function figures() {
    const f = {}, bad = new Set();
    for (const input of inputs) {
      setError(input, '');
      const v = parseFigure(input.value);
      if (v === null) continue;
      if (Number.isNaN(v)) { bad.add(input.name); setError(input, 'Enter a number of zero or more, using digits only.'); continue; }
      f[input.name] = v;
    }
    for (const [key, message] of consistencyErrors(f)) { for (const input of inputs.filter(i => i.name === key)) setError(input, message); bad.add(key); }
    for (const key of bad) delete f[key];
    return { f, bad };
  }
  function render() {
    const { f, bad } = figures();
    const kpis = calculateKpis(f);
    for (const [section, panel] of Object.entries(panels)) {
      const list = el('div', { class: 'kpi-cards' });
      for (const k of kpis.filter(x => x.section === section)) {
        const card = el('article', { class: 'kpi-card' });
        card.append(el('h4', {}, k.label));
        if (k.value === null) {
          const missing = k.inputs.filter(i => f[i] === undefined).map(i => FIELDS[i].toLowerCase());
          card.append(el('p', { class: 'kpi-value kpi-na' }, 'Not available'), el('p', { class: 'bhc-def' }, missing.length ? `Add ${missing.join(' and ')}${k.inputs.some(i => bad.has(i)) ? ', and correct the highlighted field' : ''}.` : 'The divisor is zero, so this rate cannot be calculated.'));
        } else {
          card.append(el('p', { class: 'kpi-value' }, show(k, k.value)));
        }
        card.append(el('p', { class: 'bhc-def' }, k.definition));
        const details = el('details');
        details.append(el('summary', {}, 'Show formula'));
        const values = k.inputs.map(i => `${FIELDS[i]}: ${f[i] === undefined ? 'not entered' : isMoney(i) ? money(f[i]) : num(f[i])}`).join('; ');
        details.append(el('p', { class: 'bhc-formula' }, `${k.formula}. ${values}.`));
        card.append(details);
        list.append(card);
      }
      panel.querySelector('[data-out]').replaceChildren(list);
    }
    return { f, kpis };
  }
  function summaryText() {
    const { f, kpis } = render();
    const lines = ['Verdict Point Law Firm KPI Calculator', ...Object.entries(f).map(([k, v]) => `${FIELDS[k]}: ${isMoney(k) ? money(v) : num(v)}`), '', ...kpis.map(k => `${k.label}: ${k.value === null ? 'Not available' : show(k, k.value)} (${k.formula})`), '', `Calculated ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`, page];
    return lines.join('\n');
  }
  function select(section, focusTab = false) {
    tabs.forEach(tab => { const on = tab.getAttribute('aria-controls') === `kpi-panel-${section}`; tab.setAttribute('aria-selected', String(on)); tab.tabIndex = on ? 0 : -1; if (on && focusTab) tab.focus(); });
    Object.entries(panels).forEach(([k, p]) => { p.hidden = k !== section; });
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab.getAttribute('aria-controls').replace('kpi-panel-', '')));
    tab.addEventListener('keydown', e => {
      const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      select(tabs[(keys[e.key] + tabs.length) % tabs.length].getAttribute('aria-controls').replace('kpi-panel-', ''), true);
    });
  });
  async function copyText(button, text) {
    try { await navigator.clipboard.writeText(text); }
    catch { const area = el('textarea'); area.value = text; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0'; document.body.append(area); area.select(); document.execCommand('copy'); area.remove(); }
    const label = button.textContent; button.textContent = 'Copied'; live.textContent = 'Copied to clipboard.';
    setTimeout(() => { button.textContent = label; }, 2000);
  }
  root.addEventListener('input', e => {
    const input = e.target.closest('[data-figure]');
    if (!input) return;
    for (const twin of inputs) if (twin !== input && twin.name === input.name) twin.value = input.value;
    clearTimeout(timer); timer = setTimeout(() => { render(); live.textContent = 'Results updated.'; }, 300);
  });
  root.addEventListener('submit', e => {
    e.preventDefault(); render(); live.textContent = 'Results updated.';
    if (window.matchMedia('(max-width: 767px)').matches) e.target.closest('[data-section]').querySelector('.bhc-result h3').focus();
  });
  root.addEventListener('click', e => {
    const button = e.target.closest('button[data-action]');
    if (!button) return;
    const panel = button.closest('[data-section]');
    const action = button.dataset.action;
    if (action === 'example') { for (const input of inputs) input.value = String(EXAMPLE[input.name]); render(); live.textContent = 'Example figures loaded in every section.'; }
    if (action === 'clear') { for (const input of panel.querySelectorAll('[data-figure]')) for (const twin of inputs) if (twin.name === input.name) twin.value = ''; render(); live.textContent = 'Section cleared.'; }
    if (action === 'copy') copyText(button, summaryText());
    if (action === 'print') { render(); document.body.dataset.bhcPrint = 'kpi'; window.print(); }
  });
  window.addEventListener('afterprint', () => { delete document.body.dataset.bhcPrint; });
  render();
  root.classList.add('bhc-ready');
}

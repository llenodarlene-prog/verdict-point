// Post-judgment interest calculator interface. The method lives in judgment-interest-core.js; this file only reads inputs and writes results.
// Nothing typed here leaves the browser: no storage, no network requests, and results are written with textContent only.
import { LIMITS, parseDate, isoDate, parseAmount, calculateJudgmentInterest, parseInterestState, serializeInterestState } from './judgment-interest-core.js';

const root = document.querySelector('[data-pji]');
if (root) init(root);

function init(root) {
  const form = root.querySelector('form');
  const out = root.querySelector('[data-out]');
  const live = root.querySelector('[data-live]');
  const stepsWrap = root.querySelector('[data-steps-wrap]');
  const stepsOut = root.querySelector('[data-steps]');
  const page = location.origin + location.pathname;
  const field = name => form.querySelector(`[name="${name}"]`);
  const money = v => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  const longDate = n => new Date(n * 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const el = (tag, attrs = {}, text) => { const node = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v); if (text !== undefined) node.textContent = text; return node; };
  let summary = '', timer = null, undo = null;

  function setError(input, message) {
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    const id = (input.getAttribute('aria-describedby') || '').split(' ').find(x => x.endsWith('-err'));
    const box = id && document.getElementById(id);
    if (box) box.textContent = message || '';
  }
  function read() {
    form.querySelectorAll('[aria-invalid]').forEach(i => setError(i, ''));
    const amount = parseAmount(field('amount').value), rate = parseAmount(field('rate').value);
    const entered = parseDate(field('entered').value), paid = parseDate(field('paid').value);
    let ok = true;
    if (amount === null) ok = false;
    else if (!Number.isFinite(amount) || amount < LIMITS.principal[0] || amount > LIMITS.principal[1]) { setError(field('amount'), 'Enter a judgment amount greater than $0, using numbers only.'); ok = false; }
    if (rate === null) ok = false;
    else if (!Number.isFinite(rate) || rate > LIMITS.rate[1]) { setError(field('rate'), `Enter an annual rate from 0 to ${LIMITS.rate[1]} percent, such as 4.28.`); ok = false; }
    if (entered === null) { if (field('entered').value) setError(field('entered'), 'Enter a date between 1990 and 2100.'); ok = false; }
    if (paid === null) { if (field('paid').value) setError(field('paid'), 'Enter a date between 1990 and 2100.'); ok = false; }
    if (entered !== null && paid !== null && paid < entered) { setError(field('paid'), 'The payment date cannot be before the judgment date.'); ok = false; }
    if (entered !== null && entered < Date.UTC(2000, 11, 21) / 86400000) { setError(field('entered'), 'This method applies to judgments entered on or after December 21, 2000. Earlier judgments used a different rate rule.'); ok = false; }
    return ok ? { amount, rate, entered, paid, basis: form.querySelector('[name="basis"]:checked').value === 'actual' ? 'actual' : 365 } : null;
  }
  function run({ announce = true, focus = false } = {}) {
    const input = read();
    if (!input) { out.replaceChildren(el('p', { class: 'bhc-empty' }, 'Add the judgment amount, the rate, and both dates to see the interest and each year of the calculation.')); stepsWrap.hidden = true; summary = ''; return; }
    const r = calculateJudgmentInterest({ principal: input.amount, ratePercent: input.rate, judgmentDate: input.entered, paymentDate: input.paid, basis: input.basis });
    const head = el('p', { class: 'ldc-answer' });
    head.append(el('span', { class: 'ldc-label' }, 'Total due on payment date'), el('strong', {}, money(r.total)));
    const dl = el('dl', { class: 'bhc-figures' });
    const add = (t, v, note) => { const w = el('div'); w.append(el('dt', {}, t), el('dd', {}, v)); if (note) w.append(el('dd', { class: 'bhc-def' }, note)); dl.append(w); };
    add('Post-judgment interest', money(r.interest));
    add('Judgment amount', money(r.principal));
    add('Days of interest', r.days.toLocaleString('en-US'), `From ${longDate(input.entered)} to ${longDate(input.paid)}.`);
    add('Interest per day now', money(r.dailyInterest), r.periods.length > 1 ? 'On the balance after the most recent annual compounding.' : 'On the judgment amount.');
    const basisText = input.basis === 'actual' ? 'annual rate divided by the days in each judgment year' : 'annual rate divided by 365';
    const formula = el('p', { class: 'bhc-formula' }, `Method: ${input.rate}% per year, ${basisText}, computed daily and added to the balance on each anniversary of the judgment. Amounts are rounded to the cent for display only.`);
    out.replaceChildren(head, dl, formula);
    const table = el('table', { class: 'bhc-table ldc-table' });
    table.append(el('caption', {}, 'Interest by judgment year'));
    const hr = el('tr'); for (const h of ['Period', 'Days', 'Opening balance', 'Interest']) hr.append(el('th', { scope: 'col' }, h));
    const thead = el('thead'); thead.append(hr);
    const tbody = el('tbody');
    for (const p of r.periods) {
      const tr = el('tr');
      tr.append(el('td', {}, `Year ${p.year}: ${isoDate(p.start)} to ${isoDate(p.end)}${p.compounded ? ' (compounded)' : ''}`), el('td', {}, String(p.days)), el('td', {}, money(Math.round(p.openingCents) / 100)), el('td', {}, money(Math.round(p.interestCents) / 100)));
      tbody.append(tr);
    }
    table.append(thead, tbody);
    stepsOut.replaceChildren(table); stepsWrap.hidden = r.periods.length === 0;
    summary = ['Verdict Point Post-Judgment Interest Calculator (28 U.S.C. 1961)', `Judgment amount: ${money(r.principal)}`, `Rate: ${input.rate}% per year`, `Judgment entered: ${longDate(input.entered)}`, `Payment date: ${longDate(input.paid)}`, `Days: ${r.days}`, `Interest: ${money(r.interest)}`, `Total due: ${money(r.total)}`, `Method: computed daily (${basisText}), compounded annually`, `Calculated ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`, page, 'Confirm the rate, dates, and any payments or credits before relying on this figure.'].join('\n');
    if (announce) live.textContent = `Total due: ${money(r.total)}.`;
    if (focus && window.matchMedia('(max-width: 767px)').matches) root.querySelector('#pji-result-h').focus();
  }

  const todayIso = () => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; };
  field('paid').value = todayIso();
  const snapshot = () => [...form.querySelectorAll('input')].map(i => [i, i.type === 'radio' ? i.checked : i.value]);
  const restore = s => s.forEach(([i, v]) => { if (typeof v === 'boolean') i.checked = v; else i.value = v; });
  const defaults = snapshot();
  async function copyText(button, text, done) {
    try { await navigator.clipboard.writeText(text); }
    catch { const area = el('textarea'); area.value = text; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0'; document.body.append(area); area.select(); document.execCommand('copy'); area.remove(); }
    const label = button.textContent; button.textContent = done; live.textContent = done === 'Copied' ? 'Copied to clipboard.' : 'Calculation link copied.';
    setTimeout(() => { button.textContent = label; }, 2000);
  }

  form.addEventListener('submit', e => { e.preventDefault(); run({ focus: true }); });
  form.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 300); });
  form.addEventListener('change', () => run());
  root.addEventListener('click', e => {
    const button = e.target.closest('button');
    if (!button || !root.contains(button)) return;
    const action = button.dataset.action;
    if (action === 'example') { field('amount').value = '100000'; field('rate').value = '5'; field('entered').value = '2026-01-01'; field('paid').value = '2027-02-05'; form.querySelector('[name="basis"][value="365"]').checked = true; run({ focus: true }); }
    if (action === 'reset') {
      const before = snapshot(); restore(defaults); run({ announce: false });
      undo?.remove(); clearTimeout(undo?.timer);
      const bar = el('p', { class: 'bhc-undo', role: 'status' }, 'Calculator reset. ');
      const btn = el('button', { type: 'button' }, 'Undo');
      btn.addEventListener('click', () => { restore(before); run(); bar.remove(); });
      bar.append(btn); form.prepend(bar); undo = bar; undo.timer = setTimeout(() => bar.remove(), 5000);
    }
    if (action === 'copy') copyText(button, summary || 'No result to copy yet.', 'Copied');
    if (action === 'share') { const q = serializeInterestState({ amount: field('amount').value, rate: field('rate').value, entered: field('entered').value, paid: field('paid').value, basis: form.querySelector('[name="basis"]:checked').value }); copyText(button, `${page}${q ? `?${q}` : ''}#calculator`, 'Link copied'); }
    if (action === 'print') { stepsWrap.open = true; document.body.dataset.bhcPrint = 'interest'; window.print(); }
  });
  window.addEventListener('afterprint', () => { delete document.body.dataset.bhcPrint; });

  const state = parseInterestState(new URLSearchParams(location.search));
  for (const key of ['amount', 'rate', 'entered', 'paid']) if (state[key] !== undefined) field(key).value = String(state[key]);
  if (state.basis) form.querySelector(`[name="basis"][value="${state.basis}"]`).checked = true;
  run({ announce: false });
  root.classList.add('bhc-ready');
}

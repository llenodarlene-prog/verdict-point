// Legal deadline calculator interface. Date rules live in legal-deadline-core.js; this file only reads inputs and writes results.
// Nothing typed here leaves the browser: no storage, no network requests, and results are written with textContent only.
import { LIMITS, parseDate, longDate, calculateDeadline, parseDeadlineState, serializeDeadlineState } from './legal-deadline-core.js';

const root = document.querySelector('[data-ldc]');
if (root) init(root);

function init(root) {
  const form = root.querySelector('form');
  const out = root.querySelector('[data-out]');
  const live = root.querySelector('[data-live]');
  const stepsWrap = root.querySelector('[data-steps-wrap]');
  const stepsOut = root.querySelector('[data-steps]');
  const chips = root.querySelector('[data-excluded]');
  const page = location.origin + location.pathname;
  const field = name => form.querySelector(`[name="${name}"]`);
  const radio = name => form.querySelector(`[name="${name}"]:checked`).value;
  let excluded = [];
  let summary = '';
  let timer = null, undo = null;

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
  const todayIso = () => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; };
  function setError(input, message) {
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    const id = (input.getAttribute('aria-describedby') || '').split(' ').find(x => x.endsWith('-err'));
    const box = id && document.getElementById(id);
    if (box) box.textContent = message || '';
  }

  function renderChips() {
    chips.replaceChildren(...excluded.map(iso => {
      const li = el('li');
      const btn = el('button', { type: 'button', 'aria-label': `Remove ${longDate(parseDate(iso))}` }, `${iso} ×`);
      btn.addEventListener('click', () => { excluded = excluded.filter(x => x !== iso); renderChips(); run(); live.textContent = `${iso} removed.`; });
      li.append(btn); return li;
    }));
  }
  function addDate() {
    const input = field('exclude');
    if (!input.value) { setError(input, 'Choose a date to exclude.'); return; }
    if (parseDate(input.value) === null) { setError(input, 'Enter a date between 1990 and 2100.'); return; }
    if (excluded.length >= LIMITS.customDates) { setError(input, `You can exclude up to ${LIMITS.customDates} dates.`); return; }
    setError(input, '');
    if (!excluded.includes(input.value)) excluded = [...excluded, input.value].sort();
    live.textContent = `${input.value} excluded.`;
    input.value = ''; renderChips(); run();
  }

  function read() {
    form.querySelectorAll('[aria-invalid]').forEach(input => setError(input, ''));
    const startInput = field('start'), daysInput = field('days');
    const start = parseDate(startInput.value);
    const daysText = daysInput.value.trim().replace(/,/g, '');
    const days = /^\d+$/.test(daysText) ? Number(daysText) : NaN;
    let ok = true;
    if (start === null) { setError(startInput, startInput.value ? 'Enter a date between 1990 and 2100.' : 'Choose a start date.'); ok = false; }
    if (!Number.isInteger(days) || days < LIMITS.days[0] || days > LIMITS.days[1]) { setError(daysInput, `Enter a whole number of days from 0 to ${LIMITS.days[1].toLocaleString('en-US')}.`); ok = false; }
    if (!ok) return null;
    return { start, days, direction: radio('dir'), mode: radio('mode'), includeStart: field('first').checked, adjust: field('roll').checked ? 'roll' : 'none', holidays: field('hol').checked, custom: new Set(excluded.map(parseDate)) };
  }

  function render(input, r) {
    const unit = input.mode === 'business' ? 'business day' : 'calendar day';
    const plural = input.days === 1 ? unit : `${unit}s`;
    const head = el('p', { class: 'ldc-answer' });
    head.append(icon('calendar-due'), el('span', { class: 'ldc-label' }, 'Deadline'), el('strong', {}, longDate(r.deadline)));
    const list = [
      tile('calendar-event', 'Start date', longDate(input.start)),
      tile('hourglass', 'Period', `${input.days.toLocaleString('en-US')} ${plural}`, input.direction === 'forward' ? 'After the start date' : 'Before the start date'),
      tile('arrows-left-right', 'Calendar days from start', r.calendarSpan.toLocaleString('en-US')),
      tile('calendar-x', 'Days skipped', String(r.steps.filter(x => x.kind === 'skip' || x.kind === 'roll').length), input.mode === 'business' ? 'Weekends, holidays, and excluded dates' : 'Days the deadline moved past')
    ];
    if (r.rolled) list.push(tile('alert-circle', 'Moved off a closed day', `${r.rolledDays} day${r.rolledDays === 1 ? '' : 's'} ${input.direction === 'forward' ? 'later' : 'earlier'}`, `The count ended on ${longDate(r.lastCounted)}.`));
    if (r.landsOnExcluded) list.push(tile('alert-circle', 'Lands on a closed day', r.landsOnExcluded, 'Turn on the weekend and holiday adjustment if your rule requires it.'));
    const assumptions = [
      input.includeStart ? 'Start date counted as day 1' : 'Start date not counted',
      input.mode === 'business' ? 'Weekends' + (input.holidays ? ', federal holidays' : '') + (excluded.length ? ', and your excluded dates' : '') + ' skipped while counting' : 'Every calendar day counted',
      input.adjust === 'roll' ? 'Last day on a weekend or holiday moves to the next day that is not' : 'No weekend or holiday adjustment',
      input.holidays ? 'Federal holidays under 5 U.S.C. 6103, observed dates' : 'Federal holidays not treated as closed days'
    ];
    const ul = el('ul', { class: 'ldc-assume', 'aria-label': 'Assumptions used' });
    for (const a of assumptions) ul.append(el('li', {}, a));
    const cap = el('p', { class: 'viz-cap' }); cap.append(icon('info-circle'), document.createTextNode('Assumptions used'));
    out.replaceChildren(head, tiles(list), calendar(input, r), cap, ul);
    flash(out);
    // Day-by-day count, capped for display; the calculation itself always covers the full period.
    const rows = r.steps.length > 420 ? [...r.steps.slice(0, 200), null, ...r.steps.slice(-200)] : r.steps;
    const table = el('table', { class: 'bhc-table ldc-table' });
    table.append(el('caption', {}, 'Day-by-day count'));
    const hr = el('tr'); for (const h of ['Date', 'Count', 'Note']) hr.append(el('th', { scope: 'col' }, h));
    const thead = el('thead'); thead.append(hr);
    const tbody = el('tbody');
    for (const s of rows) {
      const tr = el('tr');
      if (!s) { const td = el('td', { colspan: '3' }, `${(r.steps.length - 400).toLocaleString('en-US')} more days not shown`); tr.append(td); tbody.append(tr); continue; }
      if (s.date === r.deadline && s.kind !== 'start') tr.className = 'ldc-final';
      tr.append(el('td', {}, longDate(s.date)), el('td', {}, s.count ? String(s.count) : s.kind === 'skip' ? 'Skipped' : s.kind === 'roll' ? 'Moved' : '—'), el('td', {}, s.date === r.deadline && s.kind !== 'start' ? [s.note, 'Deadline'].filter(Boolean).join(' · ') : s.note));
      tbody.append(tr);
    }
    table.append(thead, tbody);
    stepsOut.replaceChildren(table);
    stepsWrap.hidden = false;
    summary = ['Verdict Point Legal Deadline Calculator', `Deadline: ${longDate(r.deadline)}`, `Start date: ${longDate(input.start)}`, `Period: ${input.days} ${plural} ${input.direction === 'forward' ? 'after' : 'before'} the start date`, ...(r.rolled ? [`Count ended ${longDate(r.lastCounted)}; moved to the next day that is not a weekend or holiday`] : []), ...(excluded.length ? [`Excluded dates: ${excluded.join(', ')}`] : []), `Assumptions: ${assumptions.join('; ')}`, `Holiday rules version: 2026-10-28`, `Calculated ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`, page, 'Check the governing rule, order, and local rules before relying on this date.'].join('\n');
  }

  // Month grids from the start date to the deadline. Long periods show only the first and last month.
  function calendar(input, r) {
    const kinds = new Map();
    for (const st of r.steps) kinds.set(st.date, st.kind === 'count' ? 'counted' : st.kind === 'start' ? 'start' : 'skipped');
    kinds.set(input.start, 'start'); kinds.set(r.deadline, 'deadline');
    const lo = Math.min(input.start, r.deadline), hi = Math.max(input.start, r.deadline);
    const monthOf = n => { const d = new Date(n * 86400000); return [d.getUTCFullYear(), d.getUTCMonth()]; };
    const months = [];
    let [y, m] = monthOf(lo); const [hy, hm] = monthOf(hi);
    while (y < hy || (y === hy && m <= hm)) { months.push([y, m]); m += 1; if (m === 12) { m = 0; y += 1; } }
    const shown = months.length > 3 ? [months[0], months[months.length - 1]] : months;
    const wrap = el('div', { class: 'viz' });
    const cap = el('p', { class: 'viz-cap' }); cap.append(icon('calendar-event'), document.createTextNode(months.length > 3 ? `The count on a calendar (first and last of ${months.length} months)` : 'The count on a calendar'));
    const grid = el('div', { class: 'ldc-cal', role: 'img', 'aria-label': `Calendar from ${longDate(lo)} to ${longDate(hi)}. Deadline ${longDate(r.deadline)}. The day-by-day table below lists every day.` });
    for (const [yy, mm] of shown) {
      const box = el('div', { class: 'ldc-month' });
      box.append(el('h4', {}, new Date(Date.UTC(yy, mm, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })));
      const g = el('div', { class: 'ldc-grid', 'aria-hidden': 'true' });
      for (const d of ['S', 'M', 'T', 'W', 'T', 'F', 'S']) g.append(el('span', { class: 'dow' }, d));
      const first = Date.UTC(yy, mm, 1) / 86400000, lead = new Date(first * 86400000).getUTCDay(), len = new Date(Date.UTC(yy, mm + 1, 0)).getUTCDate();
      for (let i = 0; i < lead; i += 1) g.append(el('span'));
      for (let d = 0; d < len; d += 1) { const n = first + d, k = kinds.get(n); g.append(el('span', { class: k ? `in ${k}` : (n >= lo && n <= hi ? 'in' : '') }, String(d + 1))); }
      box.append(g); grid.append(box);
    }
    const legend = el('ul', { class: 'ldc-legend', 'aria-hidden': 'true' });
    for (const [label, style] of [['Start', 'outline:2px solid var(--secondary);outline-offset:-2px'], ['Counted', 'background:color-mix(in srgb,var(--ink) 12%,white)'], ['Skipped or moved past', 'background:repeating-linear-gradient(45deg,#f3f4f6,#f3f4f6 3px,#e5e7eb 3px,#e5e7eb 6px)'], ['Deadline', 'background:var(--accent)']]) { const li = el('li'); li.append(el('i', { style }), document.createTextNode(label)); legend.append(li); }
    wrap.append(cap, grid, legend);
    return wrap;
  }

  function run({ announce = true, focus = false } = {}) {
    const input = read();
    if (!input) { out.replaceChildren(el('p', { class: 'bhc-empty' }, 'Add a start date and number of days to see the deadline and each step of the count.')); stepsWrap.hidden = true; summary = ''; return; }
    const r = calculateDeadline(input);
    render(input, r);
    if (announce) live.textContent = `Deadline: ${longDate(r.deadline)}.`;
    if (focus && window.matchMedia('(max-width: 767px)').matches) root.querySelector('#ldc-result-h').focus();
  }

  const snapshot = () => ({ values: [...form.querySelectorAll('input')].map(i => [i, i.type === 'radio' || i.type === 'checkbox' ? i.checked : i.value]), excluded: [...excluded] });
  const restore = s => { s.values.forEach(([i, v]) => { if (typeof v === 'boolean') i.checked = v; else i.value = v; }); excluded = [...s.excluded]; renderChips(); };
  field('start').value = todayIso();
  const defaults = snapshot();

  async function copyText(button, text, done) {
    try { await navigator.clipboard.writeText(text); }
    catch { const area = el('textarea'); area.value = text; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0'; document.body.append(area); area.select(); document.execCommand('copy'); area.remove(); }
    const label = labelOf(button); setLabel(button, done); { const msg = done === 'Copied' ? 'Copied to clipboard.' : 'Calculation link copied.'; live.textContent = msg; toast(msg); }
    setTimeout(() => setLabel(button, label), 2000);
  }
  function shareUrl() {
    const query = serializeDeadlineState({ start: field('start').value, days: field('days').value.trim(), dir: radio('dir'), mode: radio('mode'), first: field('first').checked, adjust: field('roll').checked ? 'roll' : 'none', hol: field('hol').checked, exclude: excluded.join(',') });
    return `${page}${query ? `?${query}` : ''}#calculator`;
  }

  form.addEventListener('submit', event => { event.preventDefault(); run({ focus: true }); });
  form.addEventListener('input', event => { if (event.target.name === 'exclude') return; clearTimeout(timer); timer = setTimeout(run, 300); });
  form.addEventListener('change', event => { if (event.target.name === 'exclude') return; run(); });
  field('exclude').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); addDate(); } });
  root.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || !root.contains(button) || chips.contains(button)) return;
    if (button.dataset.step) { const input = field('days'); const n = Number(input.value.replace(/,/g, '')); input.value = String(Math.min(LIMITS.days[1], Math.max(0, (Number.isFinite(n) ? Math.round(n) : 0) + Number(button.dataset.step)))); run(); return; }
    const action = button.dataset.action;
    if (action === 'add-date') addDate();
    if (action === 'example') {
      field('start').value = '2026-10-28'; field('days').value = '29';
      form.querySelector('[name="dir"][value="forward"]').checked = true; form.querySelector('[name="mode"][value="calendar"]').checked = true;
      field('first').checked = false; field('roll').checked = true; field('hol').checked = true; excluded = []; renderChips(); run({ focus: true });
    }
    if (action === 'reset') {
      const before = snapshot(); restore(defaults); run({ announce: false });
      undo?.remove(); clearTimeout(undo?.timer);
      const bar = el('p', { class: 'bhc-undo', role: 'status' }, 'Calculator reset. ');
      const btn = el('button', { type: 'button' }, 'Undo');
      btn.addEventListener('click', () => { restore(before); run(); bar.remove(); });
      bar.append(btn); form.prepend(bar); undo = bar; undo.timer = setTimeout(() => bar.remove(), 5000);
    }
    if (action === 'copy') copyText(button, summary || 'No result to copy yet.', 'Copied');
    if (action === 'share') copyText(button, shareUrl(), 'Link copied');
    if (action === 'print') { stepsWrap.open = true; document.body.dataset.bhcPrint = 'deadline'; window.print(); }
  });
  window.addEventListener('afterprint', () => { delete document.body.dataset.bhcPrint; });

  // Start from shared state when the URL carries it; unknown or invalid parameters are ignored.
  const state = parseDeadlineState(new URLSearchParams(location.search));
  if (state.start) field('start').value = state.start;
  if (state.days !== undefined) field('days').value = String(state.days);
  if (state.dir) form.querySelector(`[name="dir"][value="${state.dir}"]`).checked = true;
  if (state.mode) form.querySelector(`[name="mode"][value="${state.mode}"]`).checked = true;
  if (state.first) field('first').checked = true;
  if (state.adjust === 'none') field('roll').checked = false;
  if (state.hol === false) field('hol').checked = false;
  if (state.exclude) { excluded = state.exclude.split(',').sort(); renderChips(); }
  run({ announce: false });
  root.classList.add('bhc-ready');
}

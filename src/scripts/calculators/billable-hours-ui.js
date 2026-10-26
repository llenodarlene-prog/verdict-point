// Billable hours calculator interface. Formulas live in billable-hours-core.js; this file only reads inputs and writes results.
// Nothing typed here leaves the browser: no storage, no network requests, and results are written with textContent only.
import { LIMITS, parseNumber, inRange, elapsedMinutes, calculateTimeEntry, calculateTargetPlan, calculateFirmMetrics, chartRows, parseCalculatorState, serializeCalculatorState } from './billable-hours-core.js';

const root = document.querySelector('[data-bhc]');
if (root) init(root);

function init(root) {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = Object.fromEntries([...root.querySelectorAll('[data-tool]')].map(panel => [panel.dataset.tool, panel]));
  const live = root.querySelector('[data-live]');
  const page = location.origin + location.pathname;
  let active = 'time';
  let timeIncrement = 6, chartCol = 'six', timer = null, undo = null;

  const el = (tag, attrs = {}, text) => { const node = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v); if (text !== undefined) node.textContent = text; return node; };
  const field = (panel, name) => panel.querySelector(`[name="${name}"]`);
  const radio = (panel, name) => panel.querySelector(`[name="${name}"]:checked`)?.value;
  const fmt = (value, digits = 2) => new Intl.NumberFormat('en-US', { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(value);
  const hours = value => new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(value);
  const money = (value, currency) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  const pct = value => `${fmt(value, 1)}%`;

  // ---------- Errors ----------
  function setError(input, message) {
    const box = document.getElementById(input.getAttribute('aria-describedby')?.split(' ')[0] || '');
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (box && box.classList.contains('bhc-err')) box.textContent = message || '';
  }
  function clearErrors(panel) { panel.querySelectorAll('[aria-invalid]').forEach(input => setError(input, '')); }
  // Reads a field; optional blanks return null, invalid entries record an error and return undefined.
  function read(panel, name, limit, { optional = false, label = 'a number', integer = false } = {}) {
    const input = field(panel, name);
    const value = parseNumber(input.value);
    const [min, max] = LIMITS[limit];
    if (value === null && optional) return null;
    if (value === null || Number.isNaN(value) || !inRange(value, LIMITS[limit]) || (integer && !Number.isInteger(value))) {
      setError(input, `Enter ${integer ? 'a whole number' : label} from ${fmt(min)} to ${fmt(max)}.`);
      return undefined;
    }
    return value;
  }

  // ---------- Result rendering ----------
  function rows(items) {
    const dl = el('dl', { class: 'bhc-figures' });
    for (const [term, value, note] of items) {
      const wrap = el('div');
      wrap.append(el('dt', {}, term), el('dd', {}, value));
      if (note) wrap.append(el('dd', { class: 'bhc-def' }, note));
      dl.append(wrap);
    }
    return dl;
  }
  function show(panel, nodes, summary) {
    const out = panel.querySelector('[data-out]');
    out.replaceChildren(...nodes);
    panel.dataset.summary = summary || '';
  }
  function empty(panel) { show(panel, [el('p', { class: 'bhc-empty' }, 'Add your figures to see the calculation and the formula used.')], ''); }

  // ---------- Tool A: Time entry ----------
  function timeInputs(panel) {
    const method = radio(panel, 'method');
    let total, ok = true;
    if (method === 'clock') {
      const start = field(panel, 'start'), end = field(panel, 'end');
      const span = elapsedMinutes(start.value, end.value, field(panel, 'nextday').checked);
      if (span.error === 'clock') { if (!start.value) setError(start, 'Enter a start time.'); if (!end.value) setError(end, 'Enter an end time.'); return null; }
      if (span.error === 'overnight') { setError(end, 'The end time is earlier than the start time. Select Ends next day if the entry crosses midnight.'); return null; }
      const brk = read(panel, 'break', 'breakMinutes', { integer: true });
      if (brk === undefined) return null;
      if (brk > span.minutes) { setError(field(panel, 'break'), 'Break time cannot exceed elapsed time.'); return null; }
      total = span.minutes - brk;
    } else {
      const mins = read(panel, 'minutes', 'minutes', { integer: true });
      const hrs = method === 'hm' ? read(panel, 'hours', 'hours', { integer: true }) : 0;
      if (mins === undefined || hrs === undefined) return null;
      total = hrs * 60 + mins;
      if (total > 1440) { setError(field(panel, 'minutes'), 'The entry cannot exceed 24 hours (1,440 minutes).'); ok = false; }
    }
    let increment = timeIncrement;
    if (increment === 'custom') { increment = read(panel, 'custom', 'customIncrement', { integer: true }); if (increment === undefined) ok = false; }
    const rate = read(panel, 'rate', 'rate', { optional: true, label: 'a rate' });
    if (rate === undefined) ok = false;
    if (!ok) return null;
    return { method, total, increment, rounding: increment === 0 ? 'exact' : field(panel, 'rounding').value, rate, currency: field(panel, 'currency').value };
  }
  function calcTime(panel) {
    const input = timeInputs(panel);
    if (!input) return false;
    const r = calculateTimeEntry({ totalMinutes: input.total, incrementMinutes: input.increment, roundingMethod: input.rounding, hourlyRate: input.rate ?? undefined });
    const label = r.exact ? 'Exact' : 'Rounded';
    const billable = r.exact ? fmt(r.billableHours, 4) : hours(r.billableHours);
    const rule = r.exact ? 'no rounding' : `${input.increment}-minute increments, ${{ up: 'rounded up', nearest: 'rounded to nearest', down: 'rounded down' }[input.rounding]}`;
    const items = [
      ['Exact time', `${fmt(r.totalMinutes, 0)} minutes = ${fmt(r.exactHours, 4)} hours`],
      [`${label} billable time`, `${fmt(r.roundedMinutes, 0)} minutes = ${billable} hours`, `Using ${rule}.`]
    ];
    if (r.estimatedValue !== null) {
      items.push(['Exact value', money(r.exactValue, input.currency)], [`${label} estimated value`, money(r.estimatedValue, input.currency)]);
    }
    if (!r.exact) items.push(['Difference', `${fmt(r.minuteDifference, 0)} minutes${r.valueDifference !== null ? ` and ${money(r.valueDifference, input.currency)}` : ''}`]);
    const formula = r.exact ? `${r.totalMinutes} ÷ 60 = ${fmt(r.exactHours, 4)} hours` : `${r.totalMinutes} minutes ${input.rounding === 'up' ? 'rounded up' : input.rounding === 'down' ? 'rounded down' : 'rounded to nearest'} to ${r.roundedMinutes} minutes; ${r.roundedMinutes} ÷ 60 = ${hours(r.billableHours)} hours`;
    const explain = el('p', { class: 'bhc-formula' }, `Formula: ${formula}${r.estimatedValue !== null ? `; ${billable} × ${money(input.rate, input.currency)} = ${money(r.estimatedValue, input.currency)}` : ''}.`);
    if (r.estimatedValue === null) explain.textContent += ' Add an hourly rate to estimate a value.';
    show(panel, [rows(items), explain], summary('Time entry', items, formula));
    return true;
  }

  // ---------- Tool B: Target planner ----------
  function calcTarget(panel) {
    const v = {
      annualTarget: read(panel, 'target', 'annualTarget'), completedHours: read(panel, 'done', 'completedHours'),
      workingWeeks: read(panel, 'weeks', 'workingWeeks', { integer: true }), completedWeeks: read(panel, 'doneweeks', 'completedWeeks', { integer: true }),
      workdaysPerWeek: read(panel, 'days', 'workdaysPerWeek', { integer: true })
    };
    if (Object.values(v).includes(undefined)) return false;
    if (v.completedWeeks > v.workingWeeks) { setError(field(panel, 'doneweeks'), 'Completed weeks cannot exceed total working weeks.'); return false; }
    const r = calculateTargetPlan(v);
    const status = { met: 'Target met', short: `Target period complete: ${hours(r.hoursRemaining)} hours short`, ahead: `Ahead of pace by ${hours(r.paceDifference)} hours`, on: 'On pace', behind: `Behind pace by ${hours(-r.paceDifference)} hours` }[r.status];
    const items = [
      ['Status', status],
      ['Average monthly target', `${hours(r.monthlyTarget)} hours`],
      ['Full-year weekly target', `${hours(r.weeklyTarget)} hours`],
      ['Full-year daily target', `${hours(r.dailyTarget)} hours`],
      ['Hours remaining', `${hours(r.hoursRemaining)} hours`],
      ['Remaining working weeks', fmt(r.weeksRemaining, 0)]
    ];
    if (r.requiredWeeklyPace !== null) items.push(['Required weekly pace', `${hours(r.requiredWeeklyPace)} hours`], ['Required daily pace', `${hours(r.requiredDailyPace)} hours`]);
    const bar = el('div', { class: 'bhc-progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(r.progressPercent)), 'aria-label': 'Progress toward annual target' });
    const fill = el('span'); fill.style.width = `${r.progressPercent}%`; bar.append(fill);
    const progress = el('p', { class: 'bhc-formula' }, `Progress: ${pct(r.progressPercent)} of ${fmt(v.annualTarget)} hours. Weekly target = ${fmt(v.annualTarget)} ÷ ${v.workingWeeks} weeks; daily target = weekly target ÷ ${v.workdaysPerWeek} days.`);
    show(panel, [rows(items), bar, progress], summary('Target planner', items, progress.textContent));
    return true;
  }

  // ---------- Tool C: Firm metrics ----------
  function calcMetrics(panel) {
    const mode = radio(panel, 'mode');
    const billable = read(panel, 'billable', 'billableHours');
    if (mode === 'hours') {
      const total = read(panel, 'total', 'totalWorkHours');
      if (total === undefined || billable === undefined) return false;
      if (billable > total) { setError(field(panel, 'billable'), 'Billable hours cannot exceed total work hours.'); return false; }
      const r = calculateFirmMetrics({ totalWorkHours: total, billableHours: billable });
      const items = [['Utilization rate', r.utilizationRate === null ? 'Not available' : pct(r.utilizationRate), 'Billable hours ÷ total work hours × 100.']];
      show(panel, [rows(items)], summary('Law firm metrics', items, `${fmt(billable)} ÷ ${fmt(total)} × 100`));
      return true;
    }
    const rate = read(panel, 'rate', 'rate', { label: 'a rate' });
    const realization = read(panel, 'realization', 'percent', { label: 'a percentage' });
    const collection = read(panel, 'collection', 'percent', { label: 'a percentage' });
    if ([billable, rate, realization, collection].includes(undefined)) return false;
    const r = calculateFirmMetrics({ billableHours: billable, hourlyRate: rate, realizationRate: realization, collectionRate: collection });
    const cur = 'USD';
    const items = [
      ['Recorded value', money(r.recordedValue, cur), 'Billable hours × hourly rate.'],
      ['Billed value', money(r.billedValue, cur), 'Recorded value × realization rate.'],
      ['Collected value', money(r.collectedValue, cur), 'Billed value × collection rate.'],
      ['Effective collected rate', r.effectiveCollectedRate === null ? 'Not available' : `${money(r.effectiveCollectedRate, cur)} per billable hour`, 'Collected value ÷ billable hours.'],
      ['Overall yield', r.overallYield === null ? 'Not available' : pct(r.overallYield), 'Collected value ÷ recorded value × 100.']
    ];
    const flow = el('ol', { class: 'bhc-flow', 'aria-label': 'Value flow' });
    flow.append(el('li', {}, `Recorded ${money(r.recordedValue, cur)}`), el('li', {}, `Billed ${money(r.billedValue, cur)}`), el('li', {}, `Collected ${money(r.collectedValue, cur)}`));
    show(panel, [flow, rows(items)], summary('Law firm metrics', items, 'Recorded → billed → collected'));
    return true;
  }

  // ---------- Tool D: Increment chart ----------
  function calcChart(panel) {
    const custom = read(panel, 'custom', 'customIncrement', { optional: true, integer: true });
    if (custom === undefined) return false;
    const method = field(panel, 'rounding').value;
    const customBtn = panel.querySelector('[data-col="custom"]');
    customBtn.disabled = !custom;
    if (!custom && chartCol === 'custom') setCol(panel, 'six');
    const table = el('table', { class: 'bhc-table', 'data-col': chartCol });
    table.append(el('caption', {}, `Minutes to billable hours, ${method === 'exact' ? 'exact (no rounding)' : { up: 'rounded up', nearest: 'rounded to nearest', down: 'rounded down' }[method]}`));
    const head = el('tr');
    const cols = [['minutes', 'Minutes'], ['exact', 'Exact hours'], ['six', '6-minute'], ['ten', '10-minute'], ['fifteen', '15-minute'], ...(custom ? [['custom', `${custom}-minute`]] : [])];
    for (const [key, label] of cols) head.append(el('th', { scope: 'col', 'data-c': key }, label));
    const thead = el('thead'); thead.append(head);
    const tbody = el('tbody');
    for (const row of chartRows(method, custom)) {
      const tr = el('tr', { tabindex: '0', 'data-minutes': String(row.minutes), 'aria-label': `${row.minutes} minutes. Select to use in Time Entry.` });
      tr.append(el('th', { scope: 'row', 'data-c': 'minutes' }, String(row.minutes)), el('td', { 'data-c': 'exact' }, fmt(row.exactHours, 4)), el('td', { 'data-c': 'six' }, hours(row.six)), el('td', { 'data-c': 'ten' }, fmt(row.ten, 4)), el('td', { 'data-c': 'fifteen' }, fmt(row.fifteen, 4)));
      if (custom) tr.append(el('td', { 'data-c': 'custom' }, fmt(row.custom, 4)));
      tbody.append(tr);
    }
    table.append(thead, tbody);
    panel.querySelector('[data-out]').replaceChildren(table);
    panel.dataset.summary = [...table.rows].map(tr => [...tr.cells].map(c => c.textContent).join('\t')).join('\n');
    return true;
  }
  function setCol(panel, col) {
    chartCol = col;
    panel.querySelectorAll('[data-col]').forEach(btn => { if (btn.tagName === 'BUTTON') btn.setAttribute('aria-pressed', String(btn.dataset.col === col)); });
    panel.querySelector('table')?.setAttribute('data-col', col);
  }

  const calculators = { time: calcTime, target: calcTarget, metrics: calcMetrics, chart: calcChart };
  function run(tool, { announce = true, focus = false } = {}) {
    const panel = panels[tool];
    clearErrors(panel);
    const ok = calculators[tool](panel);
    if (!ok) { if (tool !== 'chart') empty(panel); if (announce) live.textContent = 'Check the highlighted field.'; return; }
    if (announce && tool !== 'chart') live.textContent = 'Results updated.';
    if (focus && window.matchMedia('(max-width: 767px)').matches) panel.querySelector('.bhc-result h3')?.focus();
  }
  function summary(title, items, formula) {
    return [`Verdict Point Billable Hours Calculator: ${title}`, ...items.map(([t, v]) => `${t}: ${v}`), `Formula: ${formula}`, `Calculated ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`, page].join('\n');
  }

  // ---------- Visibility of conditional fields ----------
  function syncVisibility(panel) {
    const choice = radio(panel, 'method') || radio(panel, 'mode');
    panel.querySelectorAll('[data-show]').forEach(group => { group.hidden = !group.dataset.show.split(' ').includes(choice); });
    if (panel.dataset.tool === 'time') panel.querySelector('[data-custom]').hidden = timeIncrement !== 'custom';
  }
  function setIncrement(panel, value) {
    timeIncrement = value === 'custom' ? 'custom' : Number(value);
    panel.querySelectorAll('[data-increment]').forEach(btn => btn.setAttribute('aria-pressed', String(String(btn.dataset.increment) === String(value))));
    const rounding = field(panel, 'rounding');
    if (timeIncrement === 0) rounding.value = 'exact';
    else if (rounding.value === 'exact') rounding.value = 'up';
    syncVisibility(panel);
  }

  // ---------- Tabs (ARIA tab pattern) ----------
  function select(tool, { focusTab = false } = {}) {
    active = tool;
    tabs.forEach(tab => {
      const on = tab.getAttribute('aria-controls') === `bhc-panel-${tool}`;
      tab.setAttribute('aria-selected', String(on)); tab.tabIndex = on ? 0 : -1;
      if (on && focusTab) tab.focus();
    });
    Object.entries(panels).forEach(([key, panel]) => { panel.hidden = key !== tool; });
    run(tool, { announce: false });
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab.getAttribute('aria-controls').replace('bhc-panel-', '')));
    tab.addEventListener('keydown', event => {
      const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(event.key in keys)) return;
      event.preventDefault();
      const next = tabs[(keys[event.key] + tabs.length) % tabs.length];
      select(next.getAttribute('aria-controls').replace('bhc-panel-', ''), { focusTab: true });
    });
  });

  // ---------- Defaults, examples, reset with undo ----------
  const snapshot = panel => [...panel.querySelectorAll('input, select')].map(input => [input, input.type === 'radio' || input.type === 'checkbox' ? input.checked : input.value]);
  const restore = values => values.forEach(([input, value]) => { if (typeof value === 'boolean') input.checked = value; else input.value = value; });
  const defaults = Object.fromEntries(Object.entries(panels).map(([key, panel]) => [key, snapshot(panel)]));
  const examples = {
    time: panel => { restore(defaults.time); setIncrement(panel, 6); field(panel, 'minutes').value = '37'; field(panel, 'rounding').value = 'up'; field(panel, 'rate').value = '350'; },
    target: panel => { field(panel, 'target').value = '1800'; field(panel, 'done').value = '900'; field(panel, 'weeks').value = '48'; field(panel, 'doneweeks').value = '24'; field(panel, 'days').value = '5'; },
    metrics: panel => { field(panel, 'total').value = '40'; field(panel, 'billable').value = '30'; field(panel, 'rate').value = '350'; field(panel, 'realization').value = '92'; field(panel, 'collection').value = '95'; }
  };
  function reset(panel, tool) {
    const before = snapshot(panel), state = { increment: timeIncrement, col: chartCol };
    restore(defaults[tool]);
    if (tool === 'time') setIncrement(panel, 6);
    if (tool === 'chart') setCol(panel, 'six');
    syncVisibility(panel); run(tool, { announce: false });
    undo?.remove(); clearTimeout(undo?.timer);
    const bar = el('p', { class: 'bhc-undo', role: 'status' }, `${tool === 'chart' ? 'Chart' : 'Tool'} reset. `);
    const btn = el('button', { type: 'button' }, 'Undo');
    btn.addEventListener('click', () => { restore(before); if (tool === 'time') setIncrement(panel, state.increment); if (tool === 'chart') setCol(panel, state.col); syncVisibility(panel); run(tool); bar.remove(); });
    bar.append(btn); panel.prepend(bar);
    undo = bar; undo.timer = setTimeout(() => bar.remove(), 5000);
  }

  // ---------- Copy, print, share ----------
  async function copyText(button, text, done = 'Copied') {
    try { await navigator.clipboard.writeText(text); }
    catch { const area = el('textarea'); area.value = text; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0'; document.body.append(area); area.select(); document.execCommand('copy'); area.remove(); }
    const label = button.textContent; button.textContent = done; live.textContent = done === 'Copied' ? 'Copied to clipboard.' : 'Link copied.';
    setTimeout(() => { button.textContent = label; }, 2000);
  }
  function shareState(tool) {
    const p = panels[tool], s = { tool };
    if (tool === 'time') Object.assign(s, { method: radio(p, 'method'), minutes: field(p, 'minutes').value, hours: radio(p, 'method') === 'hm' ? field(p, 'hours').value : '', start: field(p, 'start').value, end: field(p, 'end').value, nextday: field(p, 'nextday').checked, break: field(p, 'break').value, increment: timeIncrement === 'custom' ? field(p, 'custom').value : timeIncrement, rounding: field(p, 'rounding').value, rate: field(p, 'rate').value, currency: field(p, 'currency').value });
    if (tool === 'target') Object.assign(s, { target: field(p, 'target').value, done: field(p, 'done').value, weeks: field(p, 'weeks').value, doneweeks: field(p, 'doneweeks').value, days: field(p, 'days').value });
    if (tool === 'metrics') Object.assign(s, { mode: radio(p, 'mode'), total: field(p, 'total').value, billable: field(p, 'billable').value, rate: field(p, 'rate').value, realization: field(p, 'realization').value, collection: field(p, 'collection').value });
    if (tool === 'chart') Object.assign(s, { rounding: field(p, 'rounding').value, increment: field(p, 'custom').value });
    if (s.method && s.method !== 'clock') { delete s.start; delete s.end; delete s.nextday; delete s.break; }
    const query = serializeCalculatorState(s);
    return `${page}${query ? `?${query}` : ''}#calculator`;
  }
  function applyState(state) {
    const tool = state.tool || 'time';
    if (tool === 'time') {
      const p = panels.time;
      if (state.method) p.querySelector(`[name="method"][value="${state.method}"]`).checked = true;
      for (const [key, name] of [['minutes', 'minutes'], ['hours', 'hours'], ['start', 'start'], ['end', 'end'], ['break', 'break'], ['rate', 'rate']]) if (state[key] !== undefined) field(p, name).value = String(state[key]);
      if (state.nextday) field(p, 'nextday').checked = true;
      if (state.currency) field(p, 'currency').value = state.currency;
      if (state.increment !== undefined) { if ([0, 6, 10, 15, 30].includes(state.increment)) setIncrement(p, state.increment); else { field(p, 'custom').value = String(state.increment); setIncrement(p, 'custom'); } }
      if (state.rounding && timeIncrement !== 0) field(p, 'rounding').value = state.rounding;
    }
    if (tool === 'target') for (const name of ['target', 'done', 'weeks', 'doneweeks', 'days']) if (state[name] !== undefined) field(panels.target, name).value = String(state[name]);
    if (tool === 'metrics') {
      const p = panels.metrics;
      if (state.mode) p.querySelector(`[name="mode"][value="${state.mode}"]`).checked = true;
      for (const name of ['total', 'billable', 'rate', 'realization', 'collection']) if (state[name] !== undefined) field(p, name).value = String(state[name]);
    }
    if (tool === 'chart') { if (state.rounding) field(panels.chart, 'rounding').value = state.rounding; if (state.increment) field(panels.chart, 'custom').value = String(state.increment); }
    return tool;
  }
  function print(tool) {
    const panel = panels[tool];
    document.body.dataset.bhcPrint = tool;
    const stamp = root.querySelector('.bhc-print-stamp') || el('p', { class: 'bhc-print-stamp' });
    stamp.textContent = `Printed ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })} from ${page}`;
    panel.append(stamp);
    window.print();
  }
  window.addEventListener('afterprint', () => { delete document.body.dataset.bhcPrint; });

  // ---------- Wiring ----------
  for (const [tool, panel] of Object.entries(panels)) {
    const form = panel.querySelector('form');
    form.addEventListener('submit', event => { event.preventDefault(); run(tool, { focus: true }); });
    form.addEventListener('input', event => { if (event.target.type === 'radio') return; clearTimeout(timer); timer = setTimeout(() => run(tool), 300); });
    form.addEventListener('change', event => { if (event.target.type === 'radio' || event.target.tagName === 'SELECT' || event.target.type === 'checkbox' || event.target.type === 'time') { syncVisibility(panel); run(tool); } });
    panel.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button || !panel.contains(button)) return;
      if (button.dataset.step) { const input = button.parentElement.querySelector('input'); const n = parseNumber(input.value); input.value = String(Math.max(0, (Number.isFinite(n) ? Math.round(n) : 0) + Number(button.dataset.step))); run(tool); return; }
      if (button.dataset.increment !== undefined) { setIncrement(panel, button.dataset.increment); run(tool); return; }
      if (button.dataset.col) { setCol(panel, button.dataset.col); return; }
      const action = button.dataset.action;
      if (action === 'example') { examples[tool](panel); syncVisibility(panel); run(tool, { focus: true }); }
      if (action === 'reset') reset(panel, tool);
      if (action === 'copy') copyText(button, panel.dataset.summary || 'No result to copy yet.');
      if (action === 'share') copyText(button, shareState(tool), 'Link copied');
      if (action === 'print') print(tool);
    });
  }
  // A chart row sends its minutes to the Time Entry tool.
  const chartOut = panels.chart.querySelector('[data-out]');
  const pickRow = row => { if (!row) return; const p = panels.time; p.querySelector('[name="method"][value="minutes"]').checked = true; field(p, 'minutes').value = row.dataset.minutes; syncVisibility(p); select('time'); tabs[0].focus(); live.textContent = `${row.dataset.minutes} minutes sent to Time Entry.`; };
  chartOut.addEventListener('click', event => pickRow(event.target.closest('tr[data-minutes]')));
  chartOut.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { const row = event.target.closest('tr[data-minutes]'); if (row) { event.preventDefault(); pickRow(row); } } });

  // Start from shared state when the URL carries it; unknown or out-of-range parameters are ignored.
  const start = applyState(parseCalculatorState(new URLSearchParams(location.search)));
  Object.values(panels).forEach(syncVisibility);
  for (const tool of Object.keys(panels)) run(tool, { announce: false });
  select(start);
  root.classList.add('bhc-ready');
}

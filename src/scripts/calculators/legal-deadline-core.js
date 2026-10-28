// Legal deadline calculator: pure date arithmetic with no DOM access, so tests can import it directly.
// Dates are whole UTC day numbers, which keeps daylight-saving changes out of the count.

export const RULES_VERSION = '2026-10-28';
export const LIMITS = { days: [0, 1000], customDates: 60, year: [1990, 2100] };
const DAY = 86400000;
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// "YYYY-MM-DD" to a day number, or null when the text is not a real calendar date.
export function parseDate(text) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text || '').trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const ms = Date.UTC(y, mo - 1, d);
  const check = new Date(ms);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) return null;
  if (y < LIMITS.year[0] || y > LIMITS.year[1]) return null;
  return ms / DAY;
}
const toDate = n => new Date(n * DAY);
export const isoDate = n => toDate(n).toISOString().slice(0, 10);
export const weekday = n => WEEKDAYS[toDate(n).getUTCDay()];
export const longDate = n => { const d = toDate(n); return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`; };
const dayNum = (y, m, d) => Date.UTC(y, m, d) / DAY;
// The nth given weekday of a month (n = -1 for the last one).
function nthWeekday(y, m, dow, n) {
  if (n > 0) { const first = dayNum(y, m, 1); return first + ((dow - toDate(first).getUTCDay() + 7) % 7) + (n - 1) * 7; }
  const last = dayNum(y, m + 1, 0); return last - ((toDate(last).getUTCDay() - dow + 7) % 7);
}

// Federal legal public holidays under 5 U.S.C. 6103(a). A holiday on Saturday is observed the Friday before
// (6103(b)), and one on Sunday the Monday after (Executive Order 11582). Juneteenth applies from 2021.
export function federalHolidays(year) {
  const fixed = (m, d) => dayNum(year, m, d);
  const list = [
    ['New Year\'s Day', fixed(0, 1)],
    ['Birthday of Martin Luther King, Jr.', nthWeekday(year, 0, 1, 3)],
    ['Washington\'s Birthday', nthWeekday(year, 1, 1, 3)],
    ['Memorial Day', nthWeekday(year, 4, 1, -1)],
    ...(year >= 2021 ? [['Juneteenth National Independence Day', fixed(5, 19)]] : []),
    ['Independence Day', fixed(6, 4)],
    ['Labor Day', nthWeekday(year, 8, 1, 1)],
    ['Columbus Day', nthWeekday(year, 9, 1, 2)],
    ['Veterans Day', fixed(10, 11)],
    ['Thanksgiving Day', nthWeekday(year, 10, 4, 4)],
    ['Christmas Day', fixed(11, 25)]
  ];
  return list.map(([name, date]) => {
    const dow = toDate(date).getUTCDay();
    const observed = dow === 6 ? date - 1 : dow === 0 ? date + 1 : date;
    return { name, date, observed };
  });
}

const holidayCache = new Map();
// Observed holiday dates near a day, keyed by day number. Covers the year before and after, since a
// January 1 that falls on Saturday is observed on December 31 of the prior year.
function holidayOn(n) {
  const year = toDate(n).getUTCFullYear();
  for (const y of [year - 1, year, year + 1]) {
    if (!holidayCache.has(y)) holidayCache.set(y, federalHolidays(y));
    const hit = holidayCache.get(y).find(h => h.observed === n);
    if (hit) return hit.observed === hit.date ? hit.name : `${hit.name} (observed)`;
  }
  return null;
}

// Why a day is not a counting or landing day, or null when it is an ordinary business day.
export function exclusionReason(n, { holidays = true, custom = new Set() } = {}) {
  const dow = toDate(n).getUTCDay();
  if (dow === 6) return 'Saturday';
  if (dow === 0) return 'Sunday';
  if (holidays) { const h = holidayOn(n); if (h) return h; }
  if (custom.has(n)) return 'Excluded date you added';
  return null;
}

// options: start (day number), days, direction 'forward' | 'backward', mode 'calendar' | 'business',
// includeStart, adjust 'roll' | 'none', holidays (boolean), custom (Set of day numbers).
export function calculateDeadline({ start, days, direction = 'forward', mode = 'calendar', includeStart = false, adjust = 'roll', holidays = true, custom = new Set() }) {
  const step = direction === 'backward' ? -1 : 1;
  const why = n => exclusionReason(n, { holidays, custom });
  const steps = [];
  let cur = start, counted = 0;
  steps.push({ date: start, kind: 'start', note: includeStart ? 'Start date, counted as day 1' : 'Start date, not counted' });
  if (mode === 'calendar') {
    if (includeStart && days > 0) { counted = 1; steps[0].count = 1; }
    while (counted < days) { cur += step; counted += 1; steps.push({ date: cur, kind: 'count', count: counted, note: why(cur) || '' }); }
  } else {
    if (includeStart && days > 0) {
      const reason = why(start);
      if (reason) steps[0].note = `Start date, not counted: ${reason}`; else { counted = 1; steps[0].count = 1; }
    }
    while (counted < days) {
      cur += step;
      const reason = why(cur);
      if (reason) steps.push({ date: cur, kind: 'skip', note: reason });
      else { counted += 1; steps.push({ date: cur, kind: 'count', count: counted, note: '' }); }
    }
  }
  const lastCounted = cur;
  // Rule 6(a)(1)(C) and 6(a)(5): a last day on a weekend or legal holiday continues to the next day that is
  // neither, counting forward for periods after an event and backward for periods before one.
  let rolled = [];
  if (adjust === 'roll') {
    while (why(cur)) { rolled.push({ date: cur, reason: why(cur) }); cur += step; }
    for (const r of rolled) steps.push({ date: r.date, kind: 'roll', note: `Last day falls on ${r.reason}; moved ${step > 0 ? 'forward' : 'back'}` });
    if (rolled.length) steps.push({ date: cur, kind: 'deadline', note: 'First day that is not a weekend, holiday, or excluded date' });
  }
  const landing = why(cur);
  return { deadline: cur, lastCounted, rolled: rolled.length > 0, rolledDays: rolled.length, landsOnExcluded: landing, calendarSpan: Math.abs(cur - start), steps };
}

// Shareable state: explicit allow list, each value validated.
const PARAMS = {
  start: v => parseDate(v) === null ? undefined : v,
  days: v => /^\d{1,4}$/.test(v) && Number(v) <= LIMITS.days[1] ? Number(v) : undefined,
  dir: v => ['forward', 'backward'].includes(v) ? v : undefined,
  mode: v => ['calendar', 'business'].includes(v) ? v : undefined,
  first: v => v === '1' ? true : undefined,
  adjust: v => ['roll', 'none'].includes(v) ? v : undefined,
  hol: v => v === '0' ? false : undefined,
  exclude: v => { const list = String(v).split(',').filter(Boolean); return list.length <= LIMITS.customDates && list.every(d => parseDate(d) !== null) ? list.join(',') : undefined; }
};
export function parseDeadlineState(searchParams) {
  const state = {};
  for (const [key, check] of Object.entries(PARAMS)) {
    if (!searchParams.has(key)) continue;
    const value = check(String(searchParams.get(key)).slice(0, 700));
    if (value !== undefined) state[key] = value;
  }
  return state;
}
export function serializeDeadlineState(state) {
  const params = new URLSearchParams();
  for (const key of Object.keys(PARAMS)) {
    let value = state[key];
    if (value === undefined || value === null || value === '') continue;
    if (key === 'first') { if (value) params.set(key, '1'); continue; }
    if (key === 'hol') { if (value === false) params.set(key, '0'); continue; }
    const clean = PARAMS[key](String(value));
    if (clean !== undefined) params.set(key, String(clean));
  }
  return params.toString();
}

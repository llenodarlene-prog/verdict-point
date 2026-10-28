// Federal post-judgment interest under 28 U.S.C. 1961: computed daily from the date of entry of the judgment
// to the date of payment, compounded annually. Pure functions with no DOM access, so tests can import them.
// Money is held in cents and rounded only for display.

export const LIMITS = { principal: [0.01, 1e12], rate: [0, 25], year: [1990, 2100] };
const DAY = 86400000;

export function parseDate(text) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text || '').trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const ms = Date.UTC(y, mo - 1, d), check = new Date(ms);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) return null;
  if (y < LIMITS.year[0] || y > LIMITS.year[1]) return null;
  return ms / DAY;
}
export const isoDate = n => new Date(n * DAY).toISOString().slice(0, 10);

export function parseAmount(value) {
  const text = String(value ?? '').trim().replace(/[$,\s]/g, '');
  if (!text) return null;
  if (!/^\d*\.?\d+$/.test(text)) return NaN;
  return Number(text);
}

// The same calendar date n years later; February 29 falls back to February 28 in a common year.
export function anniversary(start, years) {
  const d = new Date(start * DAY);
  const y = d.getUTCFullYear() + years, m = d.getUTCMonth(), day = d.getUTCDate();
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return Date.UTC(y, m, Math.min(day, last)) / DAY;
}

// basis: 365 divides the annual rate by 365 every day; 'actual' divides by the length of each judgment year (365 or 366).
// Days are counted from the day after entry through the payment date, so a payment on the day of entry accrues nothing.
export function calculateJudgmentInterest({ principal, ratePercent, judgmentDate, paymentDate, basis = 365 }) {
  const rate = ratePercent / 100;
  let balanceCents = Math.round(principal * 100);
  const principalCents = balanceCents;
  const periods = [];
  let periodStart = judgmentDate, year = 0;
  while (periodStart < paymentDate) {
    const nextAnniversary = anniversary(judgmentDate, year + 1);
    const periodEnd = Math.min(nextAnniversary, paymentDate);
    const days = periodEnd - periodStart;
    const yearLength = basis === 'actual' ? nextAnniversary - anniversary(judgmentDate, year) : 365;
    const interestCents = balanceCents * rate * days / yearLength;
    const compounded = periodEnd === nextAnniversary;
    periods.push({ year: year + 1, start: periodStart, end: periodEnd, days, yearLength, openingCents: balanceCents, interestCents, dailyCents: balanceCents * rate / yearLength, compounded });
    // Interest is added to the balance on each anniversary of the judgment (compounded annually under 1961(b)).
    balanceCents += interestCents;
    periodStart = periodEnd; year += 1;
  }
  const totalInterestCents = balanceCents - principalCents;
  const last = periods[periods.length - 1];
  return {
    days: Math.max(0, paymentDate - judgmentDate), periods,
    principal: principalCents / 100, interest: Math.round(totalInterestCents) / 100, total: Math.round(balanceCents) / 100,
    dailyInterest: last ? Math.round(last.dailyCents) / 100 : Math.round(principalCents * rate / 365) / 100
  };
}

const PARAMS = {
  amount: v => { const n = parseAmount(v); return Number.isFinite(n) && n >= LIMITS.principal[0] && n <= LIMITS.principal[1] ? n : undefined; },
  rate: v => { const n = parseAmount(v); return Number.isFinite(n) && n >= LIMITS.rate[0] && n <= LIMITS.rate[1] ? n : undefined; },
  entered: v => parseDate(v) === null ? undefined : v,
  paid: v => parseDate(v) === null ? undefined : v,
  basis: v => ['365', 'actual'].includes(v) ? v : undefined
};
export function parseInterestState(searchParams) {
  const state = {};
  for (const [key, check] of Object.entries(PARAMS)) {
    if (!searchParams.has(key)) continue;
    const value = check(String(searchParams.get(key)).slice(0, 30));
    if (value !== undefined) state[key] = value;
  }
  return state;
}
export function serializeInterestState(state) {
  const params = new URLSearchParams();
  for (const key of Object.keys(PARAMS)) {
    const value = state[key];
    if (value === undefined || value === null || value === '') continue;
    const clean = PARAMS[key](String(value));
    if (clean !== undefined) params.set(key, String(clean));
  }
  return params.toString();
}

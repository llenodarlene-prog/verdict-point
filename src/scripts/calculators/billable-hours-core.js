// Billable hours calculator formulas. Pure functions with no DOM access, so tests can import them directly.
// Money is handled in integer minor units (cents) and rounded only for display.

export const LIMITS = {
  minutes: [0, 1440], hours: [0, 24], breakMinutes: [0, 1440], customIncrement: [1, 60], rate: [0, 10000],
  annualTarget: [1, 4000], completedHours: [0, 4000], workingWeeks: [1, 52], completedWeeks: [0, 52], workdaysPerWeek: [1, 7],
  totalWorkHours: [0, 10000], billableHours: [0, 10000], percent: [0, 100]
};
export const INCREMENTS = [0, 6, 10, 15, 30];
export const ROUNDING = ['exact', 'up', 'nearest', 'down'];
export const CURRENCIES = ['USD', 'CAD', 'GBP', 'EUR', 'AUD'];
export const TOOLS = ['time', 'target', 'metrics', 'chart'];

// Reads a typed or pasted value. Commas are accepted as thousands separators; anything else non-numeric is rejected.
export function parseNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  const text = String(value ?? '').trim().replace(/,/g, '').replace(/^\$/, '');
  if (!text) return null;
  if (!/^-?\d*\.?\d+$/.test(text)) return NaN;
  return Number(text);
}

export function inRange(value, [min, max]) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

export const toCents = amount => Math.round(amount * 100);

// "HH:MM" to minutes after midnight, or null.
export function parseClock(value) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(value || ''));
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

export function elapsedMinutes(start, end, endsNextDay) {
  const from = parseClock(start), to = parseClock(end);
  if (from === null || to === null) return { error: 'clock' };
  if (to < from && !endsNextDay) return { error: 'overnight' };
  return { minutes: endsNextDay ? to + 1440 - from : to - from };
}

// Integer arithmetic on whole minutes, so no floating-point comparison decides whether a value sits on an increment.
export function roundMinutes(totalMinutes, incrementMinutes, method) {
  const minutes = Math.max(0, Math.round(totalMinutes));
  if (method === 'exact' || !incrementMinutes) return minutes;
  const units = Math.floor(minutes / incrementMinutes), remainder = minutes % incrementMinutes;
  if (remainder === 0) return minutes;
  if (method === 'down') return units * incrementMinutes;
  if (method === 'nearest') return (remainder * 2 >= incrementMinutes ? units + 1 : units) * incrementMinutes;
  return (units + 1) * incrementMinutes;
}

export function calculateTimeEntry({ totalMinutes, incrementMinutes, roundingMethod, hourlyRate }) {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const exact = roundingMethod === 'exact' || !incrementMinutes;
  const roundedMinutes = roundMinutes(minutes, incrementMinutes, exact ? 'exact' : roundingMethod);
  const hasRate = typeof hourlyRate === 'number' && Number.isFinite(hourlyRate);
  const rateCents = hasRate ? toCents(hourlyRate) : null;
  const exactValueCents = hasRate ? Math.round(minutes * rateCents / 60) : null;
  const estimatedValueCents = hasRate ? Math.round(roundedMinutes * rateCents / 60) : null;
  return {
    exact, totalMinutes: minutes, exactHours: minutes / 60, roundedMinutes, billableHours: roundedMinutes / 60,
    exactValue: hasRate ? exactValueCents / 100 : null, estimatedValue: hasRate ? estimatedValueCents / 100 : null,
    minuteDifference: roundedMinutes - minutes, valueDifference: hasRate ? (estimatedValueCents - exactValueCents) / 100 : null
  };
}

export function calculateTargetPlan({ annualTarget, completedHours, workingWeeks, completedWeeks, workdaysPerWeek }) {
  const monthlyTarget = annualTarget / 12;
  const weeklyTarget = annualTarget / workingWeeks;
  const dailyTarget = weeklyTarget / workdaysPerWeek;
  const hoursRemaining = Math.max(annualTarget - completedHours, 0);
  const weeksRemaining = Math.max(workingWeeks - completedWeeks, 0);
  const expectedHoursToDate = weeklyTarget * completedWeeks;
  const paceDifference = completedHours - expectedHoursToDate;
  const progressPercent = Math.min((completedHours / annualTarget) * 100, 100);
  let status, requiredWeeklyPace = null, requiredDailyPace = null;
  if (hoursRemaining === 0) status = 'met';
  else if (weeksRemaining === 0) status = 'short';
  else {
    requiredWeeklyPace = hoursRemaining / weeksRemaining;
    requiredDailyPace = requiredWeeklyPace / workdaysPerWeek;
    // Within a hundredth of an hour counts as on pace, so display rounding never flips the label.
    status = Math.abs(paceDifference) < 0.005 ? 'on' : paceDifference > 0 ? 'ahead' : 'behind';
  }
  return { monthlyTarget, weeklyTarget, dailyTarget, hoursRemaining, weeksRemaining, requiredWeeklyPace, requiredDailyPace, expectedHoursToDate, paceDifference, progressPercent, status };
}

export function calculateFirmMetrics({ totalWorkHours, billableHours, hourlyRate, realizationRate = 100, collectionRate = 100 }) {
  const result = { utilizationRate: null, recordedValue: null, billedValue: null, collectedValue: null, effectiveCollectedRate: null, overallYield: null };
  if (typeof totalWorkHours === 'number' && totalWorkHours > 0 && typeof billableHours === 'number') result.utilizationRate = billableHours / totalWorkHours * 100;
  if (typeof billableHours === 'number' && typeof hourlyRate === 'number') {
    const recordedCents = billableHours * toCents(hourlyRate);
    const billedCents = recordedCents * realizationRate / 100;
    const collectedCents = billedCents * collectionRate / 100;
    result.recordedValue = Math.round(recordedCents) / 100;
    result.billedValue = Math.round(billedCents) / 100;
    result.collectedValue = Math.round(collectedCents) / 100;
    result.effectiveCollectedRate = billableHours > 0 ? Math.round(collectedCents / billableHours) / 100 : null;
    result.overallYield = recordedCents > 0 ? collectedCents / recordedCents * 100 : null;
  }
  return result;
}

// One row per minute for the increment chart.
export function chartRows(method = 'up', custom = null) {
  return Array.from({ length: 60 }, (_, i) => {
    const minutes = i + 1;
    return { minutes, exactHours: minutes / 60, six: roundMinutes(minutes, 6, method) / 60, ten: roundMinutes(minutes, 10, method) / 60, fifteen: roundMinutes(minutes, 15, method) / 60, custom: custom ? roundMinutes(minutes, custom, method) / 60 : null };
  });
}

// Shareable state: an explicit allow list of parameters, each validated against its documented range.
const PARAMS = {
  tool: value => TOOLS.includes(value) ? value : undefined,
  method: value => ['minutes', 'hm', 'clock'].includes(value) ? value : undefined,
  minutes: number('minutes'), hours: number('hours'), break: number('breakMinutes'),
  start: value => parseClock(value) === null ? undefined : value, end: value => parseClock(value) === null ? undefined : value,
  nextday: value => value === '1' ? true : undefined,
  increment: value => { const n = parseNumber(value); return Number.isInteger(n) && (INCREMENTS.includes(n) || inRange(n, LIMITS.customIncrement)) ? n : undefined; },
  rounding: value => ROUNDING.includes(value) ? value : undefined,
  rate: number('rate'), currency: value => CURRENCIES.includes(value) ? value : undefined,
  target: number('annualTarget'), done: number('completedHours'), weeks: number('workingWeeks'), doneweeks: number('completedWeeks'), days: number('workdaysPerWeek'),
  mode: value => ['hours', 'revenue'].includes(value) ? value : undefined,
  total: number('totalWorkHours'), billable: number('billableHours'), realization: number('percent'), collection: number('percent')
};
function number(limit) { return value => { const n = parseNumber(value); return inRange(n, LIMITS[limit]) ? n : undefined; }; }

export function parseCalculatorState(searchParams) {
  const state = {};
  for (const [key, check] of Object.entries(PARAMS)) {
    if (!searchParams.has(key)) continue;
    const value = check(String(searchParams.get(key)).slice(0, 20));
    if (value !== undefined) state[key] = value;
  }
  return state;
}

export function serializeCalculatorState(state) {
  const params = new URLSearchParams();
  for (const key of Object.keys(PARAMS)) {
    const value = state[key];
    if (value === undefined || value === null || value === '' || value === false) continue;
    const clean = PARAMS[key](value === true ? '1' : String(value));
    if (clean !== undefined) params.set(key, clean === true ? '1' : String(clean));
  }
  return params.toString();
}

// Permanent partial disability (impairment income benefit) calculator. Florida: 2026 Florida Statutes s. 440.15(2)(a)
// (temporary total disability rate of 66 2/3 or 66.67 percent of average weekly wages), s. 440.15(3)(c) (impairment
// income benefits at 75 percent of the average weekly TTD benefit, not above the s. 440.12 maximum, reduced 50 percent for
// weeks with earnings at or above the average weekly wage) and s. 440.15(3)(g) (weeks per impairment point for accidents
// on or after October 1, 2003). Maximum rates: Florida CFO Division of Workers' Compensation maximum compensation rate table.
export const RULES_VERSION = 'Florida Statutes 2026, s. 440.15 and s. 440.12; CFO maximum rate table; reviewed 2026-11-23';
export const FL_MAX = { 2025: 1295, 2026: 1358 };
export const FL_MIN = 20;
const money = n => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const round2 = n => Math.round(n * 100) / 100;

export function floridaWeeks(rating) {
  if (!(rating >= 1)) return 0;
  const r = Math.floor(rating);
  return Math.min(r, 10) * 2 + Math.max(0, Math.min(r, 15) - 10) * 3 + Math.max(0, Math.min(r, 20) - 15) * 4 + Math.max(0, r - 20) * 6;
}
export function floridaTtdRate(aww, year) {
  const max = FL_MAX[year];
  if (!(aww > 0) || !max) return null;
  if (aww < FL_MIN) return round2(aww);
  return round2(Math.max(FL_MIN, Math.min(aww * 0.6667, max)));
}
export function floridaIib(aww, year) {
  const ttd = floridaTtdRate(aww, year);
  if (ttd === null) return null;
  return round2(Math.min(ttd * 0.75, FL_MAX[year]));
}

export function compute(v = {}) {
  const year = Number(v.year) || 2026;
  if (!(v.aww > 0)) return { empty: 'Enter the average weekly wage and the impairment rating.' };
  if (!(v.rating >= 1)) return { empty: 'Enter an impairment rating of 1% or more to the body as a whole.' };
  if (v.rating > 100) return { empty: 'Enter an impairment rating from 1 to 100.' };
  const ttd = floridaTtdRate(v.aww, year), weekly = floridaIib(v.aww, year), weeks = floridaWeeks(v.rating);
  const reducedWeeks = Math.min(weeks, Math.max(0, Math.floor(v.workWeeks ?? 0)));
  const total = round2(weekly * (weeks - reducedWeeks) + weekly * 0.5 * reducedWeeks);
  const rows = [['Temporary total disability rate', `66.67% of ${money(v.aww)}, capped at ${money(FL_MAX[year])} for ${year} injuries`, money(ttd)],
    ['Impairment income benefit per week', '75% of the TTD rate (s. 440.15(3)(c))', money(weekly)],
    ['Weeks of benefits', `${Math.floor(v.rating)}% rating under s. 440.15(3)(g)`, `${weeks} weeks`]];
  if (reducedWeeks) rows.push(['Weeks with earnings at or above the average weekly wage', 'Paid at 50% (s. 440.15(3)(c))', `${reducedWeeks} weeks`]);
  rows.push(['Estimated total impairment income benefits', '', money(total)]);
  return {
    headline: { icon: 'scale', label: 'Estimated Florida impairment income benefits', value: money(total) },
    tiles: [['receipt-2', 'Weekly benefit', money(weekly), '75% of the TTD rate'], ['calendar-event', 'Benefit weeks', `${weeks}`, `For a ${Math.floor(v.rating)}% rating`], ['report-money', 'TTD rate used', money(ttd), `${year} maximum ${money(FL_MAX[year])}`]],
    notes: ['Florida pays these benefits every two weeks, starting the day after maximum medical improvement or the end of temporary benefits, whichever is earlier. The impairment rating must come from an authorized physician using Florida\'s uniform schedule. This estimate leaves out settlements, attorney fees, offsets, and permanent total disability.'],
    formula: 'Florida s. 440.15(3): weekly benefit = 75% × (66.67% × average weekly wage, capped at the yearly maximum). Weeks: 2 per point for 1-10%, 3 per point for 11-15%, 4 per point for 16-20%, 6 per point above 20%. Weeks with earnings at or above the average weekly wage are paid at half.',
    table: { caption: 'How the Florida estimate adds up', head: ['Step', 'Basis', 'Amount'], rows },
    summary: rows.map(r => `${r[0]}: ${r[2]}`)
  };
}
export const EXAMPLE = { aww: '1200', rating: '12', year: '2026', workWeeks: '' };

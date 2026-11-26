// Permanent partial disability (impairment income benefit) calculator. Florida: 2026 Florida Statutes s. 440.15(2)(a)
// (temporary total disability rate of 66 2/3 or 66.67 percent of average weekly wages), s. 440.15(3)(c) (impairment
// income benefits at 75 percent of the average weekly TTD benefit, not above the s. 440.12 maximum, reduced 50 percent for
// weeks with earnings at or above the average weekly wage) and s. 440.15(3)(g) (weeks per impairment point for accidents
// on or after October 1, 2003). Maximum rates: Florida CFO Division of Workers' Compensation maximum compensation rate table.
// Texas: Labor Code s. 408.121 (3 weeks per impairment point, from the day after maximum medical improvement), s. 408.126
// (70 percent of the average weekly wage), s. 408.061(b) and 408.062 (maximum 70 percent and minimum 15 percent of the state
// average weekly wage; the dollar amounts are set each fiscal year, so the user enters them). Georgia: O.C.G.A. 34-9-263(c)
// (two-thirds of the average weekly wage for rating percent times the member's maximum weeks) and 34-9-261 (maximum $800 and
// minimum $50 a week). Both from owner-supplied official copies, reviewed 2026-11-26.
export const RULES_VERSION = 'Florida Statutes 2026, s. 440.15 and s. 440.12; Texas Labor Code ch. 408; O.C.G.A. 34-9-261 and 34-9-263 (2025); reviewed 2026-11-26';
export const GA_MAX = 800, GA_MIN = 50;
// Texas Department of Insurance maximum and minimum weekly benefit table (page updated 9/14/2026, owner-supplied copy):
// fiscal year by date of injury. IIB and TIB columns.
export const TX_RATES = Object.freeze({ 2027: { label: 'Oct 1, 2026 to Sep 30, 2027', iibMax: 920, iibMin: 197, tibMax: 1314, tibMin: 197 }, 2026: { label: 'Oct 1, 2025 to Sep 30, 2026', iibMax: 890, iibMin: 191, tibMax: 1271, tibMin: 191 }, 2025: { label: 'Oct 1, 2024 to Sep 30, 2025', iibMax: 853, iibMin: 183, tibMax: 1219, tibMin: 183 } });
export const GA_WEEKS = Object.freeze({ body: ['Body as a whole', 300], arm: ['Arm', 225], leg: ['Leg', 225], hand: ['Hand', 160], foot: ['Foot', 135], thumb: ['Thumb', 60], index: ['Index finger', 40], middle: ['Middle finger', 35], ring: ['Ring finger', 30], little: ['Little finger', 25], 'great-toe': ['Great toe', 30], toe: ['Other toe', 20], 'hearing-one': ['Hearing, one ear', 75], 'hearing-both': ['Hearing, both ears', 150], eye: ['Vision, one eye', 150] });
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

function floridaCompute(v = {}) {
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

export function georgiaWeekly(aww) { if (!(aww > 0)) return null; if (aww < GA_MIN) return round2(aww); return round2(Math.min(GA_MAX, Math.max(GA_MIN, aww * 2 / 3))); }
export function georgiaWeeks(rating, part) { const p = GA_WEEKS[part] || GA_WEEKS.body; return round2(rating / 100 * p[1]); }
export function texasWeekly(aww, max, min) { if (!(aww > 0)) return null; let w = aww * 0.7; if (max > 0) w = Math.min(w, max); if (min > 0) w = Math.max(w, min); return round2(w); }
function result(label, weekly, weeks, rows, notes, formula, tiles) {
  const total = round2(weekly * weeks);
  rows.push(['Estimated total', '', money(total)]);
  return { headline: { icon: 'scale', label, value: money(total) }, tiles: [['receipt-2', 'Weekly benefit', money(weekly), tiles[0]], ['calendar-event', 'Benefit weeks', String(weeks), tiles[1]]], notes, formula, table: { caption: 'How the estimate adds up', head: ['Step', 'Basis', 'Amount'], rows }, summary: rows.map(r => `${r[0]}: ${r[2]}`) };
}
export function compute(v = {}) {
  if (v.state === 'texas') {
    if (!(v.aww > 0) || !(v.rating >= 1) || v.rating > 100) return { empty: 'Enter the average weekly wage and an impairment rating from 1 to 100.' };
    const fy = TX_RATES[v.txYear] || TX_RATES[2027]; const max = v.txMax > 0 ? v.txMax : fy.iibMax, min = v.txMin > 0 ? v.txMin : fy.iibMin;
    const weekly = texasWeekly(v.aww, max, min), weeks = Math.floor(v.rating) * 3;
    const rows = [['Weekly impairment income benefit', `70% of ${money(v.aww)}, between ${money(min)} and ${money(max)} (${v.txMax > 0 ? 'your figures' : `TDI, injuries ${fy.label}`})`, money(weekly)], ['Weeks of benefits', `3 weeks × ${Math.floor(v.rating)}% (s. 408.121)`, `${weeks} weeks`]];
    const notes = ['Texas pays impairment income benefits from the day after maximum medical improvement (s. 408.121). The weekly maximum is 70% of the state average weekly wage and the minimum is 15%, set each fiscal year and fixed by your date of injury (s. 408.061, 408.062). The calculator uses the Texas Department of Insurance table for the fiscal year you choose.'];
    return result('Estimated Texas impairment income benefits', weekly, weeks, rows, notes, 'Texas: weekly benefit = 70% of the average weekly wage, within the yearly maximum and minimum. Weeks = 3 × impairment rating.', ['70% of the wage', `${Math.floor(v.rating)}% rating`]);
  }
  if (v.state === 'georgia') {
    if (!(v.aww > 0) || !(v.rating > 0) || v.rating > 100) return { empty: 'Enter the average weekly wage and a disability rating from 1 to 100.' };
    const part = GA_WEEKS[v.bodyPart] || GA_WEEKS.body, weekly = georgiaWeekly(v.aww), weeks = georgiaWeeks(v.rating, v.bodyPart);
    const rows = [['Weekly benefit', `Two-thirds of ${money(v.aww)}, between ${money(GA_MIN)} and ${money(GA_MAX)}`, money(weekly)], ['Weeks of benefits', `${v.rating}% × ${part[1]} maximum weeks for ${part[0].toLowerCase()} (34-9-263(c))`, `${weeks} weeks`]];
    return result('Estimated Georgia permanent partial disability benefits', weekly, weeks, rows, ['Georgia pays these benefits only after temporary total or partial benefits end (34-9-263(b)). Ratings must use the AMA Guides, fifth edition (34-9-263(d)). The $800 maximum applies to injuries on or after July 1, 2023.'], 'Georgia: weekly benefit = two-thirds of the average weekly wage ($50 minimum, $800 maximum). Weeks = rating % × the maximum weeks for the body part.', ['Two-thirds of the wage', part[0]]);
  }
  return floridaCompute(v);
}

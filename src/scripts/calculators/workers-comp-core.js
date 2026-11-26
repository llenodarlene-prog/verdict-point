// Workers' compensation temporary disability calculator. Florida: 2026 Florida Statutes s. 440.15(2)(a) (temporary total
// disability at 66 2/3 or 66.67 percent of the average weekly wage, up to 104 weeks), s. 440.15(4)(a) and (e) (temporary partial
// disability at 80 percent of the difference between 80 percent of the average weekly wage and post-injury earnings, capped at
// 66.67 percent of the average weekly wage, sharing the 104 weeks), and s. 440.12(1)-(2) (7-day waiting period, paid back when
// disability lasts more than 21 days; weekly maximum and $20 minimum). Maximum rates come from the CFO rate table.
import { FL_MAX, FL_MIN, floridaTtdRate, georgiaWeekly, GA_MAX, GA_MIN, TX_RATES } from './ppd-core.js';
export const GA_TPD_MAX = 533;
// Georgia 34-9-262: two-thirds of the wage loss, at most $533 a week, up to 350 weeks; 34-9-220: first 7 days unpaid unless
// incapacitated 21 consecutive days. Texas Labor Code 408.103(a)(1): 70% of (average weekly wage - post-injury earnings),
// within the TDI TIB maximum and minimum for the fiscal year of injury.
// Georgia: O.C.G.A. 34-9-261 (two-thirds of the average weekly wage, $50 to $800 a week, up to 400 weeks), owner-supplied
// official copy, reviewed 2026-11-26. Georgia partial disability (34-9-262) and the waiting period are not modeled.
export const RULES_VERSION = 'Florida Statutes 2026, s. 440.15 and s. 440.12; CFO maximum rate table; O.C.G.A. 34-9-261 (2025); reviewed 2026-11-26';
const money = n => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const round2 = n => Math.round(n * 100) / 100;
export const MAX_WEEKS = 104;

export function floridaTpdRate(aww, post, year) {
  const max = FL_MAX[year];
  if (!(aww > 0) || !max || !(post >= 0)) return null;
  const raw = 0.8 * (0.8 * aww - post);
  return round2(Math.max(0, Math.min(raw, aww * 0.6667, max)));
}

function georgiaCompute(v) {
  const ttdW = Math.min(v.ttdWeeks > 0 ? v.ttdWeeks : 0, 400), tpdW = Math.min(v.tpdWeeks > 0 ? v.tpdWeeks : 0, 350);
  if (!(v.aww > 0) || !(ttdW + tpdW > 0)) return { empty: 'Enter the average weekly wage and the weeks of total or partial disability.' };
  if (tpdW && !(v.post >= 0)) return { empty: 'Enter weekly earnings after the injury for the partial disability weeks. Enter 0 if none.' };
  const ttd = georgiaWeekly(v.aww), tpd = tpdW ? round2(Math.max(0, Math.min(GA_TPD_MAX, (v.aww - v.post) * 2 / 3))) : 0;
  const days = ((v.ttdWeeks || 0) + (v.tpdWeeks || 0)) * 7, waiting = ttdW && days < 21 ? ttd : 0;
  const total = round2(ttd * ttdW + tpd * tpdW - waiting);
  const rows = [];
  if (ttdW) rows.push(['Temporary total disability rate', `Two-thirds of ${money(v.aww)}, between ${money(GA_MIN)} and ${money(GA_MAX)} (34-9-261)`, money(ttd)], [`Total disability, ${ttdW} weeks`, `${ttdW} × ${money(ttd)}`, money(round2(ttd * ttdW))]);
  if (tpdW) rows.push(['Temporary partial disability rate', `Two-thirds of (${money(v.aww)} − ${money(v.post)}), at most ${money(GA_TPD_MAX)} (34-9-262)`, money(tpd)], [`Partial disability, ${tpdW} weeks`, `${tpdW} × ${money(tpd)}`, money(round2(tpd * tpdW))]);
  if (waiting) rows.push(['First 7 days', 'Unpaid unless off 21 consecutive days (34-9-220)', `−${money(waiting)}`]);
  rows.push(['Estimated temporary disability benefits', '', money(total)]);
  const notes = ['Georgia pays total disability for up to 400 weeks and partial disability for up to 350 weeks from the date of injury. The $800 and $533 maximums apply to injuries on or after July 1, 2023.'];
  if (days >= 21) notes.push('Because the incapacity lasted at least 21 days, the first 7 days are paid too (34-9-220).');
  return { headline: { icon: 'scale', label: 'Estimated Georgia temporary disability benefits', value: money(total) }, tiles: [['receipt-2', 'Total disability rate', money(ttd), 'Per week'], ...(tpdW ? [['receipt-2', 'Partial disability rate', money(tpd), 'Per week']] : []), ['calendar-event', 'Weeks counted', String(ttdW + tpdW), 'Total plus partial']], notes,
    formula: 'Georgia: total disability = two-thirds of the wage ($50 to $800). Partial disability = two-thirds of the wage loss (at most $533). First 7 days unpaid unless off 21 consecutive days.', table: { caption: 'How the Georgia estimate adds up', head: ['Step', 'Basis', 'Amount'], rows }, summary: rows.map(r => `${r[0]}: ${r[2]}`) };
}
function texasCompute(v) {
  const weeks = (v.ttdWeeks > 0 ? v.ttdWeeks : 0) + (v.tpdWeeks > 0 ? v.tpdWeeks : 0);
  if (!(v.aww > 0) || !(weeks > 0)) return { empty: 'Enter the average weekly wage and the weeks of lost wages.' };
  const fy = TX_RATES[v.txYear] || TX_RATES[2027];
  const total0 = v.ttdWeeks > 0 ? round2(Math.min(fy.tibMax, Math.max(fy.tibMin, v.aww * 0.7))) : 0;
  const part = v.tpdWeeks > 0 ? round2(Math.min(fy.tibMax, Math.max(0, (v.aww - (v.post > 0 ? v.post : 0)) * 0.7))) : 0;
  const total = round2(total0 * (v.ttdWeeks || 0) + part * (v.tpdWeeks || 0));
  const rows = [];
  if (v.ttdWeeks > 0) rows.push(['Weekly benefit with no earnings', `70% of ${money(v.aww)}, between ${money(fy.tibMin)} and ${money(fy.tibMax)}`, money(total0)], [`${v.ttdWeeks} weeks off work`, '', money(round2(total0 * v.ttdWeeks))]);
  if (v.tpdWeeks > 0) rows.push(['Weekly benefit with reduced earnings', `70% of (${money(v.aww)} − ${money(v.post > 0 ? v.post : 0)}), up to ${money(fy.tibMax)}`, money(part)], [`${v.tpdWeeks} weeks of reduced earnings`, '', money(round2(part * v.tpdWeeks))]);
  rows.push(['Estimated temporary income benefits', '', money(total)]);
  return { headline: { icon: 'scale', label: 'Estimated Texas temporary income benefits', value: money(total) }, tiles: [['receipt-2', 'Weekly maximum', money(fy.tibMax), `Injuries ${fy.label}`], ['calendar-event', 'Weeks counted', String(weeks), 'As entered']],
    notes: ['Texas Labor Code s. 408.103 sets temporary income benefits at 70% of the difference between the average weekly wage and post-injury earnings. Workers earning less than $10 an hour get 75% for the first 26 weeks, which this estimate does not apply. Benefits stop at maximum medical improvement. The waiting period is not modeled.'],
    formula: 'Texas: 70% × (average weekly wage − weekly earnings after the injury), within the TDI maximum and minimum for the fiscal year of injury.', table: { caption: 'How the Texas estimate adds up', head: ['Step', 'Basis', 'Amount'], rows }, summary: rows.map(r => `${r[0]}: ${r[2]}`) };
}

export function compute(v = {}) {
  if (v.state === 'georgia') return georgiaCompute(v);
  if (v.state === 'texas') return texasCompute(v);
  const year = Number(v.year) || 2026;
  if (!(v.aww > 0)) return { empty: 'Enter the average weekly wage and the weeks of disability.' };
  const ttdWeeksIn = v.ttdWeeks ?? 0, tpdWeeksIn = v.tpdWeeks ?? 0;
  if (!(ttdWeeksIn + tpdWeeksIn > 0)) return { empty: 'Enter weeks of total or partial disability.' };
  if (tpdWeeksIn > 0 && !(v.post >= 0)) return { empty: 'Enter weekly earnings after the injury for the partial disability weeks. Enter 0 if none.' };
  const ttdWeeks = Math.min(ttdWeeksIn, MAX_WEEKS), tpdWeeks = Math.min(tpdWeeksIn, MAX_WEEKS - ttdWeeks);
  const capped = ttdWeeksIn + tpdWeeksIn > MAX_WEEKS;
  const ttd = floridaTtdRate(v.aww, year), tpd = tpdWeeks > 0 ? floridaTpdRate(v.aww, v.post, year) : 0;
  const days = (ttdWeeksIn + tpdWeeksIn) * 7;
  const waiting = days > 21 ? 0 : round2((ttdWeeks > 0 ? ttd : tpd) * Math.min(1, ttdWeeks > 0 ? ttdWeeks : tpdWeeks));
  const ttdTotal = round2(ttd * ttdWeeks), tpdTotal = round2(tpd * tpdWeeks);
  const total = round2(ttdTotal + tpdTotal - waiting);
  const rows = [['Temporary total disability rate', `66.67% of ${money(v.aww)}, capped at ${money(FL_MAX[year])}`, money(ttd)]];
  if (ttdWeeks) rows.push([`Total disability, ${ttdWeeks} weeks`, `${ttdWeeks} × ${money(ttd)}`, money(ttdTotal)]);
  if (tpdWeeks) rows.push(['Temporary partial disability rate', `80% × (80% of ${money(v.aww)} − ${money(v.post)}), capped at 66.67% of the wage`, money(tpd)], [`Partial disability, ${tpdWeeks} weeks`, `${tpdWeeks} × ${money(tpd)}`, money(tpdTotal)]);
  if (waiting) rows.push(['7-day waiting period', 'Not paid when disability lasts 21 days or less (s. 440.12(1))', `−${money(waiting)}`]);
  rows.push(['Estimated temporary disability benefits', '', money(total)]);
  const notes = ['Temporary benefits stop at maximum medical improvement or after 104 weeks, whichever comes first. After that, any permanent impairment is rated and paid as impairment income benefits. This estimate leaves out medical benefits, settlements, attorney fees, and offsets.'];
  if (capped) notes.unshift(`Florida caps temporary total and partial benefits at ${MAX_WEEKS} weeks combined, so only ${MAX_WEEKS} weeks are counted.`);
  if (days > 21) notes.push('Because the disability lasts more than 21 days, the first 7 days are paid too.');
  return {
    headline: { icon: 'scale', label: 'Estimated Florida temporary disability benefits', value: money(total) },
    tiles: [['receipt-2', 'Weekly total disability rate', money(ttd), `${year} maximum ${money(FL_MAX[year])}`], ...(tpdWeeks ? [['receipt-2', 'Weekly partial disability rate', money(tpd), 'Based on post-injury earnings']] : []), ['calendar-event', 'Weeks counted', `${ttdWeeks + tpdWeeks}`, `Up to ${MAX_WEEKS} combined`]],
    notes,
    formula: `Florida s. 440.15: total disability pays 66.67% of the average weekly wage, up to the yearly maximum (minimum ${money(FL_MIN)}). Partial disability pays 80% of the gap between 80% of the wage and post-injury earnings, up to 66.67% of the wage. Both share a 104-week limit.`,
    table: { caption: 'How the Florida estimate adds up', head: ['Step', 'Basis', 'Amount'], rows },
    summary: rows.map(r => `${r[0]}: ${r[2]}`)
  };
}
export const EXAMPLE = { aww: '1000', year: '2026', ttdWeeks: '8', tpdWeeks: '12', post: '400' };

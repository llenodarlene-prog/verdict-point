// Workers' compensation temporary disability calculator. Florida: 2026 Florida Statutes s. 440.15(2)(a) (temporary total
// disability at 66 2/3 or 66.67 percent of the average weekly wage, up to 104 weeks), s. 440.15(4)(a) and (e) (temporary partial
// disability at 80 percent of the difference between 80 percent of the average weekly wage and post-injury earnings, capped at
// 66.67 percent of the average weekly wage, sharing the 104 weeks), and s. 440.12(1)-(2) (7-day waiting period, paid back when
// disability lasts more than 21 days; weekly maximum and $20 minimum). Maximum rates come from the CFO rate table.
import { FL_MAX, FL_MIN, floridaTtdRate, georgiaWeekly, GA_MAX, GA_MIN } from './ppd-core.js';
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
  if (!(v.aww > 0) || !(v.ttdWeeks > 0)) return { empty: 'Enter the average weekly wage and the weeks you could not work.' };
  const weeks = Math.min(v.ttdWeeks, 400), weekly = georgiaWeekly(v.aww), total = round2(weekly * weeks);
  const rows = [['Temporary total disability rate', `Two-thirds of ${money(v.aww)}, between ${money(GA_MIN)} and ${money(GA_MAX)}`, money(weekly)], [`Total disability, ${weeks} weeks`, `${weeks} × ${money(weekly)}`, money(total)], ['Estimated temporary total disability benefits', '', money(total)]];
  const notes = ['Georgia pays temporary total disability for up to 400 weeks from the date of injury, longer for a catastrophic injury (34-9-261). The $800 maximum applies to injuries on or after July 1, 2023.', 'This Georgia estimate covers total disability only. Partial disability and the waiting period are not included.'];
  if (v.ttdWeeks > 400) notes.unshift('Only 400 weeks are counted, the Georgia limit for non-catastrophic injuries.');
  return { headline: { icon: 'scale', label: 'Estimated Georgia temporary total disability benefits', value: money(total) }, tiles: [['receipt-2', 'Weekly rate', money(weekly), 'Two-thirds of the wage'], ['calendar-event', 'Weeks counted', String(weeks), 'Up to 400']], notes,
    formula: 'Georgia O.C.G.A. 34-9-261: two-thirds of the average weekly wage, at least $50 and at most $800 a week, for up to 400 weeks.', table: { caption: 'How the Georgia estimate adds up', head: ['Step', 'Basis', 'Amount'], rows }, summary: rows.map(r => `${r[0]}: ${r[2]}`) };
}

export function compute(v = {}) {
  if (v.state === 'georgia') return georgiaCompute(v);
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

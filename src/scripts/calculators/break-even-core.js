// Law firm break-even calculator. Pure arithmetic on the user's figures: the collected value of one billed hour is
// rate × realization × collection, and break-even hours are monthly overhead ÷ that value.
export const RULES_VERSION = '2026-11-24';
const money = n => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export function compute(v = {}) {
  const overhead = (v.rent > 0 ? v.rent : 0) + (v.salaries > 0 ? v.salaries : 0) + (v.software > 0 ? v.software : 0) + (v.otherCosts > 0 ? v.otherCosts : 0) + (v.ownerPay > 0 ? v.ownerPay : 0);
  if (!overhead || !(v.rate > 0)) return { empty: 'Enter your monthly costs and your hourly rate to see your break-even hours.' };
  const real = (v.realization > 0 ? Math.min(100, v.realization) : 100) / 100, coll = (v.collection > 0 ? Math.min(100, v.collection) : 100) / 100;
  const perHour = v.rate * real * coll, hours = overhead / perHour, perDay = hours / (v.workDays > 0 ? v.workDays : 21);
  const rows = [['Monthly overhead', 'Rent, salaries, software, other, and owner pay', money(overhead)], ['Cash collected per billed hour', `${money(v.rate)} × ${Math.round(real * 100)}% realized × ${Math.round(coll * 100)}% collected`, money(perHour)], ['Billable hours to break even each month', 'Overhead ÷ cash per hour', hours.toFixed(1)], ['Billable hours per working day', `Over ${v.workDays > 0 ? v.workDays : 21} working days`, perDay.toFixed(1)]];
  return { headline: { icon: 'scale', label: 'Billable hours to break even each month', value: hours.toFixed(1) }, tiles: [['receipt-2', 'Monthly overhead', money(overhead), 'Including owner pay'], ['clock-hour-4', 'Per working day', perDay.toFixed(1), 'Billable hours'], ['report-money', 'Cash per billed hour', money(perHour), 'After realization and collection']],
    notes: ['Include a salary for yourself in owner pay. Otherwise the break-even point hides the cost of your own time.'], formula: 'Break-even hours = monthly overhead ÷ (hourly rate × realization rate × collection rate).',
    table: { caption: 'How the break-even point is found', head: ['Item', 'Basis', 'Amount'], rows }, summary: rows.map(r => `${r[0]}: ${r[2]}`) };
}
export const EXAMPLE = { rent: '3500', salaries: '9000', software: '800', otherCosts: '1700', ownerPay: '8000', rate: '300', realization: '90', collection: '92', workDays: '21' };

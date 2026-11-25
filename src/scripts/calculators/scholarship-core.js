// Law school scholarship comparison. Arithmetic on the user's own figures: net tuition for each school over the
// program, plus a stress test that assumes a conditional scholarship is lost after the first year.
export const RULES_VERSION = '2026-11-24';
const money = n => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const net = (t, s, y, keep) => keep ? Math.max(0, t - s) * y : Math.max(0, t - s) + t * (y - 1);
export function compute(v = {}) {
  const y = v.years > 0 ? v.years : 3;
  if (!(v.tuitionA > 0) || !(v.tuitionB > 0)) return { empty: 'Enter yearly tuition and scholarship for both schools.' };
  const sA = v.scholarA > 0 ? v.scholarA : 0, sB = v.scholarB > 0 ? v.scholarB : 0;
  const a = net(v.tuitionA, sA, y, true) + (v.livingA > 0 ? v.livingA * y : 0), b = net(v.tuitionB, sB, y, true) + (v.livingB > 0 ? v.livingB * y : 0);
  const aLose = v.condA ? net(v.tuitionA, sA, y, false) + (v.livingA > 0 ? v.livingA * y : 0) : a, bLose = v.condB ? net(v.tuitionB, sB, y, false) + (v.livingB > 0 ? v.livingB * y : 0) : b;
  const cheaper = a === b ? 'Both schools' : a < b ? 'School A' : 'School B';
  const rows = [['School A net cost', `(${money(v.tuitionA)} − ${money(sA)}) × ${y} years${v.livingA ? ' + living costs' : ''}`, money(a)], ['School B net cost', `(${money(v.tuitionB)} − ${money(sB)}) × ${y} years${v.livingB ? ' + living costs' : ''}`, money(b)], ['Difference', '', money(Math.abs(a - b))]];
  if (v.condA) rows.push(['School A if the scholarship is lost after year 1', 'Full tuition in later years', money(aLose)]);
  if (v.condB) rows.push(['School B if the scholarship is lost after year 1', 'Full tuition in later years', money(bLose)]);
  return { headline: { icon: 'scale', label: `${cheaper} costs less`, value: money(Math.abs(a - b)) }, tiles: [['receipt-2', 'School A', money(a), 'Net cost'], ['receipt-2', 'School B', money(b), 'Net cost']],
    notes: ['Ask each school whether the scholarship has conditions, such as a minimum GPA or class rank, and how many students kept it last year. Each ABA-approved law school publishes conditional scholarship data in its Standard 509 disclosure.'], formula: 'Net cost = (tuition − scholarship) × years + living costs. The stress test charges full tuition after year 1.',
    table: { caption: 'Scholarship comparison', head: ['Item', 'Basis', 'Amount'], rows }, summary: rows.map(r => `${r[0]}: ${r[2]}`) };
}
export const EXAMPLE = { years: '3', tuitionA: '62000', scholarA: '40000', livingA: '22000', condA: true, tuitionB: '48000', scholarB: '15000', livingB: '18000', condB: false };

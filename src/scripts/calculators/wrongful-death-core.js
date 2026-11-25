// Wrongful death settlement calculator. Arithmetic on the user's own figures, grouped by the damage types in 2026
// Florida Statutes s. 768.21: survivors' lost support and services (future losses reduced to present value), medical and
// funeral expenses, survivors' non-economic losses (a figure the user chooses), and the estate's lost earnings from injury
// to death. No prediction; present value uses the discount rate the user enters.
export const RULES_VERSION = 'Florida Statutes 2026, s. 768.21 and s. 95.11(5)(e); reviewed 2026-11-24';
const money = n => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export function presentValue(annual, years, ratePct) {
  if (!(annual > 0) || !(years > 0)) return 0;
  const r = (ratePct > 0 ? ratePct : 0) / 100, n = Math.floor(years), frac = years - n;
  let pv = 0;
  for (let t = 1; t <= n; t++) pv += annual / Math.pow(1 + r, t);
  if (frac > 0) pv += annual * frac / Math.pow(1 + r, n + 1);
  return pv;
}
export function compute(v = {}) {
  const support = presentValue(v.annualSupport, v.years, v.discount);
  const med = v.medicalFuneral > 0 ? v.medicalFuneral : 0, nonEcon = v.nonEconomic > 0 ? v.nonEconomic : 0, estate = v.estateEarnings > 0 ? v.estateEarnings : 0;
  const total = support + med + nonEcon + estate;
  if (!total) return { empty: 'Enter the yearly support the family lost and the number of years, or other losses, to see a scenario.' };
  const rows = [];
  if (support) rows.push(['Survivors\' lost support and services', `${money(v.annualSupport)} a year for ${v.years} years at a ${v.discount || 0}% discount rate (present value)`, money(support)]);
  if (med) rows.push(['Medical and funeral expenses', 'Your figure', money(med)]);
  if (estate) rows.push(['Estate: lost earnings from injury to death', 'Your figure', money(estate)]);
  if (nonEcon) rows.push(['Survivors\' companionship and mental pain and suffering', 'Your figure; no multiplier applied', money(nonEcon)]);
  rows.push(['Scenario total', '', money(total)]);
  const fee = total * (v.feePct > 0 ? Math.min(100, v.feePct) : 0) / 100;
  if (fee) rows.push(['Less attorney fee', `${v.feePct}%`, `−${money(fee)}`], ['Scenario after fee', 'Before costs and taxes', money(total - fee)]);
  return {
    headline: { icon: 'scale', label: 'Illustrative wrongful death scenario', value: money(total) },
    tiles: [['receipt-2', 'Lost support (present value)', money(support), v.years ? `${v.years} years` : 'Not entered'], ['report-money', 'Undiscounted support', money((v.annualSupport > 0 ? v.annualSupport : 0) * (v.years > 0 ? v.years : 0)), 'Before present value'], ...(fee ? [['wallet', 'After fee', money(total - fee), `${v.feePct}% fee`]] : [])],
    notes: ['In Florida, s. 768.21 lists who can recover what. A surviving spouse can recover for lost companionship, protection, and mental pain and suffering; minor children for lost parental companionship, instruction, and guidance; and parents of a minor child for mental pain and suffering. Wrongful death actions generally must be filed within two years (s. 95.11(5)(e)).'],
    formula: 'Lost support is discounted to present value: the sum of yearly support ÷ (1 + rate)^year. The other lines are figures you enter.',
    table: { caption: 'How the scenario adds up', head: ['Item', 'Basis', 'Amount'], rows }, summary: rows.map(r => `${r[0]}: ${r[2]}`)
  };
}
export const EXAMPLE = { annualSupport: '45000', years: '20', discount: '3', medicalFuneral: '28000', estateEarnings: '', nonEconomic: '500000', feePct: '' };

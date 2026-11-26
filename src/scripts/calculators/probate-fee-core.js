// Probate attorney fee calculator. Florida: 2026 Florida Statutes 733.6171(3), the schedule presumed reasonable for
// ordinary services in a formal administration, based on "compensable value" (inventory value of probate estate
// assets plus income earned during administration), and 733.6171(4)(e) for preparing the federal estate tax return.
// The schedule is not a mandatory fee (733.6171(2)(b)); extraordinary services are compensated separately.
// California: Probate Code s. 10810 (amended Stats. 2001, ch. 699), from the owner-supplied official PDF, reviewed 2026-11-26.
export const RULES_VERSION = 'Florida Statutes 2026, s. 733.6171, reviewed 2026-11-18; California Probate Code s. 10810, reviewed 2026-11-26';
const money = n => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
// [upper bound of bracket, rate on the slice, label]; flat steps handled first.
const PCT = [[1e6, 0.03, '3% of value from $100,000 to $1 million'], [3e6, 0.025, '2.5% from $1 million to $3 million'], [5e6, 0.02, '2% from $3 million to $5 million'], [10e6, 0.015, '1.5% from $5 million to $10 million'], [Infinity, 0.01, '1% above $10 million']];

export function floridaOrdinaryFee(value) {
  if (!(value >= 0)) return null;
  const steps = [['First $40,000 or less (flat)', 1500]];
  if (value > 40000) steps.push(['Over $40,000 up to $70,000 (additional flat)', 750]);
  if (value > 70000) steps.push(['Over $70,000 up to $100,000 (additional flat)', 750]);
  let lower = 100000;
  for (const [upper, rate, label] of PCT) {
    if (value <= lower) break;
    const slice = Math.min(value, upper) - lower;
    steps.push([`${label}: ${money(slice)} × ${rate * 100}%`, slice * rate]);
    lower = upper;
  }
  return { total: steps.reduce((s, [, a]) => s + a, 0), steps };
}
export function floridaEstateTaxReturnFee(gross) {
  if (!(gross > 0)) return 0;
  return Math.min(gross, 10e6) * 0.005 + Math.max(0, gross - 10e6) * 0.0025;
}

export const CA_BRACKETS = [[100000, 0.04, 'Four percent on the first $100,000'], [100000, 0.03, 'Three percent on the next $100,000'], [800000, 0.02, 'Two percent on the next $800,000'], [9000000, 0.01, 'One percent on the next $9 million'], [15000000, 0.005, 'One-half of 1 percent on the next $15 million']];
export function californiaFee(value) {
  if (!(value >= 0)) return null;
  let rest = value, total = 0; const steps = [];
  for (const [size, rate, label] of CA_BRACKETS) { if (rest <= 0) break; const slice = Math.min(rest, size); steps.push([`${label}: ${money(slice)} × ${rate * 100}%`, slice * rate]); total += slice * rate; rest -= slice; }
  return { total, steps, overCap: Math.max(0, value - 25e6) };
}
function californiaCompute(v) {
  const value = Math.max(0, v.inventory + (v.income ?? 0));
  const fee = californiaFee(value);
  const rows = [['Value of the estate accounted for', 'Inventory appraisal + gains and receipts − losses', money(value)], ...fee.steps.map(([l, a]) => [l, '', money(a)]), ['Statutory fee for ordinary services', 'Probate Code s. 10810(a)', money(fee.total)]];
  const notes = ['Under s. 10810(b), the value is the inventory appraisal plus gains over appraisal on sales and receipts, less losses on sales, without subtracting mortgages or other debts on estate property. Extraordinary services are compensated separately.'];
  if (fee.overCap) notes.unshift(`For the ${money(fee.overCap)} above $25 million, s. 10810(a)(6) leaves the fee to a reasonable amount determined by the court, so it is not included.`);
  return { headline: { icon: 'scale', label: 'California statutory attorney fee', value: money(fee.total) }, tiles: [['receipt-2', 'Estate value accounted for', money(value), 'Debts are not subtracted'], ['percentage', 'Effective rate', value > 0 ? `${(fee.total / Math.min(value, 25e6) * 100).toFixed(2)}%` : 'n/a', 'Fee ÷ value up to $25 million']], notes,
    formula: 'California Probate Code s. 10810(a): 4% of the first $100,000, 3% of the next $100,000, 2% of the next $800,000, 1% of the next $9 million, 0.5% of the next $15 million, and a court-set amount above $25 million.',
    table: { caption: 'How the California schedule adds up', head: ['Step', 'Basis', 'Amount'], rows }, summary: rows.map(r => `${r[0]}: ${r[2]}`) };
}

export function compute(v = {}) {
  if (v.state === 'california') { if (!(v.inventory >= 0) || v.inventory === undefined) return { empty: 'Enter the inventory appraisal value of the estate.' }; return californiaCompute(v); }
  const inventory = v.inventory, income = v.income ?? 0;
  if (!(inventory >= 0) || inventory === undefined) return { empty: 'Enter the inventory value of the probate estate assets.' };
  const value = inventory + income;
  const fee = floridaOrdinaryFee(value);
  const rows = [['Compensable value', 'Inventory value + income during administration', money(value)], ...fee.steps.map(([l, a]) => [l, '', money(a)]), ['Ordinary services fee presumed reasonable', 's. 733.6171(3)', money(fee.total)]];
  let taxFee = 0;
  if (v.grossEstate > 0) { taxFee = floridaEstateTaxReturnFee(v.grossEstate); rows.push(['Federal estate tax return, if the attorney prepares it', '0.5% up to $10 million of the gross estate, 0.25% above (s. 733.6171(4)(e))', money(taxFee)]); }
  const total = fee.total + taxFee;
  if (taxFee) rows.push(['Total of the scheduled amounts', '', money(total)]);
  return {
    headline: { icon: 'scale', label: 'Florida ordinary services fee presumed reasonable', value: money(fee.total) },
    tiles: [['receipt-2', 'Compensable value', money(value), 'Inventory value plus income'], ['percentage', 'Effective rate', value > 0 ? `${(fee.total / value * 100).toFixed(2)}%` : 'n/a', 'Fee ÷ compensable value'], ...(taxFee ? [['report-money', 'Estate tax return fee', money(taxFee), 'Only if the attorney prepares it']] : [])],
    notes: ['The schedule is presumed reasonable, not mandatory. Florida requires the attorney to disclose that there is no mandatory statutory fee, and the parties can agree to a different method. Extraordinary services, such as will contests or real estate sales, are paid separately.'],
    formula: 'Florida s. 733.6171(3): $1,500 up to $40,000; $750 more to $70,000; $750 more to $100,000; then 3% of the next $900,000, 2.5% to $3 million, 2% to $5 million, 1.5% to $10 million, and 1% above.',
    table: { caption: 'How the Florida schedule adds up', head: ['Step', 'Basis', 'Amount'], rows },
    summary: rows.map(r => `${r[0]}: ${r[2]}`)
  };
}
export const EXAMPLE = { inventory: '850000', income: '25000', grossEstate: '' };

// eDiscovery cost comparison across three pricing models. Pure functions with no DOM access, so tests can import them directly.
// Every rate is entered by the user from a vendor quote; the model never supplies a vendor price.

export const GROUPS = [
  { legend: 'Your Matter', icon: 'file-description', fields: [
    { key: 'gb', label: 'Data at the start (GB)', help: 'Processed data you expect to host.', type: 'num' },
    { key: 'months', label: 'Months hosted', help: 'A whole number from 1 to 120.', type: 'int', min: 1, max: 120 },
    { key: 'reviewers', label: 'Number of reviewers', help: 'Seats needed for per-user pricing.', type: 'int', min: 0, max: 100000 },
    { key: 'cull', label: 'Data removed after month 1 (%)', help: 'Culling after early case assessment. Enter 0 to keep everything.', type: 'pct', optional: true }
  ] },
  { legend: 'Per-GB Model', icon: 'chart-bar', optional: true, fields: [
    { key: 'gbRate', label: 'Hosting per GB per month ($)', help: 'From a per-GB quote.', type: 'money', optional: true },
    { key: 'gbProcessing', label: 'One-time processing per GB ($)', help: 'Enter 0 if processing is included.', type: 'money', optional: true }
  ] },
  { legend: 'Per-User Model', icon: 'users', optional: true, fields: [
    { key: 'userRate', label: 'Price per user per month ($)', help: 'From a per-user quote.', type: 'money', optional: true }
  ] },
  { legend: 'Per-Case Tier Model', icon: 'table', optional: true, fields: [
    { key: 'tierRate', label: 'Tier price per month ($)', help: 'The monthly price of the tier that fits your data.', type: 'money', optional: true }
  ] }
];

export function hostedGb(gb, cull, month) { return month === 1 ? gb : gb * (1 - cull / 100); }

export function models(v) {
  const cull = v.cull || 0, out = {};
  if (v.gbRate !== undefined) {
    let hosting = 0; for (let m = 1; m <= v.months; m++) hosting += hostedGb(v.gb, cull, m) * v.gbRate;
    out.gb = { label: 'Per GB', total: hosting + v.gb * (v.gbProcessing || 0) };
  }
  if (v.userRate !== undefined) out.user = { label: 'Per user', total: v.userRate * v.reviewers * v.months };
  if (v.tierRate !== undefined) out.tier = { label: 'Per-case tier', total: v.tierRate * v.months };
  for (const r of Object.values(out)) { r.monthly = r.total / v.months; r.perGb = v.gb > 0 ? r.total / v.gb : null; }
  return out;
}

export function compute(v) {
  if (v.gb === undefined || v.months === undefined || v.reviewers === undefined) return { empty: 'Enter your data size, months hosted, and reviewers, then at least one pricing model.' };
  const res = models(v), keys = Object.keys(res);
  if (!keys.length) return { empty: 'Enter the rate for at least one pricing model.' };
  const sorted = [...keys].sort((a, b) => res[a].total - res[b].total), best = res[sorted[0]], worst = res[sorted[sorted.length - 1]];
  const after = hostedGb(v.gb, v.cull || 0, 2);
  return {
    headline: { icon: 'search', label: `Lowest total over ${v.months} months`, value: `${best.label}: ${fmt.money(best.total)}` },
    tiles: [
      ['calendar-check', 'Average per month', fmt.money(best.monthly), best.label],
      ['file-description', 'Cost per GB', best.perGb === null ? 'Not available' : fmt.money2(best.perGb), 'Total cost ÷ starting data'],
      ['chart-bar', 'Data hosted after culling', `${fmt.num(after)} GB`, 'From month 2 in the per-GB model'],
      ['scale', 'Gap to the highest model', keys.length > 1 ? fmt.money(worst.total - best.total) : 'Add another model', keys.length > 1 ? `${worst.label} costs more` : '']
    ],
    table: { caption: 'Pricing model comparison', head: ['Model', 'Per month', 'Total', 'Per GB'], rows: keys.map(k => [res[k].label, fmt.money(res[k].monthly), fmt.money(res[k].total), res[k].perGb === null ? 'n/a' : fmt.money2(res[k].perGb)]) },
    formula: 'Per GB = data hosted each month × hosting rate, plus starting data × processing rate. Culling lowers hosted data from month 2. Per user = price × reviewers × months. Per-case tier = tier price × months.',
    summary: keys.map(k => `${res[k].label}: ${fmt.money(res[k].total)} over ${v.months} months`),
    results: res
  };
}

export const EXAMPLE = { gb: 50, months: 6, reviewers: 3, cull: 40, gbRate: 15, gbProcessing: 25, userRate: 300, tierRate: 600 };

export const fmt = {
  money: x => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(x),
  money2: x => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x),
  num: (x, d = 1) => new Intl.NumberFormat('en-US', { maximumFractionDigits: d }).format(x),
  pct: (x, d = 2) => `${new Intl.NumberFormat('en-US', { maximumFractionDigits: d }).format(x)}%`
};

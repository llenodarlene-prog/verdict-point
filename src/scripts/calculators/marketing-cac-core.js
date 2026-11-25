// Law firm client acquisition cost and marketing budget calculator. Arithmetic on the user's own figures:
// cost per lead = spend ÷ leads; clients = leads × conversion rate; CAC = spend ÷ clients; return = clients × average fee ÷ spend.
export const RULES_VERSION = '2026-11-24';
const money = n => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export function compute(v = {}) {
  if (!(v.spend > 0) || !(v.leads > 0)) return { empty: 'Enter your monthly marketing spend and the leads it brought in.' };
  const conv = (v.conversion > 0 ? Math.min(100, v.conversion) : 0) / 100, clients = v.leads * conv;
  const cpl = v.spend / v.leads, cac = clients > 0 ? v.spend / clients : null, revenue = clients * (v.avgFee > 0 ? v.avgFee : 0);
  const rows = [['Cost per lead', `${money(v.spend)} ÷ ${v.leads} leads`, money(cpl)], ['New clients', `${v.leads} leads × ${Math.round(conv * 1000) / 10}% conversion`, clients.toFixed(1)], ['Client acquisition cost', 'Spend ÷ new clients', cac === null ? 'n/a' : money(cac)]];
  if (v.avgFee > 0) rows.push(['Fee revenue from new clients', `${clients.toFixed(1)} × ${money(v.avgFee)}`, money(revenue)], ['Revenue per marketing dollar', 'Revenue ÷ spend', (revenue / v.spend).toFixed(2)]);
  let budget = null;
  if (v.targetClients > 0 && cac !== null) { budget = v.targetClients * cac; rows.push(['Budget for your target', `${v.targetClients} clients × ${money(cac)} CAC, if it holds`, money(budget)]); }
  return { headline: { icon: 'scale', label: 'Client acquisition cost', value: cac === null ? 'n/a' : money(cac) }, tiles: [['receipt-2', 'Cost per lead', money(cpl), `${v.leads} leads`], ['chart-bar', 'New clients', clients.toFixed(1), 'Per month'], ...(budget ? [['report-money', 'Budget for target', money(budget), `${v.targetClients} clients`]] : [])],
    notes: ['Track leads and signed clients by channel. A blended figure can hide one channel that costs far more per client than the others.'], formula: 'CAC = marketing spend ÷ new clients. New clients = leads × conversion rate.',
    table: { caption: 'Marketing math', head: ['Item', 'Basis', 'Amount'], rows }, summary: rows.map(r => `${r[0]}: ${r[2]}`) };
}
export const EXAMPLE = { spend: '6000', leads: '80', conversion: '15', avgFee: '4500', targetClients: '18' };

// Car accident settlement calculator. Arithmetic on the user's own figures only: economic losses are itemized,
// the non-economic figure is whatever the user chooses to test (no multiplier is applied), the user's share of
// fault reduces the total, an optional insurance policy limit caps what that policy pays, and fees, costs, and
// medical liens are subtracted to show a net scenario. It does not predict a settlement.
export const RULES_VERSION = '2026-11-18';
const money = n => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export const ECONOMIC = [['medical', 'Medical bills to date'], ['futureMedical', 'Future medical care'], ['lostWages', 'Lost wages to date'], ['futureWages', 'Future lost earnings'], ['property', 'Vehicle and property damage'], ['otherCosts', 'Other out-of-pocket costs']];

export function compute(v = {}) {
  const econRows = ECONOMIC.filter(([k]) => v[k] > 0).map(([k, label]) => [label, 'Your figure', money(v[k])]);
  const economic = ECONOMIC.reduce((s, [k]) => s + (v[k] > 0 ? v[k] : 0), 0);
  const nonEconomic = v.nonEconomic > 0 ? v.nonEconomic : 0;
  if (!economic && !nonEconomic) return { empty: 'Enter at least one loss, such as medical bills or lost wages, to see a scenario.' };
  const rows = [...econRows, ['Economic losses', 'Sum of the items above', money(economic)]];
  if (nonEconomic) rows.push(['Pain and suffering figure to test', 'Your figure; no multiplier applied', money(nonEconomic)]);
  const claim = economic + nonEconomic;
  rows.push(['Claim value before fault', '', money(claim)]);
  const fault = Math.min(100, v.faultPct > 0 ? v.faultPct : 0);
  const afterFault = claim * (1 - fault / 100);
  const notes = [];
  if (fault) { rows.push(['Less your share of fault', `${fault}% reduction`, `−${money(claim - afterFault)}`]); notes.push('States have different rules on shared fault, and in some states your share of fault can bar recovery entirely. Check the rule in your state.'); }
  let recoverable = afterFault;
  if (v.policyLimit > 0 && afterFault > v.policyLimit) { recoverable = v.policyLimit; rows.push(['Limited by the policy limit you entered', 'Other sources may cover more', money(recoverable)]); }
  const fee = recoverable * (v.feePct > 0 ? Math.min(100, v.feePct) : 0) / 100;
  const costs = v.caseCosts > 0 ? v.caseCosts : 0, liens = v.liens > 0 ? v.liens : 0;
  if (fee) rows.push(['Less attorney fee', `${v.feePct}% of the recovery`, `−${money(fee)}`]);
  if (costs) rows.push(['Less case costs', 'Your figure', `−${money(costs)}`]);
  if (liens) rows.push(['Less medical liens and repayments', 'Your figure', `−${money(liens)}`]);
  const net = recoverable - fee - costs - liens;
  rows.push(['Net to you in this scenario', 'Before taxes', money(net)]);
  if (net < 0) notes.push('Fees, costs, and liens exceed the recovery in this scenario. Lien and fee reductions are often negotiated; ask your lawyer.');
  const tiles = [['receipt-2', 'Economic losses', money(economic), `${econRows.length} item${econRows.length === 1 ? '' : 's'}`]];
  if (nonEconomic) tiles.push(['scale', 'Pain and suffering tested', money(nonEconomic), 'Your figure']);
  if (fault) tiles.push(['chart-bar', 'After shared fault', money(afterFault), `${fault}% reduction`]);
  tiles.push(['wallet', 'Net to you', money(net), 'After fees, costs, and liens you entered']);
  return {
    headline: { icon: 'scale', label: 'Illustrative claim value before fees', value: money(recoverable) },
    tiles, notes,
    formula: 'Claim value = economic losses + the pain and suffering figure you test, reduced by your share of fault and capped at any policy limit you enter. Net = claim value − fee − costs − liens.',
    table: { caption: 'How the scenario adds up', head: ['Item', 'Basis', 'Amount'], rows },
    summary: rows.map(r => `${r[0]}: ${r[2]}${r[1] ? ` (${r[1]})` : ''}`).concat(notes)
  };
}
export const EXAMPLE = { medical: '18500', futureMedical: '4000', lostWages: '6200', property: '9800', otherCosts: '650', nonEconomic: '25000', faultPct: '20', policyLimit: '50000', feePct: '33', caseCosts: '1500', liens: '7000' };

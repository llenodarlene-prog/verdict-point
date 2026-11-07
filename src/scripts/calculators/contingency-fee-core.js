// Contingency fee settlement breakdown. Pure functions with no DOM access, so tests can import them directly.
// The fee percentage and cost method come from the user's own fee agreement; the model never supplies a rate.

export const GROUPS = [
  { legend: 'Settlement and Fee', icon: 'scale', fields: [
    { key: 'gross', label: 'Gross settlement or award ($)', help: 'The total amount recovered before anything is paid out.', type: 'money' },
    { key: 'feePct', label: 'Contingency fee (%)', help: 'The percentage in your fee agreement. One third is 33.33.', type: 'pct' },
    { key: 'method', label: 'When are case costs taken out?', help: 'Your fee agreement should say which method applies.', type: 'select', options: [['before', 'Before the fee is calculated'], ['after', 'After the fee is calculated']] }
  ] },
  { legend: 'Deductions', icon: 'receipt', optional: true, fields: [
    { key: 'costs', label: 'Case costs advanced ($)', help: 'Filing fees, experts, records, and similar costs. Enter 0 if none.', type: 'money', optional: true },
    { key: 'liens', label: 'Liens and other payments ($)', help: 'Medical liens or other amounts paid from the recovery. Enter 0 if none.', type: 'money', optional: true }
  ] }
];

export function breakdown({ gross, feePct, method = 'before', costs = 0, liens = 0 }) {
  const base = method === 'before' ? Math.max(gross - costs, 0) : gross;
  const fee = base * feePct / 100;
  const net = gross - fee - costs - liens;
  return { base, fee, costs, liens, net, netShare: gross > 0 ? net / gross * 100 : null, feeShare: gross > 0 ? fee / gross * 100 : null };
}

export function compute(v) {
  if (v.gross === undefined || v.feePct === undefined) return { empty: 'Enter the gross settlement and the fee percentage to see the breakdown.' };
  const method = v.method || 'before';
  const r = breakdown({ ...v, method });
  const other = breakdown({ ...v, method: method === 'before' ? 'after' : 'before' });
  return {
    headline: { icon: 'wallet', label: 'Estimated amount to the client', value: fmt.money2(r.net) },
    tiles: [
      ['scale', 'Attorney fee', fmt.money2(r.fee), `${fmt.num(v.feePct, 2)}% of ${fmt.money2(r.base)}`],
      ['receipt', 'Costs and liens repaid', fmt.money2(r.costs + r.liens), 'Paid from the recovery'],
      ['percentage', 'Client share of the gross', r.netShare === null ? 'Not available' : fmt.pct(r.netShare, 1), 'Net to client ÷ gross'],
      ['arrows-left-right', 'Difference from the other method', fmt.money2(Math.abs(other.net - r.net)), `Costs taken out ${method === 'before' ? 'after' : 'before'} the fee would ${other.net > r.net ? 'raise' : 'lower'} the client net`]
    ],
    table: { caption: 'Settlement breakdown', head: ['Item', 'Amount'], rows: [['Gross recovery', fmt.money2(v.gross)], ['Fee base', fmt.money2(r.base)], ['Attorney fee', `−${fmt.money2(r.fee)}`], ['Case costs', `−${fmt.money2(r.costs)}`], ['Liens and other payments', `−${fmt.money2(r.liens)}`], ['Net to client', fmt.money2(r.net)]] },
    formula: 'Fee base = gross minus costs when costs come out first, or the full gross when they come out after. Attorney fee = fee base × fee percentage. Net to client = gross − fee − costs − liens.',
    summary: [`Gross ${fmt.money2(v.gross)}, fee ${fmt.num(v.feePct, 2)}% with costs taken out ${method} the fee`, `Attorney fee ${fmt.money2(r.fee)}, costs ${fmt.money2(r.costs)}, liens ${fmt.money2(r.liens)}`, `Net to client ${fmt.money2(r.net)}`],
    results: { r, other }
  };
}

export const EXAMPLE = { gross: 100000, feePct: 33.33, method: 'before', costs: 5000, liens: 10000 };

export const fmt = {
  money: x => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(x),
  money2: x => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x),
  num: (x, d = 1) => new Intl.NumberFormat('en-US', { maximumFractionDigits: d }).format(x),
  pct: (x, d = 2) => `${new Intl.NumberFormat('en-US', { maximumFractionDigits: d }).format(x)}%`
};

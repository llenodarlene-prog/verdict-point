// Law firm payment processing fee model. Pure functions with no DOM access, so tests can import them directly.
// Rates are entered by the user from their own processor agreement; the model never supplies a rate.

export const GROUPS = [
  { legend: 'Card Payments', icon: 'receipt-2', fields: [
    { key: 'cardVolume', label: 'Monthly card volume ($)', help: 'Total charged to credit and debit cards in a month.', type: 'money' },
    { key: 'cardCount', label: 'Number of card payments', help: 'Used for the fixed per-transaction fee.', type: 'int', min: 0, max: 1000000 },
    { key: 'cardRate', label: 'Card rate (%)', help: 'The percentage from your processor agreement.', type: 'pct' },
    { key: 'cardFixed', label: 'Fixed fee per card payment ($)', help: 'Enter 0 if your plan has none.', type: 'money', optional: true }
  ] },
  { legend: 'eCheck Payments', icon: 'wallet', optional: true, fields: [
    { key: 'achVolume', label: 'Monthly eCheck volume ($)', help: 'Bank transfers from clients. Enter 0 if none.', type: 'money', optional: true },
    { key: 'achCount', label: 'Number of eCheck payments', help: '', type: 'int', min: 0, max: 1000000, optional: true },
    { key: 'achRate', label: 'eCheck rate (%)', help: '', type: 'pct', optional: true },
    { key: 'achFixed', label: 'Fixed fee per eCheck ($)', help: '', type: 'money', optional: true }
  ] },
  { legend: 'Plan and Scenario', icon: 'adjustments', fields: [
    { key: 'monthlyFee', label: 'Monthly platform fee ($)', help: 'Subscription or account fee. Enter 0 if none.', type: 'money', optional: true },
    { key: 'shift', label: 'Share of card volume moved to eCheck (%)', help: 'Tests what happens if more clients pay by bank transfer.', type: 'pct', optional: true }
  ] }
];

export function fees(v, shift = 0) {
  const moved = (v.cardVolume || 0) * shift / 100;
  const movedCount = (v.cardCount || 0) * shift / 100;
  const cardVol = (v.cardVolume || 0) - moved, cardCount = (v.cardCount || 0) - movedCount;
  const achVol = (v.achVolume || 0) + moved, achCount = (v.achCount || 0) + movedCount;
  const card = cardVol * (v.cardRate || 0) / 100 + cardCount * (v.cardFixed || 0);
  const ach = achVol * (v.achRate || 0) / 100 + achCount * (v.achFixed || 0);
  const platform = v.monthlyFee || 0;
  const total = card + ach + platform;
  const volume = cardVol + achVol;
  return { card, ach, platform, total, annual: total * 12, volume, effective: volume > 0 ? total / volume * 100 : null };
}

export function compute(v) {
  if (v.cardVolume === undefined || v.cardCount === undefined || v.cardRate === undefined) return { empty: 'Enter your card volume, number of card payments, and card rate to see your fees.' };
  const now = fees(v);
  const shift = v.shift || 0;
  const alt = shift > 0 ? fees(v, shift) : null;
  const rows = [['Card fees', fmt.money2(now.card)], ['eCheck fees', fmt.money2(now.ach)], ['Platform fee', fmt.money2(now.platform)], ['Total per month', fmt.money2(now.total)], ['Total per year', fmt.money(now.annual)]];
  return {
    headline: { icon: 'receipt-2', label: 'Processing and platform cost per month', value: fmt.money2(now.total) },
    tiles: [
      ['calendar-check', 'Per year', fmt.money(now.annual), 'At the same monthly volume'],
      ['percentage', 'Effective rate', now.effective === null ? 'Not available' : fmt.pct(now.effective), 'Total cost as a share of money collected'],
      ['cash', 'Card fees vs platform fee', now.platform > 0 ? `${fmt.num(now.card / now.platform, 1)}×` : 'No platform fee', 'How many times the subscription the card fees cost'],
      ['trending-up', 'Saving from the eCheck shift', alt ? fmt.money2(now.total - alt.total) : 'Set a shift', alt ? `Per month if ${fmt.num(shift)}% of card volume moves to eCheck` : 'Enter a share to test it']
    ],
    table: { caption: 'Monthly cost breakdown', head: ['Item', 'Amount'], rows: alt ? [...rows, [`Total with ${fmt.num(shift)}% shifted`, fmt.money2(alt.total)]] : rows },
    formula: 'Card fees = card volume × card rate + number of card payments × fixed fee. eCheck fees use the same formula with eCheck figures. Effective rate = total cost ÷ total volume × 100. A shift moves that share of card volume and card payments to eCheck pricing.',
    summary: [`Card fees ${fmt.money2(now.card)}, eCheck fees ${fmt.money2(now.ach)}, platform ${fmt.money2(now.platform)}`, `Total ${fmt.money2(now.total)} a month, ${fmt.money(now.annual)} a year`, ...(alt ? [`With ${fmt.num(shift)}% moved to eCheck: ${fmt.money2(alt.total)} a month`] : [])],
    results: { now, alt }
  };
}

export const EXAMPLE = { cardVolume: 12000, cardCount: 40, cardRate: 2.99, cardFixed: 0.3, achVolume: 8000, achCount: 20, achRate: 1, achFixed: 0, monthlyFee: 19, shift: 25 };

export const fmt = {
  money: x => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(x),
  money2: x => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x),
  num: (x, d = 1) => new Intl.NumberFormat('en-US', { maximumFractionDigits: d }).format(x),
  pct: (x, d = 2) => `${new Intl.NumberFormat('en-US', { maximumFractionDigits: d }).format(x)}%`
};

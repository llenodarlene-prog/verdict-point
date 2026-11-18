// Wrongful termination settlement calculator. Arithmetic on the user's own figures plus federal limits that are
// read from primary law: 42 U.S.C. 1981a(b)(3) caps (compensatory for future pecuniary and nonpecuniary losses
// plus punitive damages, per complaining party, by employer size) and 1981a(b)(2) (back pay and interest excluded
// from those damages). Liquidated damages for intentional age or Equal Pay Act claims equal back pay (EEOC).
// The calculator never predicts an award: every amount is a scenario built from inputs the user types.
export const RULES_VERSION = '2026-11-18';
export const CAPS = Object.freeze([
  { key: '15-100', label: '15 to 100 employees', cap: 50000 },
  { key: '101-200', label: '101 to 200 employees', cap: 100000 },
  { key: '201-500', label: '201 to 500 employees', cap: 200000 },
  { key: '501+', label: 'More than 500 employees', cap: 300000 }
]);
export const CLAIMS = Object.freeze({
  'title-vii': { label: 'Title VII or ADA (federal)', capped: true, liquidated: false },
  'adea-epa': { label: 'Age (ADEA) or Equal Pay Act (federal)', capped: false, liquidated: true, noDamages: true },
  'other': { label: 'State law, contract, or other', capped: false, liquidated: false }
});
const money = n => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const clamp0 = n => Math.max(0, n);

export function compute(v = {}) {
  const pay = v.annualPay, benefits = v.annualBenefits ?? 0, months = v.monthsOut, interim = v.interimEarnings ?? 0;
  if (!(pay > 0) || !(months >= 0)) return { empty: 'Enter your annual pay and the months since your job ended to see a scenario.' };
  const claim = CLAIMS[v.claim] || CLAIMS.other;
  const monthly = (pay + benefits) / 12;
  const lostToDate = monthly * months;
  const backPay = clamp0(lostToDate - interim);
  const frontMonths = v.frontMonths ?? 0;
  const frontPay = clamp0(monthly * frontMonths - (v.futureEarnings ?? 0) * frontMonths);
  const tiles = [], rows = [], notes = [];
  rows.push(['Lost pay and benefits to date', `${money(monthly)} a month × ${months} months`, money(lostToDate)]);
  if (interim) rows.push(['Less earnings from other work since', 'Mitigation offset you entered', `−${money(interim)}`]);
  rows.push(['Back pay', 'Not less than zero', money(backPay)]);
  if (frontMonths) rows.push(['Front pay scenario', `${frontMonths} months of the pay gap you entered`, money(frontPay)]);
  let damages = 0, capNote = '';
  const entered = v.otherDamages ?? 0;
  if (claim.noDamages) { if (entered) notes.push('Compensatory and punitive damages are not available for age or Equal Pay Act claims under the EEOC summary, so the amount you entered is not included.'); }
  else if (claim.capped && entered) {
    const size = CAPS.find(c => c.key === v.employerSize);
    if (!size) return { empty: 'Choose the employer size to apply the federal limit.' };
    damages = Math.min(entered, size.cap);
    capNote = entered > size.cap ? `Limited to ${money(size.cap)} for ${size.label.toLowerCase()} (42 U.S.C. 1981a(b)(3)).` : `Within the ${money(size.cap)} limit for ${size.label.toLowerCase()}.`;
    rows.push(['Compensatory and punitive damages', capNote, money(damages)]);
  } else if (entered) { damages = entered; rows.push(['Other damages you entered', 'No federal limit applied for this claim type', money(damages)]); }
  const liquidated = claim.liquidated && v.willful ? backPay : 0;
  if (liquidated) rows.push(['Liquidated damages', 'Equal to back pay for an intentional violation', money(liquidated)]);
  const gross = backPay + frontPay + damages + liquidated;
  rows.push(['Scenario total before fees', '', money(gross)]);
  const feePct = v.feePct ?? 0;
  const fee = gross * feePct / 100;
  if (feePct) rows.push(['Less attorney fee', `${feePct}% of the total`, `−${money(fee)}`]);
  const net = gross - fee;
  if (feePct) rows.push(['Scenario after fee', 'Before taxes and costs', money(net)]);
  tiles.push(['receipt-2', 'Back pay', money(backPay), interim ? 'After the earnings offset' : 'Lost pay and benefits to date']);
  if (frontMonths) tiles.push(['trending-up', 'Front pay scenario', money(frontPay), `${frontMonths} months`]);
  if (damages) tiles.push(['scale', claim.capped ? 'Capped damages' : 'Other damages', money(damages), capNote || 'As entered']);
  if (liquidated) tiles.push(['scale', 'Liquidated damages', money(liquidated), 'Equal to back pay']);
  if (feePct) tiles.push(['wallet', 'After attorney fee', money(net), `${feePct}% fee`]);
  return {
    headline: { icon: 'scale', label: 'Illustrative scenario total', value: money(gross) },
    tiles, notes,
    formula: 'Back pay = (annual pay + benefits) ÷ 12 × months out − earnings since. Each other line is a figure you entered, limited only where federal law sets a cap.',
    table: { caption: 'How the scenario adds up', head: ['Item', 'Basis', 'Amount'], rows },
    summary: rows.map(r => `${r[0]}: ${r[2]}${r[1] ? ` (${r[1]})` : ''}`).concat(notes)
  };
}
export const EXAMPLE = { annualPay: '62000', annualBenefits: '9000', monthsOut: '8', interimEarnings: '12000', frontMonths: '6', futureEarnings: '1500', claim: 'title-vii', employerSize: '101-200', otherDamages: '150000', feePct: '33' };

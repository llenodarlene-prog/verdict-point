// Law school loan repayment calculator. Arithmetic on the user's own figures: interest that accrues while in school
// (simple interest on each year's borrowing from disbursement until repayment), then a level monthly payment over the
// chosen term. The user enters the interest rate; the tool does not state official federal rates.
export const RULES_VERSION = '2026-11-24';
const money = n => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export function payment(principal, ratePct, years) {
  const n = Math.round(years * 12), r = ratePct / 100 / 12;
  if (!(principal > 0) || !(n > 0)) return 0;
  return r ? principal * r / (1 - Math.pow(1 + r, -n)) : principal / n;
}
export function schoolInterest(perYear, years, ratePct, graceMonths = 6) {
  let interest = 0;
  for (let y = 0; y < years; y++) interest += perYear * ratePct / 100 * ((years - y) + graceMonths / 12);
  return interest;
}
export function compute(v = {}) {
  if (!(v.perYear > 0) || !(v.rate >= 0) || v.rate === undefined) return { empty: 'Enter how much you borrow each year and the interest rate.' };
  const years = v.schoolYears > 0 ? v.schoolYears : 3, borrowed = v.perYear * years;
  const accrued = schoolInterest(v.perYear, years, v.rate);
  const principal = borrowed + accrued, term = v.term > 0 ? v.term : 10, pay = payment(principal, v.rate, term);
  const totalPaid = pay * term * 12, interestTotal = totalPaid - borrowed;
  const rows = [['Total borrowed', `${money(v.perYear)} × ${years} years`, money(borrowed)], ['Interest added before repayment', `Simple interest at ${v.rate}% until 6 months after graduation`, money(accrued)], ['Balance when repayment starts', '', money(principal)], ['Monthly payment', `${term}-year level payment at ${v.rate}%`, money(pay)], ['Total repaid', '', money(totalPaid)], ['Total interest cost', 'Total repaid − borrowed', money(interestTotal)]];
  if (v.salary > 0) rows.push(['Payment as a share of gross monthly salary', `${money(v.salary)} a year`, `${(pay / (v.salary / 12) * 100).toFixed(1)}%`]);
  return { headline: { icon: 'scale', label: 'Estimated monthly payment', value: money(pay) }, tiles: [['receipt-2', 'Balance at repayment', money(principal), 'Including accrued interest'], ['report-money', 'Total interest', money(interestTotal), `${term} years`], ...(v.salary > 0 ? [['chart-bar', 'Share of salary', `${(pay / (v.salary / 12) * 100).toFixed(1)}%`, 'Gross monthly']] : [])],
    notes: ['Check current federal loan rates, fees, and borrowing limits on studentaid.gov before you borrow. Income-driven plans and forgiveness programs can change the monthly payment.'], formula: 'Monthly payment = balance × r ÷ (1 − (1 + r)^−n), where r is the monthly rate and n the number of months.',
    table: { caption: 'Loan math', head: ['Item', 'Basis', 'Amount'], rows }, summary: rows.map(r => `${r[0]}: ${r[2]}`) };
}
export const EXAMPLE = { perYear: '55000', schoolYears: '3', rate: '8', term: '10', salary: '85000' };

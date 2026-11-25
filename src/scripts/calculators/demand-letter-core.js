// Demand letter generator. Assembles a plain-English demand for payment from the user's facts: who is owed, the
// amount, what happened, the deadline (counted from the letter date), and what happens next. It adds no legal claims.
import { clean, fmtDate, packDoc } from './doc-common.js';
import { parseDate, longDate } from './legal-deadline-core.js';
export const RULES_VERSION = '2026-11-24';
const money = n => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
export function compute(v = {}) {
  const from = clean(v.sender), to = clean(v.recipient), facts = clean(v.facts, 400);
  if (!from || !to || !(v.amount > 0) || !facts) return { empty: 'Enter your name, the recipient, the amount owed, and a short description of what happened.' };
  const start = parseDate(v.date), days = Math.min(60, Math.max(7, Math.floor(v.days > 0 ? v.days : 14)));
  const due = start === null ? `within ${days} days of this letter` : `by ${longDate(start + days)}`;
  const next = v.next === 'small-claims' ? 'file a claim in small claims court' : v.next === 'lawyer' ? 'refer this matter to an attorney' : 'pursue the remedies available to me';
  const s = [
    ['Date', fmtDate(v.date)],
    ['To', to],
    ['Re', `Demand for payment of ${money(v.amount)}`],
    ['Opening', `I am writing to formally request payment of ${money(v.amount)} that you owe me.`],
    ['What Happened', facts],
    ['Demand', `Please pay ${money(v.amount)} ${due}. You can pay by ${clean(v.method, 80) || 'check or bank transfer'}.`],
    ['Next Steps', `If I do not receive payment ${due}, I intend to ${next} without further notice. I would prefer to resolve this without that step.`],
    ['Records', 'Please keep all records related to this matter. I have kept copies of the relevant documents and correspondence.'],
    ['Closing', `Sincerely,\n${from}${clean(v.contact, 120) ? `\n${clean(v.contact, 120)}` : ''}`]];
  return packDoc('Demand Letter', s, 'Draft ready', ['Send the letter in a way you can prove, such as certified mail or email with a delivery receipt. Keep the tone factual. If the debt is a consumer debt you are collecting for someone else, federal debt collection rules may apply, so ask a lawyer. Not legal advice.'], `Deadline = letter date + ${days} days.`);
}
export const EXAMPLE = { sender: 'Maria Lopez', recipient: 'Sunrise Property Management, 410 Bay St, Tampa, FL', amount: '1850', facts: 'I moved out of 22B on October 31, 2026, left the unit clean, and returned the keys. My $1,850 security deposit has not been returned and I have received no written list of deductions.', date: '2026-12-01', days: '14', method: 'check mailed to the address below', next: 'small-claims', contact: '88 Palm Ave, Tampa, FL 33602' };

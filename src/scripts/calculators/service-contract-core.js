// Service contract generator. Assembles a plain-English independent contractor services agreement from the user's
// choices: scope, fee structure, payment terms, term and termination, ownership of work, confidentiality, and law.
import { clean, fmtDate, packDoc } from './doc-common.js';
export const RULES_VERSION = '2026-11-24';
const money = n => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
export function compute(v = {}) {
  const c = clean(v.client), p = clean(v.provider);
  if (!c || !p || !clean(v.services, 300)) return { empty: 'Enter the client, the service provider, and a short description of the services.' };
  const fee = v.feeType === 'hourly' ? `${money(v.amount > 0 ? v.amount : 0)} per hour` : v.feeType === 'monthly' ? `${money(v.amount > 0 ? v.amount : 0)} per month` : `a fixed fee of ${money(v.amount > 0 ? v.amount : 0)}`;
  const net = Math.min(90, Math.max(0, Math.floor(v.netDays > 0 ? v.netDays : 30))), notice = Math.min(90, Math.max(0, Math.floor(v.notice > 0 ? v.notice : 14))), law = clean(v.law, 40) || '[state]';
  const ip = v.ip === 'provider' ? `${p} keeps ownership of its work product and grants ${c} a non-exclusive, perpetual license to use the deliverables for its business once paid in full.` : `Once ${c} pays in full, ${p} assigns to ${c} all rights in the deliverables created under this Agreement, except tools and know-how ${p} owned before or developed independently.`;
  const s = [
    ['1. Parties', `This Services Agreement is made on ${fmtDate(v.date)} between ${c} (the "Client") and ${p} (the "Provider").`],
    ['2. Services', `Provider will perform the following services: ${clean(v.services, 300)}. Changes to the scope must be agreed in writing.`],
    ['3. Fees', `Client will pay Provider ${fee}.${v.feeType === 'hourly' ? ' Provider will keep time records and include them with each invoice.' : ''}`],
    ['4. Invoices and Payment', `Provider will invoice ${v.feeType === 'fixed' ? 'on the schedule agreed in writing' : 'monthly'}. Client will pay each invoice within ${net} days. Client will reimburse pre-approved, reasonable expenses.`],
    ['5. Term and Termination', `This Agreement starts on the date above and continues until the services are complete, unless ended earlier. Either party may end it with ${notice} days' written notice. Client will pay for services performed through the end date.`],
    ['6. Independent Contractor', 'Provider is an independent contractor, not an employee. Provider controls how the work is done, supplies its own tools, and is responsible for its own taxes and insurance.'],
    ['7. Ownership of Work', ip],
    ['8. Confidentiality', 'Each party will keep the other\'s non-public information confidential and use it only to perform this Agreement.'],
    ['9. Warranty and Liability', 'Provider will perform the services in a professional manner. Except for breaches of confidentiality or amounts owed, neither party is liable for indirect or consequential damages, and each party\'s total liability is limited to the fees paid under this Agreement in the 12 months before the claim.'],
    ['10. Governing Law', `This Agreement is governed by the laws of ${law}.`],
    ['11. Entire Agreement', 'This is the entire agreement between the parties on this subject. Changes must be in writing and signed by both parties.'],
    ['12. Signatures', `${c}: ____________________  Date: ________\n${p}: ____________________  Date: ________`]];
  return packDoc('Services Agreement', s, 'Draft ready', ['This is a starting draft, not legal advice. Worker classification rules differ by agency and state, and the label in a contract does not decide it. Have a lawyer review the draft before signing.'], 'Built from your choices.');
}
export const EXAMPLE = { client: 'Harbor Dental Group', provider: 'Lumen Web Studio LLC', services: 'design and build a five-page website, with two rounds of revisions', feeType: 'fixed', amount: '6500', netDays: '15', notice: '14', ip: 'client', law: 'Florida', date: '2026-12-01' };

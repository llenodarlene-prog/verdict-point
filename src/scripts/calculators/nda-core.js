// NDA generator. Assembles a plain-English mutual or one-way nondisclosure agreement from the user's choices. When an
// employee or contractor is a party, it adds the whistleblower immunity notice that 18 U.S.C. 1833(b)(3)(A) requires in
// any contract with an employee (including contractors and consultants, (b)(4)) governing trade secrets or confidential
// information; without it the employer may not recover exemplary damages or attorney fees under the DTSA ((b)(3)(C)).
import { clean, fmtDate, packDoc } from './doc-common.js';
export const RULES_VERSION = '18 U.S.C. 1833(b), reviewed 2026-11-24';
export const DTSA_NOTICE = 'Notice of Immunity Under the Defend Trade Secrets Act. An individual shall not be held criminally or civilly liable under any federal or state trade secret law for the disclosure of a trade secret that is made (i) in confidence to a federal, state, or local government official, either directly or indirectly, or to an attorney, and solely for the purpose of reporting or investigating a suspected violation of law; or (ii) in a complaint or other document filed in a lawsuit or other proceeding, if such filing is made under seal. An individual who files a lawsuit for retaliation by an employer for reporting a suspected violation of law may disclose the trade secret to the individual\'s attorney and use the trade secret information in the court proceeding, if the individual files any document containing the trade secret under seal and does not disclose the trade secret, except pursuant to court order.';
export function compute(v = {}) {
  const a = clean(v.partyA), b = clean(v.partyB);
  if (!a || !b) return { empty: 'Enter the names of both parties to draft the agreement.' };
  const mutual = v.type !== 'one-way', years = Math.min(10, Math.max(1, Math.floor(v.years > 0 ? v.years : 2))), law = clean(v.law, 40) || '[state]', purpose = clean(v.purpose, 200) || 'evaluating a possible business relationship';
  const disc = mutual ? 'each party' : a, recv = mutual ? 'each party' : b;
  const s = [
    ['1. Parties', `This Nondisclosure Agreement is made on ${fmtDate(v.date)} between ${a} and ${b}${mutual ? ', each of whom may disclose and receive Confidential Information' : `. ${a} is the Disclosing Party and ${b} is the Receiving Party`}.`],
    ['2. Purpose', `The parties wish to share information for the purpose of ${purpose} (the "Purpose").`],
    ['3. Confidential Information', `"Confidential Information" means non-public business, technical, financial, or personal information disclosed by ${disc} that is marked confidential or that a reasonable person would understand to be confidential.`],
    ['4. Exclusions', 'Confidential Information does not include information that (a) is or becomes public through no fault of the receiving party; (b) the receiving party already knew without a duty of confidence; (c) the receiving party receives from a third party without a duty of confidence; or (d) the receiving party develops independently.'],
    ['5. Obligations', `${recv[0].toUpperCase() + recv.slice(1)} will use Confidential Information only for the Purpose, protect it with at least reasonable care, and share it only with employees, contractors, and advisers who need it for the Purpose and are bound by similar duties.`],
    ['6. Required Disclosure', 'A receiving party may disclose Confidential Information if required by law or court order, after giving prompt notice (where lawful) so the disclosing party can seek protection.'],
    ['7. Term', `The duties in this Agreement last ${years} year${years > 1 ? 's' : ''} from the date above. Duties for any trade secret last for as long as it remains a trade secret under applicable law.`],
    ['8. Return or Destruction', 'On request, the receiving party will return or destroy Confidential Information, except copies kept under a legal or routine backup obligation, which remain confidential.'],
    ['9. No License or Obligation', 'Nothing in this Agreement grants any license or requires either party to enter into any further agreement.'],
    ['10. Remedies', 'Unauthorized disclosure may cause irreparable harm, and the disclosing party may seek injunctive relief in addition to other remedies.'],
    ['11. Governing Law', `This Agreement is governed by the laws of ${law}.`]];
  if (v.employee) s.push(['12. Whistleblower Immunity Notice', DTSA_NOTICE]);
  s.push([`${s.length + 1}. Signatures`, `${a}: ____________________  Date: ________\n${b}: ____________________  Date: ________`]);
  return packDoc(`${mutual ? 'Mutual' : 'One-Way'} Nondisclosure Agreement`, s, 'Draft ready', ['This is a starting draft, not legal advice. Have a lawyer review it, especially for employment use, non-US parties, or highly sensitive information. Some states limit confidentiality terms that cover harassment, discrimination, or wages.'], 'Built from your choices. The whistleblower notice is added when an employee or contractor signs, as 18 U.S.C. 1833(b)(3) requires.');
}
export const EXAMPLE = { partyA: 'Rivera Consulting LLC', partyB: 'Northwind Analytics Inc.', type: 'mutual', purpose: 'evaluating a joint software project', years: '3', law: 'Florida', date: '2026-12-01', employee: false };

// App and website privacy policy generator. Covers each item California Business and Professions Code s. 22575(b)
// requires of a commercial website or online service that collects personally identifiable information (as defined in
// s. 22577(a)) from California consumers: categories collected and shared (b)(1), any review and change process (b)(2),
// how material changes are announced (b)(3), the effective date (b)(4), the response to Do Not Track signals (b)(5),
// and whether other parties collect activity across sites (b)(6). Owner-supplied official copies, reviewed 2026-11-26.
import { clean, fmtDate, packDoc } from './doc-common.js';
export const RULES_VERSION = 'California Business and Professions Code s. 22575 (Stats. 2013, ch. 390) and s. 22577; reviewed 2026-11-26';
export const PII = Object.freeze([['name', 'first and last name'], ['address', 'home or other physical address'], ['email', 'email address'], ['phone', 'telephone number'], ['ids', 'account usernames and other identifiers that let us contact you'], ['usage', 'information about how you use the service, linked to your account'], ['payment', 'payment information, handled by our payment processor']]);
export const SHARE = Object.freeze([['shareProviders', 'service providers that host, support, or operate the service for us'], ['shareAnalytics', 'analytics providers'], ['shareAds', 'advertising partners'], ['shareAffiliates', 'our affiliated companies'], ['shareLegal', 'government authorities or others when required by law or to protect rights and safety']]);
const list = a => a.length < 2 ? (a[0] || '') : `${a.slice(0, -1).join('; ')}; and ${a[a.length - 1]}`;
export function compute(v = {}) {
  const co = clean(v.company), svc = clean(v.service) || co;
  if (!co) return { empty: 'Enter your company name to draft the policy.' };
  const collected = PII.filter(([k]) => v[k]).map(([, l]) => l), shared = SHARE.filter(([k]) => v[k]).map(([, l]) => l);
  if (!collected.length) return { empty: 'Tick at least one type of personal information you collect.' };
  const contact = clean(v.contact, 120) || '[contact email]';
  const dnt = v.dnt === 'honor' ? `When we receive a browser "Do Not Track" signal, we stop collecting information about your online activities over time and across third-party websites or online services.` : v.dnt === 'none' ? 'We do not collect personally identifiable information about your online activities over time and across third-party websites or online services, so Do Not Track signals do not change how we operate.' : 'We do not currently respond to browser "Do Not Track" signals or similar mechanisms.';
  const s = [
    ['Effective Date', `This privacy policy for ${svc} is effective ${fmtDate(v.date)}.`],
    ['Who We Are', `${co} ("we") operates ${svc}. This policy explains what personally identifiable information we collect, how we share it, and the choices you have.`],
    ['Information We Collect', `We collect the following categories of personally identifiable information: ${list(collected)}.`],
    ['How We Use Information', 'We use this information to provide and improve the service, communicate with you, process transactions, keep the service secure, and meet legal obligations.'],
    ['Who We Share It With', shared.length ? `We may share personally identifiable information with these categories of third parties: ${list(shared)}.` : 'We do not share personally identifiable information with third parties.'],
    ['Reviewing and Changing Your Information', v.review ? `You can review and request changes to your personally identifiable information by contacting us at ${contact}${v.review === 'account' ? ' or through your account settings' : ''}.` : `We do not currently offer a process to review or change your information through the service. You may contact us at ${contact} with questions.`],
    ['Do Not Track', dnt],
    ['Tracking by Other Parties', v.thirdParty ? 'Other parties, such as analytics or advertising partners, may collect personally identifiable information about your online activities over time and across different websites when you use our service.' : 'We do not allow other parties to collect personally identifiable information about your online activities over time and across different websites when you use our service.'],
    ['Changes to This Policy', `If we make material changes, we will notify you by ${v.notice === 'email' ? 'email to the address on your account and' : ''} posting the updated policy with a new effective date${v.notice === 'banner' ? ' and a notice on the service' : ''}.`.replace('by  posting', 'by posting')],
    ['Contact Us', `Questions about this policy: ${contact}.`]];
  return packDoc(`${svc} Privacy Policy`, s, 'Draft ready', ['California requires a commercial website or online service that collects personally identifiable information from California residents to "conspicuously post" its policy (Bus. & Prof. Code s. 22575(a)). On a website, link to it from the homepage with a link that includes the word "privacy" (s. 22577(b)). In an app, make it reasonably accessible. Other laws, such as the CCPA, COPPA, or GDPR, may require more. Not legal advice.'], 'Each section answers one requirement of California Business and Professions Code s. 22575(b).');
}
export const EXAMPLE = { company: 'Tidewater Apps LLC', service: 'the FitLog app', date: '2026-12-01', contact: 'privacy@example.com', name: true, email: true, usage: true, payment: true, shareProviders: true, shareAnalytics: true, shareLegal: true, review: 'account', dnt: 'none-respond', thirdParty: true, notice: 'email' };

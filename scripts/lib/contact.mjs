import { escapeHtml } from './content.mjs';

// The address comes from the mailto link in content/pages/contact.md, the same place the release gate checks.
export function contactEmail(body, source) {
  const email = body.match(/mailto:([^)\s"]+@[^)\s"]+)/)?.[1];
  if (!email) throw new Error(`${source}: contact page body must contain a mailto: address`);
  return email;
}

const mailto = (email, subject) => `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

export function renderContact(copy, email) {
  return `
  <section class="contact" aria-labelledby="contact-heading">
    <div class="shell contact-inner">
      <p class="eyebrow">${escapeHtml(copy.eyebrow)}</p>
      <h1 id="contact-heading">${escapeHtml(copy.heading)}</h1>
      <p class="contact-intro">${escapeHtml(copy.intro)}</p>
      <a class="email-card" href="${escapeHtml(mailto(email))}">
        <span class="panel-label">${escapeHtml(copy.email_label)}</span>
        <span class="email-address">${escapeHtml(email)}</span>
      </a>
      <ul class="enquiry-grid">
        ${copy.enquiries.map(type => `<li><a href="${escapeHtml(mailto(email, type))}">${escapeHtml(type)}</a></li>`).join('')}
      </ul>
      <p class="contact-note">${escapeHtml(copy.note)}</p>
    </div>
  </section>`;
}

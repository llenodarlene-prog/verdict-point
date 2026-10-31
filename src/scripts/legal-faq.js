// Legal FAQ hub: instant search, topic filters, and copy-link buttons over server-rendered answers.
// Search text stays in the browser: it is never sent anywhere, stored, or written to the URL.
const root = document.querySelector('[data-faq]');
if (root) init(root);

function init(root) {
  const input = root.querySelector('#faq-q');
  const items = [...root.querySelectorAll('[data-faq-item]')];
  const sections = [...root.querySelectorAll('[data-faq-topic]')];
  const chips = root.querySelector('[data-faq-chips]');
  const countEl = root.querySelector('[data-faq-count]');
  const empty = root.querySelector('[data-faq-empty]');
  const clear = root.querySelector('[data-faq-clear]');
  let topic = '', timer = null;
  chips.hidden = false;

  function apply() {
    const q = input.value.trim().toLowerCase().replace(/\s+/g, ' ');
    const words = q.split(' ').filter(Boolean);
    const scored = items.map(item => {
      const terms = item.dataset.terms, body = item.dataset.body;
      let score = 0;
      if (!words.length) score = 1;
      else if (terms.includes(q)) score = 4;
      else if (words.every(w => terms.includes(w))) score = 3;
      else if (body.includes(q)) score = 2;
      else if (words.every(w => terms.includes(w) || body.includes(w))) score = 1;
      const show = score > 0 && (!topic || item.dataset.topic === topic);
      item.hidden = !show;
      return { item, score: show ? score : 0 };
    });
    // Within each topic, stronger matches move to the top while a search is active.
    for (const section of sections) {
      const inSection = scored.filter(s => s.item.parentElement === section);
      inSection.sort((a, b) => (b.score - a.score) || (Number(a.item.dataset.order) - Number(b.item.dataset.order))).forEach(s => section.append(s.item));
      section.hidden = !inSection.some(s => s.score > 0);
    }
    const shown = scored.filter(s => s.score > 0).length;
    countEl.textContent = words.length || topic ? `${shown} of ${items.length} questions match` : `${items.length} questions`;
    empty.hidden = shown > 0;
    clear.hidden = !(words.length || topic);
  }
  items.forEach((item, i) => { item.dataset.order = String(i); });
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(apply, 150); });
  chips.addEventListener('click', e => {
    const button = e.target.closest('button[data-topic]');
    if (!button) return;
    topic = button.dataset.topic;
    chips.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    apply();
  });
  root.querySelectorAll('[data-topic-card]').forEach(card => card.addEventListener('click', () => {
    if (!topic && !input.value) return;
    topic = ''; input.value = ''; chips.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.topic === ''))); apply();
  }));
  clear.addEventListener('click', () => {
    input.value = ''; topic = '';
    chips.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.topic === '')));
    apply(); input.focus();
  });
  root.addEventListener('click', async e => {
    const button = e.target.closest('[data-faq-copy]');
    if (!button) return;
    const url = `${location.origin}${location.pathname}#${button.dataset.faqCopy}`;
    try { await navigator.clipboard.writeText(url); }
    catch { const area = document.createElement('textarea'); area.value = url; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0'; document.body.append(area); area.select(); document.execCommand('copy'); area.remove(); }
    const label = [...button.childNodes].reverse().find(n => n.nodeType === 3);
    const before = label.nodeValue; label.nodeValue = 'Link copied'; button.classList.add('is-done');
    countEl.textContent = 'Link copied to clipboard.';
    setTimeout(() => { label.nodeValue = before; button.classList.remove('is-done'); apply(); }, 2000);
  });
}

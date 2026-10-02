import { readFile } from 'node:fs/promises';

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
}

export async function readContent(file) {
  const raw = await readFile(file, 'utf8');
  if (!raw.startsWith('---\n')) throw new Error(`${file}: missing front matter`);
  const end = raw.indexOf('\n---\n', 4);
  if (end < 0) throw new Error(`${file}: unclosed front matter`);
  const metadata = {};
  for (const line of raw.slice(4, end).split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const split = line.indexOf(':');
    if (split < 1) throw new Error(`${file}: invalid front matter line: ${line}`);
    const key = line.slice(0, split).trim();
    let value = line.slice(split + 1).trim();
    if (/^(true|false)$/.test(value)) value = value === 'true';
    metadata[key] = value;
  }
  return { metadata, body: raw.slice(end + 5).trim(), raw };
}

function inline(value) {
  let text = escapeHtml(value);
  text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, '<img src="$2" alt="$1" title="$3" loading="lazy">');
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]*)\)/g, '<a href="$2">$1</a>');
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return text;
}

export function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const out = [];
  let paragraph = [];
  let list = null;
  const flushParagraph = () => { if (paragraph.length) { out.push(`<p>${inline(paragraph.join(' '))}</p>`); paragraph = []; } };
  const flushList = () => { if (list) { out.push(`<${list.type}>${list.items.map(item => `<li>${inline(item)}</li>`).join('')}</${list.type}>`); list = null; } };
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    const bullet = line.match(/^[-*]\s+(.+)$/);
    const number = line.match(/^\d+\.\s+(.+)$/);
    const quote = line.match(/^>\s?(.+)$/);
    const table = line.trim().startsWith('|') && lines[index + 1]?.match(/^\s*\|?(?:\s*:?-+:?\s*\|)+/);
    if (table) {
      flushParagraph(); flushList();
      const header = line.split('|').slice(1, -1).map(cell => cell.trim());
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        rows.push(lines[index].split('|').slice(1, -1).map(cell => cell.trim()));
        index += 1;
      }
      index -= 1;
      out.push(`<div class="table-wrap"><table><thead><tr>${header.map(cell => `<th>${inline(cell)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
    } else if (heading) {
      flushParagraph(); flushList(); const level = heading[1].length; out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
    } else if (bullet || number) {
      flushParagraph(); const type = bullet ? 'ul' : 'ol'; if (list && list.type !== type) flushList(); if (!list) list = { type, items: [] }; list.items.push((bullet || number)[1]);
    } else if (quote) {
      flushParagraph(); flushList(); out.push(`<blockquote>${inline(quote[1])}</blockquote>`);
    } else if (!line.trim()) {
      flushParagraph(); flushList();
    } else {
      flushList(); paragraph.push(line.trim());
    }
  }
  flushParagraph(); flushList();
  return out.join('\n');
}

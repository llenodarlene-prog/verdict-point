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

// Options: { chart(json) => html, image({ alt, src, caption }) => html } let the build add rich blocks.
export function markdownToHtml(markdown, options = {}) {
  const lines = markdown.split(/\r?\n/);
  const out = [];
  let paragraph = [];
  let list = null;
  let tableMeta = null;
  const flushParagraph = () => { if (paragraph.length) { out.push(`<p>${inline(paragraph.join(' '))}</p>`); paragraph = []; } };
  const flushList = () => { if (list) { out.push(`<${list.type}>${list.items.map(item => `<li>${inline(item)}</li>`).join('')}</${list.type}>`); list = null; } };
  const cells = row => row.trim().replace(/^\|/, '').replace(/\|\s*$/, '').split('|').map(cell => cell.trim());
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].replace(/\s+$/, '');
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    const bullet = line.match(/^[-*]\s+(.+)$/);
    const number = line.match(/^\d+\.\s+(.+)$/);
    const quote = line.match(/^>\s?(.*)$/);
    const fence = line.match(/^```(\w+)\s*$/);
    // "Table: Caption {.variant}" directly above a table adds a caption and a style variant.
    const caption = line.match(/^Table:\s+(.+?)(?:\s+\{\.([\w-]+)\})?$/);
    const image = line.match(/^!\[([^\]]*)\]\((\/[^)\s]+)(?:\s+"([^"]*)")?\)$/);
    const table = line.trim().startsWith('|') && lines[index + 1]?.match(/^\s*\|?(?:\s*:?-+:?\s*\|)+/);
    if (fence) {
      flushParagraph(); flushList();
      const block = [];
      for (index += 1; index < lines.length && !/^```\s*$/.test(lines[index]); index += 1) block.push(lines[index]);
      if (fence[1] === 'chart' && options.chart) out.push(options.chart(block.join('\n')));
      else out.push(`<pre><code>${escapeHtml(block.join('\n'))}</code></pre>`);
    } else if (caption && lines[index + 1]?.trim().startsWith('|')) {
      flushParagraph(); flushList(); tableMeta = { caption: caption[1], variant: caption[2] };
    } else if (image && options.image) {
      flushParagraph(); flushList(); out.push(options.image({ alt: image[1], src: image[2], caption: image[3] || '' }));
    } else if (table) {
      flushParagraph(); flushList();
      const header = cells(line);
      const align = cells(lines[index + 1]).map(cell => /^:?-+:$/.test(cell) ? 'right' : '');
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].trim().startsWith('|')) { rows.push(cells(lines[index])); index += 1; }
      index -= 1;
      const td = (cell, i, tag) => `<${tag}${align[i] ? ' class="num"' : ''}>${inline(cell)}</${tag}>`;
      const html = `<div class="table-wrap"><table${tableMeta?.variant ? ` class="table--${tableMeta.variant}"` : ''}>${tableMeta ? `<caption>${inline(tableMeta.caption)}</caption>` : ''}<thead><tr>${header.map((cell, i) => td(cell, i, 'th')).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map((cell, i) => td(cell, i, i === 0 && tableMeta?.variant === 'compare' ? 'th' : 'td')).join('')}</tr>`).join('')}</tbody></table></div>`;
      out.push(html);
      tableMeta = null;
    } else if (quote) {
      // Consecutive "> " lines form one callout; a bold first line becomes its title.
      flushParagraph(); flushList();
      const block = [quote[1]];
      while (lines[index + 1]?.match(/^>\s?/)) { index += 1; block.push(lines[index].replace(/^>\s?/, '')); }
      const title = block[0].match(/^\*\*(.+)\*\*$/);
      const body = (title ? block.slice(1) : block).join(' ').trim();
      out.push(title ? `<aside class="callout"><p class="callout-title">${inline(title[1])}</p><p>${inline(body)}</p></aside>` : `<blockquote>${inline(body)}</blockquote>`);
    } else if (heading) {
      flushParagraph(); flushList(); const level = heading[1].length; out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
    } else if (bullet || number) {
      flushParagraph(); const type = bullet ? 'ul' : 'ol'; if (list && list.type !== type) flushList(); if (!list) list = { type, items: [] }; list.items.push((bullet || number)[1]);
    } else if (!line.trim()) {
      flushParagraph(); flushList();
    } else {
      flushList(); paragraph.push(line.trim());
    }
  }
  flushParagraph(); flushList();
  return out.join('\n');
}

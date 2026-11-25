// Shared helpers for the document generators: clean user text and package sections for the standard result layout.
export const clean = (s, max = 120) => String(s ?? '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
export const fmtDate = iso => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); if (!m) return '[date]'; return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toLocaleDateString('en-US', { timeZone: 'UTC', dateStyle: 'long' }); };
export function packDoc(title, sections, label, notes, formula) {
  return { headline: { icon: 'file-description', label, value: title }, tiles: [['list-details', 'Sections', String(sections.length), 'Edit before use']], notes, formula,
    table: { caption: title, head: ['Section', 'Text'], rows: sections }, summary: [title.toUpperCase(), '', ...sections.flatMap(([h, t]) => [h, t, ''])] };
}

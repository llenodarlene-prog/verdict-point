// Law firm name generator. Builds name ideas from the user's own surnames, practice area, and place, then flags each idea
// against two official rules read directly: California Rule of Professional Conduct 7.5 (firm and trade names may not be
// misleading or imply a government or public legal services connection) and Rule 4-7.21 of the Rules Regulating The
// Florida Bar (trade names allowed if not deceptive; no implied government link; no implied partnership that does not exist).
// Deterministic: the same inputs always give the same list. Nothing leaves the browser.
export const RULES_VERSION = 'California RPC 7.5 (eff. 2018-11-01); Rules Regulating The Florida Bar 4-7.21 (Oct 22, 2026); reviewed 2026-11-24';
export const PRACTICES = Object.freeze({ general: '', 'personal-injury': 'Injury', family: 'Family', criminal: 'Defense', estate: 'Estate Planning', immigration: 'Immigration', business: 'Business', employment: 'Employment', bankruptcy: 'Bankruptcy', 'real-estate': 'Real Estate' });
export const ENTITIES = Object.freeze({ none: '', pllc: ', PLLC', pa: ', P.A.', llp: ', LLP', pc: ', P.C.' });
// Words that can suggest a government or public legal services link (CA 7.5(b); FL 4-7.21(b)).
export const RISK_WORDS = ['state', 'county', 'city of', 'federal', 'government', 'public defender', 'legal aid', 'official', 'department', 'bureau', 'commission', 'court', 'national', 'united states', 'u.s.', 'us '];
const cap = s => s.replace(/\s+/g, ' ').trim().split(' ').map(w => w ? w[0].toUpperCase() + w.slice(1) : w).join(' ');

export function parseNames(text) {
  return String(text || '').split(/[,;\n]+/).map(s => cap(s.replace(/[^A-Za-z' .-]/g, ''))).filter(Boolean).slice(0, 3);
}
export function riskFlags(name) {
  const low = ` ${name.toLowerCase()} `;
  return RISK_WORDS.filter(w => low.includes(` ${w.trim()} `) || low.includes(` ${w.trim()},`)).map(w => w.trim());
}

export function generate(v = {}) {
  const names = parseNames(v.surnames);
  const place = cap(String(v.place || '').replace(/[^A-Za-z .'-]/g, '')).slice(0, 40);
  const area = PRACTICES[v.practice] ?? '';
  const solo = v.lawyers !== 'multiple';
  const suffix = ENTITIES[v.entity] ?? '';
  const ideas = [];
  const add = (name, type, notes = []) => {
    const full = name + (suffix && type !== 'Trade name' ? suffix : '');
    if (ideas.some(i => i.name === full)) return;
    const risky = riskFlags(full);
    if (risky.length) notes = [...notes, `Contains "${risky.join('", "')}", which could suggest a government or public legal services link. Both rules bar that.`];
    ideas.push({ name: full, type, notes });
  };
  if (names.length) {
    const [a, b, c] = names;
    add(`${a} Law`, 'Lawyer name');
    add(`${a} Law Firm`, 'Lawyer name');
    add(`Law Office of ${names.length === 1 ? a : names.join(' & ')}`, 'Lawyer name');
    if (area) add(`${a} ${area} Law`, 'Lawyer name');
    if (names.length >= 2) { add(`${a} & ${b}`, 'Lawyer names', solo ? ['Only use two names if both are lawyers practicing in the firm. Florida 4-7.21(f) bars implying a partnership that does not exist.'] : []); add(`${names.join(', ')}`.replace(/, ([^,]*)$/, ' & $1') + ' Law', 'Lawyer names'); }
    if (c) add(`${a}, ${b} & ${c}`, 'Lawyer names');
    add(`${a} & Associates`, 'Lawyer name', solo ? ['Avoid "& Associates" unless the firm has associates. Implying lawyers who are not there can be misleading under CA 7.1 and FL 4-7.21.'] : ['Use only while the firm has associate lawyers.']);
    add(`${a} Legal Group`, 'Lawyer name', solo ? ['"Group" can suggest several lawyers. Consider whether that is accurate for a solo practice.'] : []);
  }
  if (place) {
    add(`${place} ${area || 'Law'}${area ? ' Lawyers' : ' Firm'}`, 'Trade name', ['Florida allows trade names only if not deceptive, and requires the same name on letterhead, signs, fee contracts, and pleadings (4-7.21(c)). Check your state bar rules first.']);
    if (area) add(`${place} ${area} Law Group`, 'Trade name', ['Trade name: confirm your state permits trade names and the name is not misleading.']);
  }
  if (area && !place && !names.length) add(`${area} Law Partners`, 'Trade name', ['"Partners" should be used only if the lawyers really practice as partners (FL 4-7.21(f)).']);
  return { names, place, ideas };
}

export function compute(v = {}) {
  const g = generate(v);
  if (!g.ideas.length) return { empty: 'Enter at least one lawyer surname or a city or region to see name ideas.' };
  const flagged = g.ideas.filter(i => i.notes.length).length;
  const rows = g.ideas.map(i => [i.name, i.type, i.notes.join(' ') || 'No issue flagged by our checks. Still confirm with your state bar.']);
  return {
    headline: { icon: 'sparkles', label: 'Name ideas generated', value: String(g.ideas.length) },
    tiles: [['list-details', 'With a caution', String(flagged), 'Read the note before using'], ['scale', 'Based on lawyer names', String(g.ideas.filter(i => i.type !== 'Trade name').length), 'Usually the safest choice']],
    notes: ['These checks cover only a few rules from California and Florida. Every state bar sets its own naming rules. Also search your state business registry and the USPTO trademark database before you file.'],
    formula: 'Each idea is built from the names, practice area, and place you entered, then checked against California Rule 7.5 and Florida Bar Rule 4-7.21.',
    table: { caption: 'Law firm name ideas', head: ['Name', 'Type', 'Check'], rows },
    summary: rows.map(r => `${r[0]} (${r[1]})`)
  };
}
export const EXAMPLE = { surnames: 'Rivera, Chen', practice: 'family', place: 'Tampa Bay', lawyers: 'multiple', entity: 'pllc' };

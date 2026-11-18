// LSAT score and percentile calculator. Percentiles are LSAC's published "LSAT Percentile Table: 2023-2026 Testing Years"
// (https://www.lsac.org/data-research/data/lsat-percentiles), percent of scores below each scaled score, to hundredths.
// LSAC does not publish one raw-to-scaled conversion: each test form has its own table, so raw scores are converted only
// with a table the user enters from their own practice test. Nothing here estimates a scaled score from a raw score.
export const DATA_VERSION = 'LSAC percentile table, 2023-2024 to 2025-2026 testing years, retrieved 2026-11-18';
export const SCALE = [120, 180];
export const PERCENT_BELOW = Object.freeze(Object.fromEntries(Object.entries({"180": 99.85, "179": 99.74, "178": 99.57, "177": 99.34, "176": 99.08, "175": 98.72, "174": 98.24, "173": 97.59, "172": 96.72, "171": 95.77, "170": 94.48, "169": 93.03, "168": 91.36, "167": 89.53, "166": 87.49, "165": 85.17, "164": 82.75, "163": 80.05, "162": 77.2, "161": 74.22, "160": 71.06, "159": 67.93, "158": 64.48, "157": 61.04, "156": 57.62, "155": 54.03, "154": 50.43, "153": 46.93, "152": 43.37, "151": 39.81, "150": 36.56, "149": 33.24, "148": 30.07, "147": 27.06, "146": 24.2, "145": 21.48, "144": 19.04, "143": 16.73, "142": 14.61, "141": 12.66, "140": 11.0, "139": 9.44, "138": 8.05, "137": 6.89, "136": 5.86, "135": 4.96, "134": 4.22, "133": 3.57, "132": 3.02, "131": 2.54, "130": 2.17, "129": 1.85, "128": 1.58, "127": 1.37, "126": 1.2, "125": 1.04, "124": 0.93, "123": 0.83, "122": 0.76, "121": 0.66, "120": 0.0}).map(([k, v]) => [Number(k), v])));

export function percentileFor(score) {
  if (!Number.isInteger(score) || score < SCALE[0] || score > SCALE[1]) return null;
  return PERCENT_BELOW[score];
}
// Lowest scaled score whose percent-below reaches the target.
export function scoreForPercentile(target) {
  if (!(target >= 0 && target <= 100)) return null;
  for (let s = SCALE[0]; s <= SCALE[1]; s += 1) if (PERCENT_BELOW[s] >= target) return s;
  return null; // No score reaches the target (above the 180 figure).
}
// Parses lines such as "56 170" or "56: 170" or "56-170" into raw -> scaled. Returns { map, errors }.
export function parseConversion(text) {
  const map = new Map(), errors = [];
  String(text || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean).slice(0, 120).forEach((line, i) => {
    const m = line.match(/^(\d{1,3})\s*[:=,\t -]+\s*(\d{3})$/);
    if (!m) { errors.push(`Line ${i + 1}: use "raw score, scaled score", for example "56, 170".`); return; }
    const raw = Number(m[1]), scaled = Number(m[2]);
    if (scaled < SCALE[0] || scaled > SCALE[1]) { errors.push(`Line ${i + 1}: scaled scores run from 120 to 180.`); return; }
    map.set(raw, scaled);
  });
  return { map, errors };
}
const pct = v => `${v.toFixed(2)}%`;

export function compute({ score, target, raw, conversion } = {}) {
  const tiles = [], rows = [], summary = [];
  let headline = null;
  let scaled = Number.isInteger(score) ? score : null, source = 'entered';
  if (raw !== undefined && raw !== null && conversion) {
    const { map, errors } = parseConversion(conversion);
    if (errors.length) return { empty: errors[0] };
    if (!map.has(raw)) return { empty: `Your conversion table has no row for a raw score of ${raw}. Add that row from your practice test.` };
    scaled = map.get(raw); source = 'your table';
    tiles.push(['table', 'Raw score', String(raw), 'Converted with the table you entered']);
  }
  if (scaled !== null) {
    const p = percentileFor(scaled);
    if (p === null) return { empty: 'Enter a scaled score from 120 to 180.' };
    headline = { icon: 'chart-bar', label: `Percentile for ${scaled}`, value: pct(p) };
    tiles.push(['chart-bar', 'Scaled score', String(scaled), source === 'entered' ? 'Entered score' : 'From your conversion table'], ['users', 'Scores below', pct(p), 'Share of 2023-2026 scores lower than this'], ['trending-up', 'Scores at or above', pct(100 - p), 'Includes test takers with the same score']);
    summary.push(`Scaled score: ${scaled}`, `Percent of scores below: ${pct(p)}`);
  }
  if (target !== undefined && target !== null) {
    const s = scoreForPercentile(target);
    const value = s === null ? 'Above the table' : String(s);
    tiles.push(['trending-up', `Score for ${target}th percentile`, value, s === null ? 'No score in the table reaches this percentile' : `Lowest score with at least ${target}% of scores below (${pct(PERCENT_BELOW[s])})`]);
    if (!headline) headline = { icon: 'trending-up', label: `Score needed for the ${target}th percentile`, value };
    summary.push(`Score for ${target}th percentile: ${value}`);
  }
  if (!headline) return { empty: 'Enter a scaled score, a target percentile, or a raw score with your conversion table.' };
  const focus = scaled ?? scoreForPercentile(target) ?? 180;
  for (let s = Math.min(180, focus + 3); s >= Math.max(120, focus - 3); s -= 1) rows.push([String(s), pct(PERCENT_BELOW[s]), s === focus ? 'Your score' : '']);
  return { headline, tiles, rows, summary,
    formula: 'Percentile = share of LSAT scores in the 2023-2024 to 2025-2026 testing years that were lower than the scaled score (LSAC).',
    table: { caption: 'Nearby scores in the LSAC percentile table', head: ['Scaled score', 'Percent below', ''], rows } };
}
export const EXAMPLE = { score: '165', target: '90' };

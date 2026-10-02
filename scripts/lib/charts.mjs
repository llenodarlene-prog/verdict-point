import { escapeHtml } from './content.mjs';

// Renders a ```chart fenced block (JSON) as an accessible inline SVG figure with a data table fallback.
// Spec: { type: 'bar' | 'hbar' | 'grouped', title, labels: [], series: [{ name, values: [] }],
//         prefix?, suffix?, decimals?, caption?, source?, note? }
let chartCount = 0;
export const resetCharts = () => { chartCount = 0; };

const format = (value, { prefix = '', suffix = '', decimals = 0 }) =>
  `${prefix}${Number(value).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;

function niceMax(value) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find(s => s * magnitude >= value / 4) * magnitude;
  return Math.ceil(value / step) * step;
}

function validate(spec) {
  if (!['bar', 'hbar', 'grouped'].includes(spec.type)) throw new Error(`chart: unknown type "${spec.type}"`);
  if (!spec.title || !Array.isArray(spec.labels) || !spec.labels.length) throw new Error('chart: title and labels are required');
  if (!Array.isArray(spec.series) || !spec.series.length) throw new Error(`chart "${spec.title}": series is required`);
  for (const series of spec.series) {
    if (series.values?.length !== spec.labels.length || series.values.some(v => typeof v !== 'number' || !Number.isFinite(v))) {
      throw new Error(`chart "${spec.title}": series "${series.name}" must have one numeric value per label`);
    }
  }
  if (spec.type !== 'grouped' && spec.series.length !== 1) throw new Error(`chart "${spec.title}": ${spec.type} charts take exactly one series`);
}

function verticalBars(spec, id) {
  const width = 720, height = 340, left = 64, right = 16, top = 24, bottom = 64;
  const plotW = width - left - right, plotH = height - top - bottom;
  const groups = spec.labels.length, perGroup = spec.series.length;
  const max = niceMax(Math.max(...spec.series.flatMap(s => s.values)));
  const groupW = plotW / groups, barW = Math.min(64, (groupW * 0.7) / perGroup);
  const step = max / 4;
  const ticks = Array.from({ length: 5 }, (_, i) => step * i);
  // Show only as many decimals as the tick step needs, so labels never repeat.
  const tickDecimals = Number.isInteger(step) ? 0 : Number.isInteger(step * 10) ? 1 : 2;
  const y = v => top + plotH - (v / max) * plotH;
  const grid = ticks.map(t => `<line class="chart-grid" x1="${left}" x2="${width - right}" y1="${y(t)}" y2="${y(t)}"/><text class="chart-axis" x="${left - 8}" y="${y(t) + 4}" text-anchor="end">${escapeHtml(format(t, { ...spec, decimals: tickDecimals }))}</text>`).join('');
  const bars = spec.labels.map((label, g) => {
    const start = left + g * groupW + (groupW - barW * perGroup) / 2;
    const rects = spec.series.map((series, s) => {
      const v = series.values[g], x = start + s * barW;
      return `<rect class="chart-bar chart-series-${s}" x="${x + 2}" y="${y(v)}" width="${barW - 4}" height="${top + plotH - y(v)}" rx="3"><title>${escapeHtml(`${series.name ? `${series.name}, ` : ''}${label}: ${format(v, spec)}`)}</title></rect>` +
        `<text class="chart-value" x="${x + barW / 2}" y="${y(v) - 6}" text-anchor="middle">${escapeHtml(format(v, spec))}</text>`;
    }).join('');
    return `${rects}<text class="chart-label" x="${left + g * groupW + groupW / 2}" y="${height - bottom + 22}" text-anchor="middle">${escapeHtml(label)}</text>`;
  }).join('');
  return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${escapeHtml(spec.title)}</title><desc id="${id}-desc">${escapeHtml(spec.caption || spec.title)}</desc>${grid}<line class="chart-axis-line" x1="${left}" x2="${width - right}" y1="${top + plotH}" y2="${top + plotH}"/>${bars}</svg>`;
}

function horizontalBars(spec, id) {
  const series = spec.series[0];
  const rowH = 46, width = 720, left = 210, right = 96, top = 8;
  const height = top + spec.labels.length * rowH + 8;
  const max = niceMax(Math.max(...series.values));
  const x = v => left + (v / max) * (width - left - right);
  const rows = spec.labels.map((label, i) => {
    const v = series.values[i], cy = top + i * rowH;
    return `<text class="chart-label" x="${left - 12}" y="${cy + rowH / 2 + 4}" text-anchor="end">${escapeHtml(label)}</text>` +
      `<rect class="chart-track" x="${left}" y="${cy + 10}" width="${width - left - right}" height="${rowH - 20}" rx="3"/>` +
      `<rect class="chart-bar chart-series-${i === series.values.indexOf(Math.max(...series.values)) ? 1 : 0}" x="${left}" y="${cy + 10}" width="${Math.max(2, x(v) - left)}" height="${rowH - 20}" rx="3"><title>${escapeHtml(`${label}: ${format(v, spec)}`)}</title></rect>` +
      `<text class="chart-value" x="${x(v) + 8}" y="${cy + rowH / 2 + 4}">${escapeHtml(format(v, spec))}</text>`;
  }).join('');
  return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${escapeHtml(spec.title)}</title><desc id="${id}-desc">${escapeHtml(spec.caption || spec.title)}</desc>${rows}</svg>`;
}

export function renderChart(json) {
  let spec;
  try { spec = JSON.parse(json); } catch (error) { throw new Error(`chart: invalid JSON (${error.message})`); }
  validate(spec);
  const id = `chart-${++chartCount}`;
  const svg = spec.type === 'hbar' ? horizontalBars(spec, id) : verticalBars(spec, id);
  const legend = spec.type === 'grouped'
    ? `<ul class="chart-legend">${spec.series.map((s, i) => `<li><span class="chart-swatch chart-series-${i}"></span>${escapeHtml(s.name)}</li>`).join('')}</ul>` : '';
  const table = `<details class="chart-data"><summary>View chart data</summary><div class="table-wrap"><table><thead><tr><th>${escapeHtml(spec.label_heading || 'Item')}</th>${spec.series.map(s => `<th>${escapeHtml(s.name || 'Value')}</th>`).join('')}</tr></thead><tbody>${spec.labels.map((label, i) => `<tr><td>${escapeHtml(label)}</td>${spec.series.map(s => `<td>${escapeHtml(format(s.values[i], spec))}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>`;
  return `<figure class="chart chart--${spec.type}"><p class="chart-title">${escapeHtml(spec.title)}</p>${legend}<div class="chart-scroll">${svg}</div><figcaption>${spec.caption ? `<span>${escapeHtml(spec.caption)}</span>` : ''}${spec.source ? `<span class="chart-source">Source: ${escapeHtml(spec.source)}</span>` : ''}${spec.note ? `<span class="chart-note">${escapeHtml(spec.note)}</span>` : ''}</figcaption>${table}</figure>`;
}

// Law firm KPI formulas. Pure functions with no DOM access, so tests can import them directly.
// Every ratio returns null when an input is missing or its denominator is zero, so no result is NaN or infinite.

export const MAX = 1e12;
export const FIELDS = {
  totalHours: 'Total work hours', billableHours: 'Billable hours', standardValue: 'Standard value of recorded time',
  billedValue: 'Billed value', collectedValue: 'Collected value', revenue: 'Revenue', expenses: 'Operating expenses',
  lawyers: 'Lawyers or FTEs', leads: 'Leads', consultations: 'Consultations', newMatters: 'New matters', marketingSpend: 'Marketing spend'
};
export const SECTIONS = {
  time: ['totalHours', 'billableHours'],
  billing: ['billableHours', 'standardValue', 'billedValue', 'collectedValue'],
  profit: ['revenue', 'expenses', 'lawyers'],
  intake: ['leads', 'consultations', 'newMatters', 'marketingSpend']
};

export function parseFigure(value) {
  const text = String(value ?? '').trim().replace(/[$,\s]/g, '');
  if (!text) return null;
  if (!/^\d*\.?\d+$/.test(text)) return NaN;
  const n = Number(text);
  return n <= MAX ? n : NaN;
}

const has = v => typeof v === 'number' && Number.isFinite(v);
const ratio = (a, b, scale = 1) => has(a) && has(b) && b > 0 ? a / b * scale : null;

// Each metric: section, label, unit ('percent' | 'money' | 'moneyPerHour'), formula text, inputs used, and value.
export function calculateKpis(f) {
  const m = (section, key, label, unit, formula, inputs, value, definition) => ({ section, key, label, unit, formula, inputs, value, definition });
  return [
    m('time', 'utilization', 'Utilization rate', 'percent', 'Billable hours ÷ total work hours × 100', ['billableHours', 'totalHours'], ratio(f.billableHours, f.totalHours, 100), 'Share of working time recorded as billable.'),
    m('billing', 'realization', 'Realization rate', 'percent', 'Billed value ÷ standard value × 100', ['billedValue', 'standardValue'], ratio(f.billedValue, f.standardValue, 100), 'Share of the standard value of recorded time that is billed.'),
    m('billing', 'collection', 'Collection rate', 'percent', 'Collected value ÷ billed value × 100', ['collectedValue', 'billedValue'], ratio(f.collectedValue, f.billedValue, 100), 'Share of billed value that is collected.'),
    m('billing', 'yield', 'Overall billing yield', 'percent', 'Collected value ÷ standard value × 100', ['collectedValue', 'standardValue'], ratio(f.collectedValue, f.standardValue, 100), 'Share of the standard value of recorded time that is collected.'),
    m('billing', 'effectiveRate', 'Effective collected rate', 'moneyPerHour', 'Collected value ÷ billable hours', ['collectedValue', 'billableHours'], ratio(f.collectedValue, f.billableHours), 'Cash collected for each billable hour recorded.'),
    m('profit', 'margin', 'Operating profit margin', 'percent', '(Revenue − operating expenses) ÷ revenue × 100', ['revenue', 'expenses'], has(f.revenue) && has(f.expenses) && f.revenue > 0 ? (f.revenue - f.expenses) / f.revenue * 100 : null, 'Share of revenue left after operating expenses.'),
    m('profit', 'profit', 'Operating profit', 'money', 'Revenue − operating expenses', ['revenue', 'expenses'], has(f.revenue) && has(f.expenses) ? f.revenue - f.expenses : null, 'Revenue left after operating expenses, before owner compensation if it is not counted as an expense.'),
    m('profit', 'revenuePerLawyer', 'Revenue per lawyer or FTE', 'money', 'Revenue ÷ lawyers or FTEs', ['revenue', 'lawyers'], ratio(f.revenue, f.lawyers), 'Revenue divided by the headcount measure you choose.'),
    m('intake', 'leadToConsult', 'Lead-to-consultation rate', 'percent', 'Consultations ÷ leads × 100', ['consultations', 'leads'], ratio(f.consultations, f.leads, 100), 'Share of leads that become consultations.'),
    m('intake', 'consultToClient', 'Consultation-to-client rate', 'percent', 'New matters ÷ consultations × 100', ['newMatters', 'consultations'], ratio(f.newMatters, f.consultations, 100), 'Share of consultations that become new matters.'),
    m('intake', 'costPerLead', 'Cost per lead', 'money', 'Marketing spend ÷ leads', ['marketingSpend', 'leads'], ratio(f.marketingSpend, f.leads), 'Marketing spend for each lead.'),
    m('intake', 'cac', 'Client acquisition cost', 'money', 'Marketing spend ÷ new matters', ['marketingSpend', 'newMatters'], ratio(f.marketingSpend, f.newMatters), 'Marketing spend for each new matter.')
  ];
}

// Inputs that cannot be true at the same time, with the field the message belongs to.
export function consistencyErrors(f) {
  const errors = [];
  if (has(f.billableHours) && has(f.totalHours) && f.billableHours > f.totalHours) errors.push(['billableHours', 'Billable hours cannot exceed total work hours.']);
  if (has(f.consultations) && has(f.leads) && f.consultations > f.leads) errors.push(['consultations', 'Consultations cannot exceed leads.']);
  if (has(f.newMatters) && has(f.consultations) && f.newMatters > f.consultations) errors.push(['newMatters', 'New matters cannot exceed consultations. Enter matters that came from consultations.']);
  return errors;
}

export const EXAMPLE = { totalHours: 2000, billableHours: 1500, standardValue: 525000, billedValue: 483000, collectedValue: 458850, revenue: 1200000, expenses: 780000, lawyers: 4, leads: 400, consultations: 120, newMatters: 48, marketingSpend: 36000 };

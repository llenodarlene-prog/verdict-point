// Law firm SEO ROI model. Pure functions with no DOM access, so tests can import them directly.
// Every input is the user's own assumption; the model applies arithmetic only and never supplies a benchmark.

export const MAX = 1e12;
export const SHARED = { monthlyCost: 'Monthly SEO cost', setupCost: 'One-time setup cost', months: 'Months to model', rampMonths: 'Months to reach full traffic', feePerMatter: 'Average fee per new matter', margin: 'Profit margin on fees' };
export const FUNNEL = { visits: 'Monthly organic visits at full traffic', visitToLead: 'Visit-to-lead rate', leadToConsult: 'Lead-to-consultation rate', consultToClient: 'Consultation-to-client rate' };
export const SCENARIOS = ['low', 'base', 'high'];
export const SCENARIO_LABELS = { low: 'Low', base: 'Base', high: 'High' };
export const PERCENT_FIELDS = new Set(['margin', 'visitToLead', 'leadToConsult', 'consultToClient']);
export const LIMITS = { months: [1, 60], rampMonths: [0, 36] };

export function parseFigure(value) {
  const text = String(value ?? '').trim().replace(/[$,%\s]/g, '');
  if (!text) return null;
  if (!/^\d*\.?\d+$/.test(text)) return NaN;
  const n = Number(text);
  return n <= MAX ? n : NaN;
}

// Returns [field, message] pairs for values that are present but out of range.
export function rangeErrors(shared, funnels) {
  const errors = [];
  const whole = (key, [lo, hi]) => { const v = shared[key]; if (v !== undefined && (!Number.isInteger(v) || v < lo || v > hi)) errors.push([key, `Enter a whole number from ${lo} to ${hi}.`]); };
  whole('months', LIMITS.months); whole('rampMonths', LIMITS.rampMonths);
  if (shared.margin !== undefined && shared.margin > 100) errors.push(['margin', 'Enter a margin from 0 to 100 percent.']);
  for (const s of SCENARIOS) for (const key of ['visitToLead', 'leadToConsult', 'consultToClient']) {
    const v = funnels[s]?.[key];
    if (v !== undefined && v > 100) errors.push([`${s}.${key}`, 'Enter a rate from 0 to 100 percent.']);
  }
  return errors;
}

// Traffic grows in a straight line to full volume over rampMonths, then holds. Fees are counted in the month a client signs.
export function modelScenario(shared, funnel) {
  const { monthlyCost, setupCost = 0, months, rampMonths = 0, feePerMatter, margin } = shared;
  const fullClients = funnel.visits * funnel.visitToLead / 100 * funnel.leadToConsult / 100 * funnel.consultToClient / 100;
  const profitPerClient = feePerMatter * margin / 100;
  const rows = [];
  let cost = 0, contribution = 0, clients = 0, leads = 0, consults = 0, revenue = 0, payback = null;
  for (let m = 1; m <= months; m++) {
    const ramp = rampMonths > 0 ? Math.min(m / rampMonths, 1) : 1;
    const monthLeads = funnel.visits * ramp * funnel.visitToLead / 100;
    const monthClients = fullClients * ramp;
    leads += monthLeads; consults += monthLeads * funnel.leadToConsult / 100; clients += monthClients;
    revenue += monthClients * feePerMatter; contribution += monthClients * profitPerClient;
    cost += monthlyCost + (m === 1 ? setupCost : 0);
    if (payback === null && cost > 0 && contribution >= cost) payback = m;
    rows.push({ month: m, ramp, clients: monthClients, cumulativeCost: cost, cumulativeProfit: contribution, net: contribution - cost });
  }
  return {
    leads, consults, clients, revenue, profit: contribution, cost, net: contribution - cost,
    roi: cost > 0 ? (contribution - cost) / cost * 100 : null,
    paybackMonth: payback,
    breakEvenClients: profitPerClient > 0 ? cost / profitPerClient : null,
    costPerClient: clients > 0 ? cost / clients : null,
    rows
  };
}

export const EXAMPLE = {
  shared: { monthlyCost: 3000, setupCost: 2000, months: 12, rampMonths: 6, feePerMatter: 4500, margin: 60 },
  funnels: {
    low: { visits: 600, visitToLead: 2, leadToConsult: 30, consultToClient: 25 },
    base: { visits: 1200, visitToLead: 3, leadToConsult: 35, consultToClient: 30 },
    high: { visits: 2000, visitToLead: 4, leadToConsult: 40, consultToClient: 35 }
  }
};

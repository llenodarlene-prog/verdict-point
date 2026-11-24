// EEOC settlement calculator. Two parts, both from primary sources:
// 1. Charge filing deadline, from EEOC "Time Limits For Filing A Charge": 180 calendar days from the discrimination,
//    extended to 300 days where a state or local agency enforces a law on the same basis; for age, only a state law and
//    state agency extend it; a deadline on a weekend or holiday moves to the next business day.
// 2. A damages scenario that reuses the wrongful termination engine: 42 U.S.C. 1981a(b)(3) caps by employer size and
//    EEOC liquidated damages equal to back pay for intentional age or Equal Pay Act violations.
import { compute as scenario, CAPS, CLAIMS } from './wrongful-termination-core.js';
import { parseDate, calculateDeadline, longDate } from './legal-deadline-core.js';
export { CAPS, CLAIMS };
export const RULES_VERSION = 'EEOC time limits, remedies, and filing a lawsuit pages; 42 U.S.C. 1981a; reviewed 2026-11-24';
export const AGENCY = Object.freeze({ none: 'No state or local agency', state: 'State agency enforces a similar law', local: 'Only a local agency' });

export function chargeDays(claim, agency) {
  if (claim === 'adea-epa') return agency === 'state' ? 300 : 180;
  return agency === 'state' || agency === 'local' ? 300 : 180;
}
export function chargeDeadline(incidentText, claim, agency) {
  const start = parseDate(incidentText);
  if (start === null) return null;
  const days = chargeDays(claim, agency);
  const r = calculateDeadline({ start, days, mode: 'calendar', adjust: 'roll', holidays: true });
  return { days, deadline: r.deadline, rolled: r.rolled, text: longDate(r.deadline) };
}

export function compute(v = {}) {
  const base = scenario(v);
  const d = v.incident ? chargeDeadline(v.incident, v.claim, v.agency) : null;
  if (v.incident && !d) return { empty: 'Enter the date of the discrimination as YYYY-MM-DD, or leave it blank.' };
  if (base.empty && !d) return { empty: 'Enter the date of the discrimination to see the charge deadline, or your pay and months out to see a damages scenario.' };
  const deadlineRows = d ? [['EEOC charge filing deadline', `${d.days} calendar days from ${longDate(parseDate(v.incident))}${d.rolled ? ', moved to the next business day' : ''}`, d.text]] : [];
  const notes = [];
  if (d) notes.push(v.claim === 'adea-epa' ? 'Equal Pay Act claims do not need an EEOC charge: you can sue within two years of the last discriminatory paycheck, or three years if willful. Age claims use the charge deadline shown.' : 'After you receive a Notice of Right to Sue, the EEOC says you must file your lawsuit within 90 days. Federal employees use a different process and generally must contact an agency EEO counselor within 45 days.');
  if (base.empty) {
    return {
      headline: { icon: 'calendar-event', label: 'EEOC charge filing deadline', value: d.text },
      tiles: [['calendar-event', 'Days allowed', `${d.days}`, AGENCY[v.agency] || AGENCY.none]],
      notes, formula: 'EEOC: 180 calendar days from the discrimination, or 300 days where a state or local agency enforces a similar law (for age, only a state law and agency). Weekends and holidays count, but a deadline on one moves to the next business day.',
      table: { caption: 'Deadline', head: ['Item', 'Basis', 'Date'], rows: deadlineRows }, summary: deadlineRows.map(r => `${r[0]}: ${r[2]}`).concat(notes)
    };
  }
  if (d) { base.tiles.unshift(['calendar-event', 'Charge deadline', d.text, `${d.days} days`]); base.table.rows.unshift(deadlineRows[0]); base.summary.unshift(`${deadlineRows[0][0]}: ${d.text}`); }
  base.notes = [...notes, ...(base.notes || [])];
  return base;
}
export const EXAMPLE = { incident: '2026-06-15', agency: 'state', annualPay: '62000', annualBenefits: '9000', monthsOut: '5', interimEarnings: '6000', frontMonths: '', futureEarnings: '', claim: 'title-vii', employerSize: '101-200', otherDamages: '150000', feePct: '' };

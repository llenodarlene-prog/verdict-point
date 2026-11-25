// Personal injury settlement calculator, with a knee injury mode. Reuses the car accident engine (itemized losses, a
// user-chosen non-economic figure, shared fault, policy limit, fees, costs, liens). Florida option applies 2026 Florida
// Statutes s. 768.81(6): a party found greater than 50 percent at fault for their own harm may not recover, except in
// medical negligence actions under chapter 766. No multiplier and no outcome prediction.
import { compute as base } from './car-accident-core.js';
export const RULES_VERSION = 'Florida Statutes 2026, s. 768.81 and s. 95.11; reviewed 2026-11-24';
export function compute(v = {}) {
  const r = base({ ...v, property: v.property });
  if (r.empty) return r;
  const fault = Math.min(100, v.faultPct > 0 ? v.faultPct : 0);
  if (v.state === 'florida' && fault > 50 && !v.medNeg) {
    return { headline: { icon: 'scale', label: 'Florida recovery at this fault share', value: '$0' }, tiles: [['chart-bar', 'Your share of fault', `${fault}%`, 'More than 50%']],
      notes: ['Florida s. 768.81(6) says a party found greater than 50 percent at fault for their own harm may not recover any damages. The rule does not apply to medical negligence claims under chapter 766.'],
      formula: 'Florida modified comparative fault: recovery is reduced by your share of fault, and barred above 50%.', table: { caption: 'Florida fault rule', head: ['Item', 'Basis', 'Amount'], rows: [['Recovery', 's. 768.81(6)', '$0']] }, summary: ['Florida recovery at this fault share: $0 (s. 768.81(6))'] };
  }
  const notes = [...(r.notes || [])];
  if (v.state === 'florida') notes.unshift('Florida reduces recovery by your share of fault and bars it above 50% (s. 768.81). Most negligence claims must be filed within two years (s. 95.11(5)(a)).');
  if (v.injury === 'knee') notes.push('Knee injuries often involve future care, such as physical therapy, injections, or surgery. Use the future medical field for any costs your doctor has estimated, and keep the records that support them.');
  return { ...r, notes };
}
export const EXAMPLE = { injury: 'knee', state: 'florida', medical: '24000', futureMedical: '18000', lostWages: '9500', futureWages: '', property: '', otherCosts: '800', nonEconomic: '40000', faultPct: '10', policyLimit: '', feePct: '33', caseCosts: '2500', liens: '8000' };

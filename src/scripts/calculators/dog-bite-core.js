// Dog bite settlement calculator. Itemized scenario from the user's own figures (car accident engine), with Florida
// 2026 s. 767.04: the owner is liable regardless of the dog's former viciousness; the bitten person's negligence reduces
// the owner's liability by that percentage; a prominently displayed "Bad Dog" sign bars liability except for a person
// under 6 or where the owner's negligence caused the damages. No multiplier and no outcome prediction.
import { compute as base } from './car-accident-core.js';
export const RULES_VERSION = 'Florida Statutes 2026, s. 767.04 and s. 95.11; reviewed 2026-11-24';
export function compute(v = {}) {
  const r = base({ ...v, property: 0 });
  if (r.empty) return r;
  if (v.state === 'florida' && v.sign && !v.under6 && !v.ownerNeg) {
    return { headline: { icon: 'scale', label: 'Florida strict liability with a "Bad Dog" sign', value: '$0' }, tiles: [],
      notes: ['Florida s. 767.04 says the owner is not liable if a "Bad Dog" sign was prominently displayed, unless the person bitten was under 6 or the owner\'s negligence caused the damages. A negligence claim may still be possible, so ask a lawyer.'],
      formula: 'Florida s. 767.04 sign exception.', table: { caption: 'Florida dog bite rule', head: ['Item', 'Basis', 'Amount'], rows: [['Strict liability recovery', 's. 767.04 sign exception', '$0']] }, summary: ['Florida strict liability with a "Bad Dog" sign: $0 (s. 767.04)'] };
  }
  const notes = [...(r.notes || [])].filter(n => !n.startsWith('States have different rules'));
  if (v.state === 'florida') notes.unshift('Florida makes the owner liable regardless of the dog\'s past behavior, and reduces that liability by the bitten person\'s share of negligence (s. 767.04). Negligence claims generally must be filed within two years (s. 95.11(5)(a)).');
  else notes.unshift('States differ: some use strict liability for dog bites and others require proof the owner knew the dog was dangerous. Check your state\'s rule.');
  return { ...r, notes };
}
export const EXAMPLE = { state: 'florida', medical: '6200', futureMedical: '3500', lostWages: '1200', otherCosts: '300', nonEconomic: '15000', faultPct: '', sign: false, under6: false, ownerNeg: false, policyLimit: '', feePct: '33', caseCosts: '500', liens: '2000' };

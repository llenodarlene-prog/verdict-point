import test from 'node:test';
import assert from 'node:assert/strict';
import { compute } from '../src/scripts/calculators/car-accident-core.js';
const amt = (r, l) => r.table.rows.find(x => x[0] === l)?.[2];
test('itemized losses, fault reduction, and net', () => {
  const r = compute({ medical: 10000, lostWages: 5000, nonEconomic: 5000, faultPct: 25, feePct: 33, liens: 2000 });
  assert.equal(amt(r, 'Economic losses'), '$15,000');
  assert.equal(r.headline.value, '$15,000');
  assert.equal(amt(r, 'Less attorney fee'), '−$4,950');
  assert.equal(amt(r, 'Net to you in this scenario'), '$8,050');
});
test('policy limit caps the recovery; no multiplier is applied', () => {
  const r = compute({ medical: 80000, policyLimit: 25000 });
  assert.equal(r.headline.value, '$25,000');
  assert.equal(compute({ medical: 1000 }).headline.value, '$1,000');
});
test('negative net warns; empty input asks for losses', () => {
  const r = compute({ medical: 1000, liens: 5000 });
  assert.match(amt(r, 'Net to you in this scenario'), /-|−/);
  assert.ok(r.notes.length);
  assert.ok(compute({}).empty);
  assert.equal(compute({ medical: 1000, faultPct: 150 }).headline.value, '$0');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { compute, CAPS } from '../src/scripts/calculators/wrongful-termination-core.js';
const amt = (r, label) => r.table.rows.find(x => x[0] === label)?.[2];

test('caps match 42 U.S.C. 1981a(b)(3)', () => {
  assert.deepEqual(CAPS.map(c => c.cap), [50000, 100000, 200000, 300000]);
});
test('back pay subtracts interim earnings and never goes negative', () => {
  const r = compute({ annualPay: 60000, annualBenefits: 0, monthsOut: 6, interimEarnings: 10000 });
  assert.equal(amt(r, 'Back pay'), '$20,000');
  assert.equal(amt(compute({ annualPay: 12000, monthsOut: 1, interimEarnings: 5000 }), 'Back pay'), '$0');
});
test('Title VII damages are capped by employer size; back pay is outside the cap', () => {
  const r = compute({ annualPay: 120000, monthsOut: 12, claim: 'title-vii', employerSize: '15-100', otherDamages: 200000 });
  assert.equal(amt(r, 'Back pay'), '$120,000');
  assert.equal(amt(r, 'Compensatory and punitive damages'), '$50,000');
  assert.equal(r.headline.value, '$170,000');
  assert.match(compute({ annualPay: 1, monthsOut: 1, claim: 'title-vii', otherDamages: 5 }).empty, /employer size/);
});
test('age and Equal Pay Act: no compensatory damages, liquidated equals back pay when intentional', () => {
  const r = compute({ annualPay: 48000, monthsOut: 5, claim: 'adea-epa', willful: true, otherDamages: 90000 });
  assert.equal(amt(r, 'Liquidated damages'), '$20,000');
  assert.equal(r.headline.value, '$40,000');
  assert.ok(r.notes.length);
});
test('fee and front pay arithmetic', () => {
  const r = compute({ annualPay: 60000, monthsOut: 0, frontMonths: 6, futureEarnings: 1000, feePct: 40 });
  assert.equal(amt(r, 'Front pay scenario'), '$24,000');
  assert.equal(amt(r, 'Scenario after fee'), '$14,400');
  assert.ok(compute({}).empty);
});

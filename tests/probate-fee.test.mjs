import test from 'node:test';
import assert from 'node:assert/strict';
import { floridaOrdinaryFee, floridaEstateTaxReturnFee, compute } from '../src/scripts/calculators/probate-fee-core.js';
const fee = v => floridaOrdinaryFee(v).total;
test('Florida flat brackets', () => {
  assert.equal(fee(0), 1500); assert.equal(fee(40000), 1500);
  assert.equal(fee(40001), 2250); assert.equal(fee(70000), 2250);
  assert.equal(fee(100000), 3000);
});
test('Florida percentage brackets', () => {
  assert.equal(fee(200000), 3000 + 3000);
  assert.equal(fee(1e6), 3000 + 27000);
  assert.equal(fee(3e6), 30000 + 50000);
  assert.equal(fee(5e6), 80000 + 40000);
  assert.equal(fee(10e6), 120000 + 75000);
  assert.equal(fee(12e6), 195000 + 20000);
});
test('estate tax return fee and compensable value', () => {
  assert.equal(floridaEstateTaxReturnFee(12e6), 50000 + 5000);
  const r = compute({ inventory: 850000, income: 25000 });
  assert.equal(r.headline.value, '$26,250'); // $3,000 + 3% of $775,000
  assert.ok(compute({}).empty);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { floridaTpdRate, compute } from '../src/scripts/calculators/workers-comp-core.js';
test('Florida TPD rate formula and caps', () => {
  assert.equal(floridaTpdRate(1000, 400, 2026), 320);  // 0.8 × (800 − 400)
  assert.equal(floridaTpdRate(1000, 0, 2026), 640);    // 0.8 × 800
  assert.equal(floridaTpdRate(1000, 900, 2026), 0);
  assert.equal(floridaTpdRate(3000, 0, 2026), 1358);   // max
});
test('compute with waiting period and 104-week cap', () => {
  assert.equal(compute({ aww: 1000, year: '2026', ttdWeeks: 8, tpdWeeks: 12, post: 400 }).headline.value, '$9,173.60'); // 8×666.70 + 12×320
  assert.equal(compute({ aww: 1000, year: '2026', ttdWeeks: 2 }).headline.value, '$666.70'); // 14 days: first week unpaid
  assert.equal(compute({ aww: 1000, year: '2026', ttdWeeks: 120 }).headline.value, '$69,336.80'); // 104 × 666.70
  assert.ok(compute({}).empty); assert.ok(compute({ aww: 1000, tpdWeeks: 3 }).empty);
});

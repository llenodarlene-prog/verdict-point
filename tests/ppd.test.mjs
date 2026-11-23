import test from 'node:test';
import assert from 'node:assert/strict';
import { floridaWeeks, floridaTtdRate, floridaIib, compute } from '../src/scripts/calculators/ppd-core.js';
test('Florida weeks per impairment band, s. 440.15(3)(g)', () => {
  assert.equal(floridaWeeks(0), 0); assert.equal(floridaWeeks(1), 2); assert.equal(floridaWeeks(10), 20);
  assert.equal(floridaWeeks(11), 23); assert.equal(floridaWeeks(15), 35); assert.equal(floridaWeeks(16), 39);
  assert.equal(floridaWeeks(20), 55); assert.equal(floridaWeeks(21), 61); assert.equal(floridaWeeks(12.9), 26);
});
test('TTD and IIB rates with maximum and minimum', () => {
  assert.equal(floridaTtdRate(1200, 2026), 800.04);
  assert.equal(floridaIib(1200, 2026), 600.03);
  assert.equal(floridaTtdRate(3000, 2026), 1358); assert.equal(floridaIib(3000, 2026), 1018.5);
  assert.equal(floridaTtdRate(3000, 2025), 1295);
  assert.equal(floridaTtdRate(15, 2026), 15); assert.equal(floridaTtdRate(25, 2026), 20);
});
test('compute totals and 50 percent weeks', () => {
  assert.equal(compute({ aww: 1200, rating: 12, year: '2026' }).headline.value, '$15,600.78'); // 26 × 600.03
  assert.equal(compute({ aww: 1200, rating: 12, year: '2026', workWeeks: 10 }).headline.value, '$12,600.63'); // 16 × 600.03 + 10 × 300.015
  assert.ok(compute({}).empty); assert.ok(compute({ aww: 1000 }).empty); assert.ok(compute({ aww: 1000, rating: 150 }).empty);
});

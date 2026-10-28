import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateKpis, consistencyErrors, parseFigure, EXAMPLE } from '../src/scripts/calculators/law-firm-kpi-core.js';

const value = (figures, key) => calculateKpis(figures).find(k => k.key === key).value;

test('example figures produce the documented results', () => {
  assert.equal(value(EXAMPLE, 'utilization'), 75);
  assert.equal(value(EXAMPLE, 'realization'), 92);
  assert.equal(value(EXAMPLE, 'collection'), 95);
  assert.equal(value(EXAMPLE, 'yield').toFixed(1), '87.4');
  assert.equal(value(EXAMPLE, 'effectiveRate'), 305.9);
  assert.equal(value(EXAMPLE, 'margin'), 35);
  assert.equal(value(EXAMPLE, 'profit'), 420000);
  assert.equal(value(EXAMPLE, 'revenuePerLawyer'), 300000);
  assert.equal(value(EXAMPLE, 'leadToConsult'), 30);
  assert.equal(value(EXAMPLE, 'consultToClient'), 40);
  assert.equal(value(EXAMPLE, 'costPerLead'), 90);
  assert.equal(value(EXAMPLE, 'cac'), 750);
});

test('missing inputs and zero denominators return null, never NaN or Infinity', () => {
  for (const k of calculateKpis({})) assert.equal(k.value, null, k.key);
  const zeros = Object.fromEntries(Object.keys(EXAMPLE).map(key => [key, 0]));
  for (const k of calculateKpis(zeros)) assert.ok(k.value === null || k.value === 0, k.key);
  assert.equal(value({ revenue: 100, expenses: 150 }, 'margin'), -50);
});

test('inconsistent inputs are flagged', () => {
  assert.deepEqual(consistencyErrors({ totalHours: 40, billableHours: 45 }).map(e => e[0]), ['billableHours']);
  assert.deepEqual(consistencyErrors(EXAMPLE), []);
});

test('figures parse strictly', () => {
  assert.equal(parseFigure('$1,200,000'), 1200000);
  assert.equal(parseFigure(''), null);
  assert.ok(Number.isNaN(parseFigure('-5')));
  assert.ok(Number.isNaN(parseFigure('1e20')));
});

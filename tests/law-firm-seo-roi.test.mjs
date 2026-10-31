import test from 'node:test';
import assert from 'node:assert/strict';
import { modelScenario, rangeErrors, parseFigure, EXAMPLE } from '../src/scripts/calculators/law-firm-seo-roi-core.js';

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);

test('base example produces the documented results', () => {
  const r = modelScenario(EXAMPLE.shared, EXAMPLE.funnels.base);
  close(r.clients, 35.91);
  close(r.revenue, 161595);
  close(r.profit, 96957);
  assert.equal(r.cost, 38000);
  assert.equal(r.roi.toFixed(1), '155.2');
  assert.equal(r.paybackMonth, 4);
  assert.equal(r.breakEvenClients.toFixed(2), '14.07');
  assert.equal(r.rows.length, 12);
});

test('low example never pays back within the period', () => {
  const r = modelScenario(EXAMPLE.shared, EXAMPLE.funnels.low);
  assert.equal(r.paybackMonth, null);
  assert.ok(r.roi < 0);
});

test('no ramp means full traffic from month one', () => {
  const r = modelScenario({ ...EXAMPLE.shared, rampMonths: 0, months: 1 }, EXAMPLE.funnels.base);
  close(r.clients, 3.78);
});

test('zero fee or zero margin gives no break-even figure instead of Infinity', () => {
  assert.equal(modelScenario({ ...EXAMPLE.shared, margin: 0 }, EXAMPLE.funnels.base).breakEvenClients, null);
  const free = modelScenario({ ...EXAMPLE.shared, monthlyCost: 0, setupCost: 0 }, EXAMPLE.funnels.base);
  assert.equal(free.roi, null); assert.equal(free.paybackMonth, null);
});

test('inputs are parsed and range-checked', () => {
  assert.equal(parseFigure('$3,000'), 3000);
  assert.equal(parseFigure('35%'), 35);
  assert.ok(Number.isNaN(parseFigure('-4')));
  assert.equal(parseFigure(''), null);
  assert.deepEqual(rangeErrors({ months: 0, rampMonths: 2.5, margin: 120 }, { base: { visitToLead: 150 } }).map(e => e[0]), ['months', 'rampMonths', 'margin', 'base.visitToLead']);
});

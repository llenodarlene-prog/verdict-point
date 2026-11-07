import test from 'node:test';
import assert from 'node:assert/strict';
import * as software from '../src/scripts/calculators/legal-software-cost-core.js';
import * as payments from '../src/scripts/calculators/payment-processing-fee-core.js';
import * as discovery from '../src/scripts/calculators/ediscovery-cost-core.js';
import * as contingency from '../src/scripts/calculators/contingency-fee-core.js';

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);

test('software example matches the documented totals', () => {
  const r = software.compute(software.EXAMPLE).results;
  assert.equal(r.a.total, 7020); assert.equal(r.b.total, 10320); assert.equal(r.c.total, 11660);
  assert.equal(r.c.monthly, 310);
  assert.match(software.compute(software.EXAMPLE).headline.value, /Option A/);
});

test('software needs users, months, and one price', () => {
  assert.ok(software.compute({}).empty);
  assert.ok(software.compute({ users: 5, months: 12 }).empty);
});

test('payment example matches the documented totals', () => {
  const { now, alt } = payments.compute(payments.EXAMPLE).results;
  close(now.card, 370.8); close(now.total, 469.8); close(alt.total, 407.1);
  close(now.effective, 2.349);
});

test('ediscovery example matches the documented totals', () => {
  const r = discovery.compute(discovery.EXAMPLE).results;
  close(r.gb.total, 4250); close(r.user.total, 5400); close(r.tier.total, 3600);
  close(discovery.models({ ...discovery.EXAMPLE, cull: 0 }).gb.total, 5750);
});

test('contingency example matches the documented totals for both methods', () => {
  const { r, other } = contingency.compute(contingency.EXAMPLE).results;
  close(r.fee, 31663.5); close(r.net, 53336.5); close(other.net, 51670);
  assert.equal(contingency.breakdown({ gross: 0, feePct: 30 }).netShare, null);
});

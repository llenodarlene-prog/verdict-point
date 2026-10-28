import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDate, isoDate, anniversary, calculateJudgmentInterest, parseInterestState, serializeInterestState } from '../src/scripts/calculators/judgment-interest-core.js';

const run = (entered, paid, extra = {}) => calculateJudgmentInterest({ principal: 100000, ratePercent: 5, judgmentDate: parseDate(entered), paymentDate: parseDate(paid), ...extra });

test('one full year accrues simple interest', () => {
  const r = run('2026-01-01', '2027-01-01');
  assert.equal(r.days, 365);
  assert.equal(r.interest, 5000);
  assert.equal(r.total, 105000);
});

test('interest compounds on each anniversary', () => {
  assert.equal(run('2026-01-01', '2028-01-01').interest, 10250);
  const partial = run('2026-01-01', '2027-02-05');
  assert.equal(partial.days, 400);
  assert.equal(partial.interest.toFixed(2), '5503.42');
  assert.equal(partial.periods.length, 2);
  assert.equal(partial.dailyInterest.toFixed(2), '14.38');
});

test('day-count basis changes leap-year results', () => {
  assert.equal(run('2027-03-01', '2028-03-01').interest.toFixed(2), '5013.70');
  assert.equal(run('2027-03-01', '2028-03-01', { basis: 'actual' }).interest.toFixed(2), '5000.00');
});

test('edge cases stay finite', () => {
  assert.equal(run('2026-05-01', '2026-05-01').interest, 0);
  assert.equal(calculateJudgmentInterest({ principal: 1000, ratePercent: 0, judgmentDate: parseDate('2026-01-01'), paymentDate: parseDate('2030-01-01') }).interest, 0);
  assert.equal(isoDate(anniversary(parseDate('2028-02-29'), 1)), '2029-02-28');
  assert.equal(parseDate('2026-02-30'), null);
});

test('share state is allow-listed', () => {
  assert.deepEqual(parseInterestState(new URLSearchParams('amount=100,000&rate=4.28&entered=2026-01-15&paid=2026-10-28&basis=actual&party=Acme')), { amount: 100000, rate: 4.28, entered: '2026-01-15', paid: '2026-10-28', basis: 'actual' });
  assert.deepEqual(parseInterestState(new URLSearchParams('amount=-5&rate=99&entered=2026-13-01&basis=360')), {});
  assert.equal(serializeInterestState({ amount: '2500', rate: '4.1', entered: '2026-01-15', paid: '', basis: '365', note: 'x' }), 'amount=2500&rate=4.1&entered=2026-01-15&basis=365');
});

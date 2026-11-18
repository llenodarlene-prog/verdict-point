import test from 'node:test';
import assert from 'node:assert/strict';
import { PERCENT_BELOW, percentileFor, scoreForPercentile, parseConversion, compute } from '../src/scripts/calculators/lsat-score-core.js';

test('percentile table covers 120 to 180 and rises with score', () => {
  assert.equal(Object.keys(PERCENT_BELOW).length, 61);
  for (let s = 121; s <= 180; s += 1) assert.ok(PERCENT_BELOW[s] >= PERCENT_BELOW[s - 1], `non-decreasing at ${s}`);
  // Spot values from the LSAC table retrieved 2026-11-18.
  assert.equal(percentileFor(180), 99.85);
  assert.equal(percentileFor(170), 94.48);
  assert.equal(percentileFor(120), 0);
});
test('invalid scores return null', () => {
  assert.equal(percentileFor(119), null);
  assert.equal(percentileFor(181), null);
  assert.equal(percentileFor(160.5), null);
});
test('score for a target percentile is the lowest score reaching it', () => {
  const s = scoreForPercentile(90);
  assert.ok(PERCENT_BELOW[s] >= 90 && PERCENT_BELOW[s - 1] < 90);
  assert.equal(scoreForPercentile(0), 120);
  assert.equal(scoreForPercentile(99.9), null);
  assert.equal(scoreForPercentile(-1), null);
});
test('raw scores convert only with a user table', () => {
  const { map, errors } = parseConversion('56, 170\n55:169\n54 - 168\nbad line');
  assert.equal(map.get(55), 169);
  assert.equal(errors.length, 1);
  assert.match(compute({ raw: 53, conversion: '56, 170' }).empty, /no row for a raw score of 53/);
  assert.equal(compute({ raw: 56, conversion: '56, 170' }).headline.value, '94.48%');
  assert.match(compute({ raw: 56, conversion: '56, 190' }).empty, /120 to 180/);
});
test('empty input asks for a value', () => {
  assert.ok(compute({}).empty);
  assert.equal(compute({ target: 90 }).headline.label, 'Score needed for the 90th percentile');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { californiaFee, compute as probate } from '../src/scripts/calculators/probate-fee-core.js';
import { compute as ppd, georgiaWeekly, georgiaWeeks, texasWeekly } from '../src/scripts/calculators/ppd-core.js';
import { compute as wc } from '../src/scripts/calculators/workers-comp-core.js';
import { compute as privacy } from '../src/scripts/calculators/privacy-policy-core.js';
test('California Probate Code s. 10810 brackets', () => {
  assert.equal(californiaFee(100000).total, 4000); assert.equal(californiaFee(200000).total, 7000);
  assert.equal(californiaFee(1e6).total, 23000); assert.equal(californiaFee(10e6).total, 113000);
  assert.equal(californiaFee(25e6).total, 188000); assert.equal(californiaFee(30e6).overCap, 5e6);
  assert.equal(probate({ state: 'california', inventory: 500000 }).headline.value, '$13,000');
  assert.equal(probate({ inventory: 850000, income: 25000 }).headline.value, '$26,250');
});
test('Texas impairment income benefits', () => {
  assert.equal(texasWeekly(1000), 700); assert.equal(texasWeekly(1000, 650), 650); assert.equal(texasWeekly(100, 0, 150), 150);
  assert.equal(ppd({ state: 'texas', aww: 1000, rating: 10, txMax: 700 }).headline.value, '$21,000.00');
});
test('Georgia permanent partial disability and TTD', () => {
  assert.equal(georgiaWeekly(900), 600); assert.equal(georgiaWeekly(1500), 800); assert.equal(georgiaWeekly(60), 50); assert.equal(georgiaWeekly(40), 40);
  assert.equal(georgiaWeeks(10, 'arm'), 22.5); assert.equal(georgiaWeeks(20, 'body'), 60);
  assert.equal(ppd({ state: 'georgia', aww: 900, rating: 10, bodyPart: 'arm' }).headline.value, '$13,500.00');
  assert.equal(wc({ state: 'georgia', aww: 1500, ttdWeeks: 10 }).headline.value, '$8,000.00');
  assert.equal(wc({ state: 'georgia', aww: 900, ttdWeeks: 500 }).headline.value, '$240,000.00');
});
test('privacy policy covers each s. 22575(b) item', () => {
  const r = privacy({ company: 'A', name: true, shareAnalytics: true, dnt: 'honor', thirdParty: true, review: 'email', date: '2026-12-01' });
  const heads = r.table.rows.map(x => x[0]);
  for (const h of ['Effective Date', 'Information We Collect', 'Who We Share It With', 'Reviewing and Changing Your Information', 'Do Not Track', 'Tracking by Other Parties', 'Changes to This Policy']) assert.ok(heads.includes(h), h);
  assert.ok(privacy({ company: 'A' }).empty);
});

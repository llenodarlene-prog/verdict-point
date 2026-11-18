import test from 'node:test';
import assert from 'node:assert/strict';
import { compute } from '../src/scripts/calculators/legal-software-cost-core.js';
test('return on investment appears only with an hour value and hours saved', () => {
  const r = compute({ users: 5, months: 36, hourValue: 150, 'a.perUser': 39, 'a.hoursSaved': 2, 'b.perUser': 49 });
  assert.equal(r.roi.a.value, 54000);
  assert.equal(r.roi.a.net, 54000 - 7020);
  assert.equal(r.roi.b, undefined);
  assert.equal(r.table.head.length, 8);
  const plain = compute({ users: 5, months: 36, 'a.perUser': 39 });
  assert.equal(plain.table.head.length, 5);
  assert.deepEqual(plain.roi, {});
});

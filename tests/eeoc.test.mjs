import test from 'node:test';
import assert from 'node:assert/strict';
import { chargeDays, chargeDeadline, compute } from '../src/scripts/calculators/eeoc-core.js';
test('180 or 300 days by agency and claim', () => {
  assert.equal(chargeDays('title-vii', 'none'), 180); assert.equal(chargeDays('title-vii', 'state'), 300);
  assert.equal(chargeDays('title-vii', 'local'), 300); assert.equal(chargeDays('adea-epa', 'local'), 180);
  assert.equal(chargeDays('adea-epa', 'state'), 300);
});
test('deadline dates and weekend roll', () => {
  assert.equal(chargeDeadline('2026-06-15', 'title-vii', 'state').text, 'Monday, April 12, 2027'); // +300 = Sun Apr 11 2027, rolls
  const r = chargeDeadline('2026-01-03', 'title-vii', 'none'); // +180 = Thu Jul 2 2026
  assert.equal(r.text, 'Thursday, July 2, 2026');
  const s = chargeDeadline('2026-01-04', 'title-vii', 'none'); // +180 = Fri Jul 3 2026 (observed holiday) -> Mon Jul 6
  assert.equal(s.text, 'Monday, July 6, 2026'); assert.ok(s.rolled);
});
test('compute deadline only and combined', () => {
  assert.equal(compute({ incident: '2026-06-15', agency: 'state', claim: 'title-vii' }).headline.label, 'EEOC charge filing deadline');
  const c = compute({ incident: '2026-06-15', agency: 'state', claim: 'title-vii', annualPay: 62000, monthsOut: 5, employerSize: '101-200', otherDamages: 150000 });
  assert.equal(c.tiles[0][2], 'Monday, April 12, 2027');
  assert.ok(compute({}).empty); assert.ok(compute({ incident: 'bad' }).empty);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDate, isoDate, federalHolidays, calculateDeadline, exclusionReason, parseDeadlineState, serializeDeadlineState } from '../src/scripts/calculators/legal-deadline-core.js';

const d = parseDate;
const run = options => calculateDeadline({ ...options, start: d(options.start) });

test('dates parse strictly', () => {
  assert.equal(isoDate(d('2026-10-28')), '2026-10-28');
  assert.equal(d('2026-02-30'), null);
  assert.equal(d('10/28/2026'), null);
  assert.equal(d('1800-01-01'), null);
});

test('federal holidays and observed days follow 5 U.S.C. 6103', () => {
  const h2026 = Object.fromEntries(federalHolidays(2026).map(h => [h.name, [isoDate(h.date), isoDate(h.observed)]]));
  assert.deepEqual(h2026["Birthday of Martin Luther King, Jr."], ['2026-01-19', '2026-01-19']);
  assert.deepEqual(h2026["Washington's Birthday"], ['2026-02-16', '2026-02-16']);
  assert.deepEqual(h2026['Memorial Day'], ['2026-05-25', '2026-05-25']);
  assert.deepEqual(h2026['Independence Day'], ['2026-07-04', '2026-07-03']);
  assert.deepEqual(h2026['Labor Day'], ['2026-09-07', '2026-09-07']);
  assert.deepEqual(h2026['Columbus Day'], ['2026-10-12', '2026-10-12']);
  assert.deepEqual(h2026['Thanksgiving Day'], ['2026-11-26', '2026-11-26']);
  const h2027 = Object.fromEntries(federalHolidays(2027).map(h => [h.name, isoDate(h.observed)]));
  assert.equal(h2027['Juneteenth National Independence Day'], '2027-06-18');
  assert.equal(h2027['Independence Day'], '2027-07-05');
  assert.equal(h2027['Christmas Day'], '2027-12-24');
  assert.equal(federalHolidays(2020).some(h => h.name.startsWith('Juneteenth')), false);
  // January 1, 2028 is a Saturday, so it is observed on Friday, December 31, 2027.
  assert.equal(exclusionReason(d('2027-12-31')), "New Year's Day (observed)");
});

test('calendar days exclude the trigger day and roll past weekends and holidays', () => {
  assert.equal(isoDate(run({ start: '2026-10-28', days: 30 }).deadline), '2026-11-27');
  const thanksgiving = run({ start: '2026-10-28', days: 29 });
  assert.equal(isoDate(thanksgiving.lastCounted), '2026-11-26');
  assert.equal(isoDate(thanksgiving.deadline), '2026-11-27');
  assert.equal(thanksgiving.rolled, true);
  const noRoll = run({ start: '2026-10-28', days: 29, adjust: 'none' });
  assert.equal(isoDate(noRoll.deadline), '2026-11-26');
  assert.equal(noRoll.landsOnExcluded, 'Thanksgiving Day');
  assert.equal(isoDate(run({ start: '2026-10-28', days: 30, includeStart: true }).deadline), '2026-11-27');
  assert.equal(isoDate(run({ start: '2026-10-28', days: 0 }).deadline), '2026-10-28');
});

test('backward counting rolls backward', () => {
  // July 4, 2026 is a Saturday; Friday July 3 is the observed holiday, so the day moves back to Thursday July 2.
  const r = run({ start: '2026-07-14', days: 10, direction: 'backward' });
  assert.equal(isoDate(r.lastCounted), '2026-07-04');
  assert.equal(isoDate(r.deadline), '2026-07-02');
  assert.equal(r.rolledDays, 2);
});

test('business days skip weekends, holidays, and added dates', () => {
  assert.equal(isoDate(run({ start: '2026-11-20', days: 5, mode: 'business' }).deadline), '2026-11-30');
  assert.equal(isoDate(run({ start: '2026-11-20', days: 5, mode: 'business', holidays: false }).deadline), '2026-11-27');
  assert.equal(isoDate(run({ start: '2026-11-20', days: 5, mode: 'business', custom: new Set([d('2026-11-23')]) }).deadline), '2026-12-01');
  assert.equal(isoDate(run({ start: '2026-11-20', days: 1, mode: 'business', includeStart: true }).deadline), '2026-11-20');
  assert.equal(isoDate(run({ start: '2026-11-21', days: 1, mode: 'business', includeStart: true }).deadline), '2026-11-23');
  assert.equal(isoDate(run({ start: '2026-12-01', days: 3, mode: 'business', direction: 'backward' }).deadline), '2026-11-25');
});

test('long periods stay finite and correct', () => {
  const r = run({ start: '2026-01-01', days: 1000, mode: 'business' });
  assert.ok(r.steps.length > 1000);
  assert.equal(r.landsOnExcluded, null);
});

test('share state is allow-listed', () => {
  const s = parseDeadlineState(new URLSearchParams('start=2026-10-28&days=30&dir=backward&mode=business&first=1&adjust=none&hol=0&exclude=2026-11-02,2026-11-03&name=Smith'));
  assert.deepEqual(s, { start: '2026-10-28', days: 30, dir: 'backward', mode: 'business', first: true, adjust: 'none', hol: false, exclude: '2026-11-02,2026-11-03' });
  assert.deepEqual(parseDeadlineState(new URLSearchParams('start=2026-02-30&days=99999&dir=up&exclude=<b>')), {});
  assert.equal(serializeDeadlineState({ start: '2026-10-28', days: 30, dir: 'forward', mode: 'calendar', first: false, adjust: 'roll', hol: true, note: 'x' }), 'start=2026-10-28&days=30&dir=forward&mode=calendar&adjust=roll');
});

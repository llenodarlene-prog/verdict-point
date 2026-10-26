import test from 'node:test';
import assert from 'node:assert/strict';
import { roundMinutes, calculateTimeEntry, calculateTargetPlan, calculateFirmMetrics, elapsedMinutes, parseNumber, parseCalculatorState, serializeCalculatorState, chartRows } from '../src/scripts/calculators/billable-hours-core.js';

const close = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);
const four = value => value.toFixed(4);

test('time entry rounding matches the brief', () => {
  assert.equal(roundMinutes(37, 6, 'up'), 42);
  assert.equal(roundMinutes(36, 6, 'up'), 36);
  assert.equal(roundMinutes(37, 6, 'nearest'), 36);
  assert.equal(roundMinutes(39, 6, 'nearest'), 42);
  assert.equal(roundMinutes(37, 6, 'down'), 36);
  assert.equal(roundMinutes(37, 6, 'exact'), 37);
  assert.equal(roundMinutes(1, 6, 'up'), 6);
  assert.equal(roundMinutes(0, 6, 'up'), 0);
  assert.equal(roundMinutes(60, 6, 'up'), 60);
  assert.equal(roundMinutes(1440, 15, 'up'), 1440);
});

test('time entry example values', () => {
  const r = calculateTimeEntry({ totalMinutes: 37, incrementMinutes: 6, roundingMethod: 'up', hourlyRate: 350 });
  assert.equal(four(r.exactHours), '0.6167');
  assert.equal(r.roundedMinutes, 42);
  close(r.billableHours, 0.7);
  assert.equal(r.exactValue.toFixed(2), '215.83');
  assert.equal(r.estimatedValue.toFixed(2), '245.00');
  assert.equal(r.minuteDifference, 5);
  assert.equal(r.valueDifference.toFixed(2), '29.17');
  const exact = calculateTimeEntry({ totalMinutes: 37, incrementMinutes: 6, roundingMethod: 'exact' });
  assert.equal(exact.exact, true);
  assert.equal(exact.roundedMinutes, 37);
  assert.equal(exact.estimatedValue, null);
  assert.equal(calculateTimeEntry({ totalMinutes: 42, incrementMinutes: 6, roundingMethod: 'up', hourlyRate: 350 }).estimatedValue.toFixed(2), '245.00');
});

test('start and end times, breaks, and overnight entries', () => {
  assert.deepEqual(elapsedMinutes('09:00', '10:15', false), { minutes: 75 });
  assert.deepEqual(elapsedMinutes('23:30', '00:15', false), { error: 'overnight' });
  assert.deepEqual(elapsedMinutes('23:30', '00:15', true), { minutes: 45 });
  assert.deepEqual(elapsedMinutes('', '10:00', false), { error: 'clock' });
});

test('target planner', () => {
  const r = calculateTargetPlan({ annualTarget: 1800, completedHours: 0, workingWeeks: 48, completedWeeks: 0, workdaysPerWeek: 5 });
  close(r.monthlyTarget, 150); close(r.weeklyTarget, 37.5); close(r.dailyTarget, 7.5);
  const half = calculateTargetPlan({ annualTarget: 1800, completedHours: 900, workingWeeks: 48, completedWeeks: 24, workdaysPerWeek: 5 });
  close(half.requiredWeeklyPace, 37.5); assert.equal(half.status, 'on');
  const met = calculateTargetPlan({ annualTarget: 1800, completedHours: 1900, workingWeeks: 48, completedWeeks: 40, workdaysPerWeek: 5 });
  assert.equal(met.status, 'met'); assert.equal(met.hoursRemaining, 0); assert.equal(met.progressPercent, 100);
  const short = calculateTargetPlan({ annualTarget: 1800, completedHours: 1700, workingWeeks: 48, completedWeeks: 48, workdaysPerWeek: 5 });
  assert.equal(short.status, 'short'); assert.equal(short.requiredWeeklyPace, null); close(short.hoursRemaining, 100);
});

test('firm metrics', () => {
  const r = calculateFirmMetrics({ totalWorkHours: 40, billableHours: 30, hourlyRate: 350, realizationRate: 92, collectionRate: 95 });
  close(r.utilizationRate, 75);
  assert.equal(r.recordedValue, 10500); assert.equal(r.billedValue, 9660); assert.equal(r.collectedValue, 9177);
  assert.equal(r.effectiveCollectedRate.toFixed(2), '305.90');
  assert.equal(r.overallYield.toFixed(1), '87.4');
  const zero = calculateFirmMetrics({ billableHours: 0, hourlyRate: 350 });
  assert.equal(zero.effectiveCollectedRate, null); assert.equal(zero.overallYield, null);
  assert.equal(calculateFirmMetrics({ billableHours: 10, hourlyRate: 100, realizationRate: 0, collectionRate: 100 }).collectedValue, 0);
});

test('input parsing rejects bad values', () => {
  assert.equal(parseNumber('1,800'), 1800);
  assert.equal(parseNumber(''), null);
  assert.ok(Number.isNaN(parseNumber('abc')));
  assert.ok(Number.isNaN(parseNumber('Infinity')));
  assert.equal(parseNumber('-5'), -5);
});

test('share state is allow-listed and range-checked', () => {
  const state = parseCalculatorState(new URLSearchParams('tool=time&minutes=37&increment=6&rounding=up&rate=350&currency=USD&client=Acme&minutes2=9'));
  assert.deepEqual(state, { tool: 'time', minutes: 37, increment: 6, rounding: 'up', rate: 350, currency: 'USD' });
  assert.deepEqual(parseCalculatorState(new URLSearchParams('minutes=99999&rate=-1&tool=<script>&currency=XYZ&increment=7.5')), {});
  assert.equal(serializeCalculatorState({ tool: 'time', minutes: '37', increment: 6, rounding: 'up', rate: '350', currency: 'USD', notes: 'secret' }), 'tool=time&minutes=37&increment=6&rounding=up&rate=350&currency=USD');
});

test('increment chart covers 1 to 60 minutes', () => {
  const rows = chartRows('up', 12);
  assert.equal(rows.length, 60);
  close(rows[36].six, 0.7); close(rows[36].ten, 40 / 60); close(rows[36].fifteen, 0.75); close(rows[36].custom, 48 / 60);
});

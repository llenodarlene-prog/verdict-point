import test from 'node:test';
import assert from 'node:assert/strict';
const C = '../src/scripts/calculators/';
const m = async n => import(`${C}${n}-core.js`);
test('personal injury: Florida 50% bar, medical negligence exception', async () => {
  const { compute } = await m('personal-injury');
  assert.equal(compute({ state: 'florida', medical: 10000, faultPct: 51 }).headline.value, '$0');
  assert.notEqual(compute({ state: 'florida', medical: 10000, faultPct: 51, medNeg: true }).headline.value, '$0');
  assert.equal(compute({ state: 'other', medical: 10000, faultPct: 60 }).headline.value, '$4,000');
  assert.equal(compute({ state: 'florida', medical: 52300 - 800, otherCosts: 800, nonEconomic: 40000, faultPct: 10 }).headline.value, '$83,070');
});
test('dog bite: Florida sign exception', async () => {
  const { compute } = await m('dog-bite');
  assert.equal(compute({ state: 'florida', medical: 5000, sign: true }).headline.value, '$0');
  assert.notEqual(compute({ state: 'florida', medical: 5000, sign: true, under6: true }).headline.value, '$0');
  assert.notEqual(compute({ state: 'florida', medical: 5000, sign: true, ownerNeg: true }).headline.value, '$0');
});
test('wrongful death present value', async () => {
  const { presentValue, compute } = await m('wrongful-death');
  assert.equal(Math.round(presentValue(1000, 2, 0)), 2000);
  assert.equal(Math.round(presentValue(45000, 20, 3)), 669486);
  assert.ok(compute({}).empty);
});
test('break-even and CAC', async () => {
  assert.equal((await m('break-even')).compute({ rent: 23000, rate: 300, realization: 90, collection: 92 }).headline.value, '92.6');
  const c = (await m('marketing-cac')).compute({ spend: 6000, leads: 80, conversion: 15, avgFee: 4500, targetClients: 18 });
  assert.equal(c.headline.value, '$500');
  assert.equal((await m('marketing-cac')).compute({ spend: 100, leads: 10 }).headline.value, 'n/a');
});
test('law school debt and scholarship', async () => {
  const d = await m('law-school-debt');
  assert.equal(Math.round(d.payment(120000, 0, 10)), 1000);
  assert.equal(d.compute({ perYear: 55000, schoolYears: 3, rate: 8, term: 10 }).headline.value, '$2,402');
  const s = (await m('scholarship')).compute({ years: 3, tuitionA: 62000, scholarA: 40000, livingA: 22000, condA: true, tuitionB: 48000, scholarB: 15000, livingB: 18000 });
  assert.equal(s.headline.value, '$21,000');
});
test('document generators', async () => {
  const n = (await m('nda')).compute({ partyA: 'A Co', partyB: 'B Inc', employee: true });
  assert.ok(n.table.rows.some(r => r[0].includes('Whistleblower')));
  assert.ok(!(await m('nda')).compute({ partyA: 'A Co', partyB: 'B Inc' }).table.rows.some(r => r[0].includes('Whistleblower')));
  assert.ok((await m('nda')).compute({ partyA: '<b>', partyB: '' }).empty);
  assert.equal((await m('service-contract')).compute({ client: 'C', provider: 'P', services: 'x', amount: 100 }).table.rows.length, 12);
  const l = (await m('demand-letter')).compute({ sender: 'S', recipient: 'R', amount: 1850, facts: 'f', date: '2026-12-01', days: 14 });
  assert.ok(l.table.rows.find(r => r[0] === 'Demand')[1].includes('December 15, 2026'));
});

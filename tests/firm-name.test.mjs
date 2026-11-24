import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNames, riskFlags, generate, compute } from '../src/scripts/calculators/firm-name-core.js';
test('parses and caps names', () => {
  assert.deepEqual(parseNames('rivera, chen; o\'neil, extra'), ['Rivera', 'Chen', "O'neil"]);
});
test('flags government-sounding words', () => {
  assert.deepEqual(riskFlags('State Injury Law'), ['state']);
  assert.deepEqual(riskFlags('Rivera Law'), []);
  assert.ok(riskFlags('Legal Aid Partners').includes('legal aid'));
});
test('solo practice gets cautions on Associates and two names', () => {
  const g = generate({ surnames: 'Rivera, Chen', lawyers: 'solo' });
  assert.ok(g.ideas.find(i => i.name === 'Rivera & Associates').notes.length);
  assert.ok(g.ideas.find(i => i.name === 'Rivera & Chen').notes.length);
  const m = generate({ surnames: 'Rivera, Chen', lawyers: 'multiple', entity: 'pllc' });
  assert.ok(m.ideas.some(i => i.name === 'Rivera & Chen, PLLC'));
});
test('trade names and empty state', () => {
  const g = generate({ place: 'tampa bay', practice: 'family' });
  assert.ok(g.ideas.every(i => i.type === 'Trade name'));
  assert.ok(g.ideas.some(i => i.name === 'Tampa Bay Family Lawyers'));
  assert.ok(compute({}).empty);
  assert.ok(generate({ place: 'State College' }).ideas[0].notes.some(n => n.includes('government')));
});

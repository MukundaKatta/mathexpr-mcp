import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { evalExpr, simplifyExpr } from '../src/server.js';

test('basic arithmetic', () => {
  assert.equal(evalExpr('2 + 2 * 3'), 8);
  assert.equal(evalExpr('(1 + 2) * 3'), 9);
});

test('functions and constants', () => {
  // sin(pi) is very close to 0 but mathjs may return a tiny floating-point residual.
  const r = evalExpr('sin(pi)');
  assert.ok(Math.abs(r as number) < 1e-10);
});

test('sqrt', () => {
  assert.equal(evalExpr('sqrt(16)'), 4);
});

test('variable scope', () => {
  assert.equal(evalExpr('x + 1', { x: 5 }), 6);
});

test('unit conversion', () => {
  const r = evalExpr('3 inch to cm') as string;
  assert.match(String(r), /7\.62/);
});

test('simplify reduces a polynomial', () => {
  const s = simplifyExpr('2 * x + x + 1');
  assert.equal(s, '3 * x + 1');
});

test('rejects malformed expression', () => {
  assert.throws(() => evalExpr('('));
});

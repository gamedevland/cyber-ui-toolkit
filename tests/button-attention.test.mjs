import assert from 'node:assert/strict';
import test from 'node:test';
import { ButtonSurface } from '@gamedevland/cyber-ui';
import { Graphics } from 'pixi.js';
import { DrawingSnapshot } from './DrawingSnapshot.mjs';

const palette = { signal: 0xffd65c };
const bounds = { x: 10, y: 20, w: 120, h: 64 };
const draw = (phase, reduced = false) => {
  const g = new Graphics();
  ButtonSurface.attention(g, bounds, phase, reduced, palette);
  return g;
};

test('attention pulses while reduced motion retains the same bright static cue', () => {
  assert.notEqual(DrawingSnapshot.hash(draw(0.25)), DrawingSnapshot.hash(draw(0.75)));
  assert.equal(DrawingSnapshot.hash(draw(0.25, true)), DrawingSnapshot.hash(draw(0.75, true)));
  assert.equal(DrawingSnapshot.hash(draw(0.25)), DrawingSnapshot.hash(draw(0, true)));
});

test('attention validates bounds and phase before emitting drawing commands', () => {
  const g = new Graphics();
  assert.throws(
    () => ButtonSurface.attention(g, { ...bounds, w: 0 }, 0, false, palette),
    RangeError,
  );
  assert.throws(() => ButtonSurface.attention(g, bounds, NaN, false, palette), RangeError);
  assert.equal(g.context.instructions.length, 0);
});

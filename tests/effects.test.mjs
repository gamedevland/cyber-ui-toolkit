import assert from 'node:assert/strict';
import test from 'node:test';
import { Container, Graphics } from 'pixi.js';
import {
  BinaryField,
  CyberPreset,
  SignalLost,
  SurfaceGlitch,
  TextEcho,
  TriangleLoader,
} from '@gamedevland/cyber-ui';
import { DrawingSnapshot } from './DrawingSnapshot.mjs';

test('host seconds drive echo; pause freezes time and reduced motion removes the echo', () => {
  const effect = new TextEcho(CyberPreset.textEcho);
  assert.equal(effect.offset(), 1);
  effect.update(0.09);
  assert.equal(effect.offset(), -0.5);
  effect.setActive(false);
  effect.update(10);
  assert.equal(effect.elapsedSeconds, 0.09);
  effect.setActive(true);
  effect.update(0.09);
  assert.equal(effect.offset(), 0.5);
  effect.setReducedMotion(true);
  const primary = new Container();
  const echo = new Container();
  effect.draw(primary, echo, 100, 200);
  assert.equal(echo.visible, false);
  assert.equal(primary.x, 100);
  effect.dispose();
  effect.dispose();
  assert.throws(() => effect.update(0), /disposed/);
  assert.equal(primary.destroyed, false);
});

test('invalid time and animation configuration fail fast', () => {
  const echo = new TextEcho(CyberPreset.textEcho);
  for (const dt of [-1, Infinity, NaN]) assert.throws(() => echo.update(dt), RangeError);
  assert.throws(() => new TriangleLoader({ ...CyberPreset.triangle, cycleMs: 0 }), RangeError);
  assert.throws(() => new TriangleLoader({ ...CyberPreset.triangle, layers: 2.5 }), RangeError);
  assert.throws(() => new SurfaceGlitch({ ...CyberPreset.glitch, durationMs: 0 }), RangeError);
  assert.throws(
    () => BinaryField.draw(new Graphics(), { x: 0, y: 0, w: 100, h: 50 }, 7, 0, 1, 0),
    RangeError,
  );
  assert.throws(
    () =>
      SignalLost.draw(new Graphics(), 100, 100, 2, {
        background: 0,
        danger: 0,
        accent: 0,
        highlight: 0,
      }),
    RangeError,
  );
});

test('triangle accepts structural config, supports resizing, and borrows graphics', () => {
  const effect = new TriangleLoader({ ...CyberPreset.triangle, compact: { width: 400 } });
  const emblem = new Graphics();
  const dust = new Graphics();
  effect.update(0.5);
  effect.draw(emblem, dust, { x: 120, y: 80, radius: 84, scale: 1 }, CyberPreset.trianglePalette);
  const geometry = DrawingSnapshot.hash(emblem);
  effect.draw(
    emblem,
    dust,
    { x: 240, y: 160, radius: 84, scale: 0.5 },
    CyberPreset.trianglePalette,
  );
  assert.equal(emblem.x, 240);
  assert.equal(emblem.scale.x, 0.5);
  assert.equal(DrawingSnapshot.hash(emblem), geometry);
  effect.dispose();
  assert.equal(emblem.destroyed, false);
  assert.equal(dust.context.destroyed, false);
});

test('equal seeds and host time produce equal triangle geometry', () => {
  const a = new TriangleLoader(CyberPreset.triangle);
  const b = new TriangleLoader(CyberPreset.triangle);
  const aViews = [new Graphics(), new Graphics()];
  const bViews = [new Graphics(), new Graphics()];
  const layout = { x: 160, y: 100, radius: 84, scale: 1 };
  for (const dt of [0.016, 0.033, 0.15, 0.016]) {
    a.update(dt);
    b.update(dt);
  }
  a.draw(...aViews, layout, CyberPreset.trianglePalette);
  b.draw(...bViews, layout, CyberPreset.trianglePalette);
  assert.deepEqual(aViews.map(DrawingSnapshot.hash), bViews.map(DrawingSnapshot.hash));
});

test('glitch pause, reduced motion, hide, and disposal restore host views and shared contexts', () => {
  const root = new Container();
  const source = root.addChild(new Graphics().rect(0, 0, 200, 80).fill(0x70ccff));
  const shared = root.addChild(source.clone());
  const context = source.context;
  const effect = new SurfaceGlitch(CyberPreset.glitch);
  const targets = [{ surface: source, x: 0, y: 0, w: 200, h: 80 }];
  effect.show('button', targets, 0);
  effect.update(0);
  assert.equal(root.children.length, 9);
  assert.ok(source.mask);
  assert.equal(root.children.filter((child) => child.context === context).length, 5);
  effect.setActive(false);
  assert.equal(Boolean(source.mask), false);
  assert.equal(root.children.length, 2);
  effect.update(10);
  assert.equal(effect.elapsedSeconds, 0);
  effect.setActive(true);
  effect.update(0);
  assert.equal(root.children.length, 9);
  effect.setReducedMotion(true);
  assert.equal(root.children.length, 2);
  effect.setReducedMotion(false);
  effect.update(0);
  effect.hide();
  effect.hide();
  assert.equal(root.children.length, 2);
  effect.show('button', targets, 0);
  effect.update(0);
  effect.dispose();
  effect.dispose();
  assert.equal(root.children.length, 2);
  assert.equal(Boolean(source.mask), false);
  assert.equal(context.destroyed, false);
  assert.equal(shared.destroyed, false);
});

test('glitch follows source transforms and live drawing context replacement', () => {
  const root = new Container();
  const source = root.addChild(new Graphics().rect(0, 0, 200, 80).fill(0x70ccff));
  source.position.set(23, 17);
  source.scale.set(0.8);
  const effect = new SurfaceGlitch(CyberPreset.glitch);
  effect.show('button', [{ surface: source, x: 0, y: 0, w: 200, h: 80 }], 0);
  effect.update(0);
  assert.equal(source.mask.scale.x, 0.8);
  source.position.set(42, 24);
  source.context = new Graphics().circle(10, 10, 8).fill(0xffd65c).context;
  effect.update(0.01);
  assert.equal(source.mask.x, 42);
  assert.equal(root.children.filter((child) => child.context === source.context).length, 4);
  effect.show('button', [], 0);
  assert.equal(Boolean(source.mask), false);
  assert.equal(root.children.length, 1);
  effect.dispose();
  assert.equal(source.context.destroyed, false);
});

test('glitch does not overwrite a host mask', () => {
  const root = new Container();
  const source = root.addChild(new Graphics().rect(0, 0, 100, 50).fill(0xffffff));
  const mask = root.addChild(new Graphics().rect(0, 0, 80, 50).fill(0xffffff));
  source.mask = mask;
  const effect = new SurfaceGlitch(CyberPreset.glitch);
  effect.show('button', [{ surface: source, x: 0, y: 0, w: 100, h: 50 }], 0);
  assert.throws(() => effect.update(0), /unmasked/);
  effect.dispose();
  assert.equal(source.mask, mask);
});

test('glitch accepts an empty key and follows source reparenting without leaving masks behind', () => {
  const first = new Container();
  const second = new Container();
  const source = first.addChild(new Graphics().rect(0, 0, 100, 50).fill(0xffffff));
  const effect = new SurfaceGlitch(CyberPreset.glitch);
  effect.show('', [{ surface: source, x: 0, y: 0, w: 100, h: 50 }], 0);
  effect.update(0);
  assert.ok(source.mask);
  second.addChild(source);
  effect.update(0.01);
  assert.equal(first.children.length, 0);
  assert.equal(second.children.length, 8);
  effect.dispose();
  assert.equal(second.children.length, 1);
  assert.equal(source.context.destroyed, false);
});

test('replacing glitch targets preserves timing and supports a smaller target set', () => {
  const root = new Container();
  const a = root.addChild(new Graphics().rect(0, 0, 100, 50).fill(0xffffff));
  const b = root.addChild(new Graphics().rect(0, 0, 100, 50).fill(0xffffff));
  const effect = new SurfaceGlitch(CyberPreset.glitch);
  effect.show(
    'screen',
    [a, b].map((surface) => ({ surface, x: 0, y: 0, w: 100, h: 50 })),
    0,
  );
  effect.update(0);
  effect.show('screen', [{ surface: a, x: 0, y: 0, w: 120, h: 60 }], 0);
  effect.update(0.01);
  assert.ok(a.mask);
  assert.equal(Boolean(b.mask), false);
  effect.dispose();
  assert.equal(root.children.length, 2);
});

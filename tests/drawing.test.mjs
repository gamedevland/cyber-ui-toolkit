import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { Graphics } from 'pixi.js';
import {
  BinaryField,
  ButtonSurface,
  FaultGlyph,
  PanelSurface,
  SignalBrackets,
  SignalLost,
  TerminalGlass,
  TerminalSweep,
  TerminalUi,
  TriangleLoader,
} from '@gamedevland/cyber-ui';
import { DrawingSnapshot } from './DrawingSnapshot.mjs';

// Regression fingerprints cover vector instructions, not GPU pixels or font rendering.
const baseline = JSON.parse(
  readFileSync(new URL('./fixtures/drawings.json', import.meta.url), 'utf8'),
);

test(`drawing regression: ${baseline.results.length} captured cases`, () => {
  for (const fixture of baseline.results) {
    const g = new Graphics();
    const { name, args } = fixture;
    const t = baseline.theme;
    if (name === 'icon') TerminalUi.icon(g, args.icon, 20, 30, args.size, t.sky);
    if (name === 'plate') TerminalUi.plate(g, 0, 0, args.w, args.h, 12, t.panel, t.panelEdge);
    if (name === 'glass')
      TerminalGlass.draw(g, 0, 0, args.w, args.h, 12, t.panel, t.panelEdge, t.sky, t.text);
    if (name === 'focus') TerminalGlass.focus(g, 0, 0, args.w, args.h, t.signal);
    if (name === 'binary') {
      BinaryField.draw(g, { x: 0, y: 0, w: args.w, h: args.h }, 12, 9, 7291, args.frame);
      g.fill({ color: t.sky, alpha: 0.18 });
    }
    if (name === 'sweep')
      TerminalSweep.draw(g, 0, 0, args.w, args.h, 0.4, t.sky, false, args.direction);
    if (name === 'triangle' || name === 'dust') {
      const effect = new TriangleLoader(baseline.triangleConfig);
      const dust = new Graphics();
      effect.update(args.elapsed);
      effect.draw(
        g,
        dust,
        { x: 160, y: 100, radius: 84, scale: 1 },
        { accent: t.sky, secondary: t.scanner, highlight: t.signal, text: t.text },
      );
      if (name === 'dust') {
        assert.equal(DrawingSnapshot.hash(dust), fixture.hash, `dust ${args.elapsed}`);
        effect.dispose();
        continue;
      }
      effect.dispose();
    }
    if (name === 'fault') FaultGlyph.draw(g, 50, 40, t.bug, t.signal, 0.8, 4, 3.9);
    if (name === 'signal')
      SignalLost.draw(g, args.w, args.h, args.progress, {
        background: t.background,
        danger: t.bug,
        accent: t.sky,
        highlight: t.signal,
      });
    if (name === 'brackets')
      SignalBrackets.draw(
        g,
        baseline.brackets,
        720,
        240,
        130,
        1,
        args.elapsed * 1000,
        baseline.bracketFrameMs,
        args.reduced,
        t.sky,
        t.signal,
      );
    if (name === 'button')
      ButtonSurface.draw(
        g,
        { width: 240, height: 56, ...args },
        {
          background: t.background,
          focus: t.sky,
          panel: t.panel,
          inset: t.inset,
          panelEdge: t.panelEdge,
          accent: args.variant === 'primary' && args.enabled ? t.signal : t.sky,
          signal: t.signal,
          steel: t.steel,
          sapphire: t.sapphire,
          text: t.text,
          muted: t.muted,
          danger: t.bug,
        },
      );
    assert.equal(DrawingSnapshot.hash(g), fixture.hash, `${name} ${JSON.stringify(args)}`);
  }
});

test('information, actions and selectors have distinct silhouettes and ready claims carry a visible accent', () => {
  const t = baseline.theme;
  const palette = { ...t, accent: t.sky, focus: t.sky, danger: t.bug };
  const panel = new Graphics(),
    action = new Graphics(),
    tab = new Graphics(),
    selected = new Graphics(),
    ready = new Graphics();
  PanelSurface.draw(
    panel,
    { x: 0, y: 0, w: 240, h: 56 },
    { surface: t.panel, edge: t.panelEdge, accent: t.sky },
  );
  ButtonSurface.draw(
    action,
    { width: 240, height: 56, variant: 'primary', selected: false, enabled: true },
    palette,
  );
  ButtonSurface.draw(
    tab,
    { width: 240, height: 56, variant: 'tab', selected: false, enabled: true },
    palette,
  );
  ButtonSurface.draw(
    selected,
    { width: 240, height: 56, variant: 'tab', selected: true, enabled: true },
    palette,
  );
  ButtonSurface.draw(
    ready,
    { width: 240, height: 56, variant: 'module', selected: false, enabled: true, ready: true },
    palette,
  );
  assert.equal(new Set([panel, action, tab].map((g) => DrawingSnapshot.hash(g))).size, 3);
  assert.notEqual(DrawingSnapshot.hash(tab), DrawingSnapshot.hash(selected));
  assert.ok(
    ready.context.instructions.some(
      (i) => i.action === 'stroke' && i.data.style.width === 2 && i.data.style.color === t.sky,
    ),
  );
  assert.throws(() => PanelSurface.draw(panel, { x: 0, y: 0, w: -1, h: 56 }, palette));
});

test('grouped selectors have one shared outline and no individual outlines or inactive surfaces', () => {
  const t = baseline.theme;
  const palette = { ...t, accent: t.sky, focus: t.sky, danger: t.bug };
  const track = new Graphics(),
    inactive = new Graphics(),
    active = new Graphics();
  ButtonSurface.segmentTrack(track, { x: 0, y: 0, w: 480, h: 39 }, palette);
  ButtonSurface.draw(
    inactive,
    { width: 238, height: 35, variant: 'segment', selected: false, enabled: true },
    palette,
  );
  ButtonSurface.draw(
    active,
    { width: 238, height: 35, variant: 'segment', selected: true, enabled: true },
    palette,
  );
  assert.equal(inactive.context.instructions.length, 0);
  assert.equal(track.context.instructions.filter((i) => i.action === 'stroke').length, 1);
  assert.ok(active.context.instructions.some((i) => i.action === 'fill'));
  assert.ok(active.context.instructions.every((i) => i.action !== 'stroke'));
});

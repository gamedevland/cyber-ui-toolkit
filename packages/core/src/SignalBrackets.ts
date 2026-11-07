import { UiContracts } from './UiContracts.js';

import type { Graphics } from 'pixi.js';

export type BracketOptions = {
  readonly cycleMs: number;
  readonly travel: number;
  readonly scale: number;
  readonly jitter: number;
  readonly distanceRatio: number;
  readonly maxDistance: number;
  readonly halfHeight: number;
  readonly bevel: number;
  readonly strokeWidth: number;
  readonly alpha: number;
  readonly peakAlpha: number;
  readonly markerSize: number;
  readonly markerAlpha: number;
};

export class SignalBrackets {
  static draw(
    g: Graphics,
    c: BracketOptions,
    w: number,
    cy: number,
    outerRadius: number,
    visualScale: number,
    elapsedMs: number,
    frameMs: number,
    reduced: boolean,
    accent: number,
    highlight: number,
  ): void {
    for (const key of [
      'travel',
      'scale',
      'jitter',
      'distanceRatio',
      'maxDistance',
      'halfHeight',
      'bevel',
      'strokeWidth',
      'markerSize',
    ] as const)
      UiContracts.number(key, c[key], 0);
    for (const key of ['alpha', 'peakAlpha', 'markerAlpha'] as const)
      UiContracts.number(key, c[key], 0, 1);
    UiContracts.number('centerY', cy);
    UiContracts.number('outerRadius', outerRadius, 0);
    UiContracts.number('cycleMs', c.cycleMs, Number.EPSILON);
    UiContracts.number('frameMs', frameMs, Number.EPSILON);
    UiContracts.number('elapsedMs', elapsedMs, 0);
    UiContracts.number('width', w, Number.EPSILON);
    UiContracts.number('visualScale', visualScale, Number.EPSILON);
    const phase = (elapsedMs % c.cycleMs) / c.cycleMs;
    // One inward sweep and return, followed by a quiet half-cycle.
    const pulse = reduced ? 0 : Math.max(0, Math.sin(phase * Math.PI * 2)) ** 2;
    const scale = (1 + pulse * c.scale) * visualScale;
    // Reserve the full rotating emblem's radius, including the lifted outer layers.
    const clearance =
      outerRadius + (c.bevel * (1 + c.scale) + c.markerSize + c.jitter) * visualScale;
    const distance = Math.min(
      c.maxDistance * visualScale,
      w / 2 - c.markerSize * visualScale,
      Math.max(w * c.distanceRatio, clearance + c.travel * visualScale),
    );
    const travel = Math.min(c.travel * visualScale, Math.max(0, distance - clearance));
    const jitter =
      pulse > 0.88 ? Math.sin(Math.floor(elapsedMs / frameMs) * 2.4) * c.jitter * visualScale : 0;
    for (const side of [-1, 1]) {
      const x = w / 2 + side * (distance - travel * pulse - jitter);
      const half = c.halfHeight * scale;
      const bevel = c.bevel * scale;
      g.moveTo(x, cy - half)
        .lineTo(x - side * bevel, cy - half + bevel)
        .lineTo(x - side * bevel, cy + half - bevel)
        .lineTo(x, cy + half)
        .stroke({
          color: accent,
          width: c.strokeWidth * scale,
          alpha: c.alpha + (c.peakAlpha - c.alpha) * pulse,
        });
      const marker = c.markerSize * scale;
      g.rect(x - marker / 2, cy - marker / 4, marker, marker / 2).fill({
        color: highlight,
        alpha: c.markerAlpha,
      });
    }
  }
}

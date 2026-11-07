import { AnimatedEffect } from './AnimatedEffect.js';
import { SeededRandom } from './internal/SeededRandom.js';
import { UiContracts } from './UiContracts.js';

import type { TriangleLayout, TriangleOptions, TrianglePalette } from './types.js';
import type { Graphics } from 'pixi.js';

type Point = { readonly x: number; readonly y: number };
type Particle = {
  readonly edge: number;
  readonly phase: number;
  readonly speed: number;
  readonly drift: number;
  readonly size: number;
};

/** Draws into borrowed views. update() advances host time; draw() never creates a ticker. */
export class TriangleLoader extends AnimatedEffect {
  private readonly config: TriangleOptions;
  private readonly particles: readonly Particle[];

  constructor(options: TriangleOptions) {
    super();
    for (const key of [
      'cycleMs',
      'spinDelayMs',
      'spinDurationMs',
      'layers',
      'layerGap',
      'layerLift',
      'strokeWidth',
      'haloWidth',
      'haloAlpha',
      'echoAlpha',
      'particles',
      'particleSize',
      'particleSpread',
      'particleAlpha',
      'seed',
    ] as const)
      UiContracts.number(key, options[key], 0);
    UiContracts.number('cycleMs', options.cycleMs, Number.EPSILON);
    UiContracts.number('spinDurationMs', options.spinDurationMs, Number.EPSILON);
    UiContracts.integer('layers', options.layers, 1, 32);
    UiContracts.integer('particles', options.particles, 0, 1024);
    UiContracts.integer('seed', options.seed, 0, 0xffffffff);
    for (const key of ['haloAlpha', 'echoAlpha', 'particleAlpha'] as const)
      UiContracts.number(key, options[key], 0, 1);
    this.config = { ...options };
    const random = new SeededRandom(options.seed);
    this.particles = Array.from({ length: options.particles }, () => ({
      edge: random.next(),
      phase: random.next(),
      speed: 0.45 + random.next() * 0.7,
      drift: random.next() * Math.PI * 2,
      size: 0.5 + random.next(),
    }));
  }

  outerRadius(radius: number): number {
    this.assertLive();
    UiContracts.number('radius', radius, Number.EPSILON);
    return (
      radius * (1.035 + (this.config.layers - 1) * this.config.layerGap) +
      this.config.layerLift * (1 + (this.config.layers - 1) * 0.3) +
      (this.config.layers - 1) * 0.55
    );
  }

  draw(
    emblem: Graphics,
    particles: Graphics,
    layout: TriangleLayout,
    palette: TrianglePalette,
  ): void {
    this.assertLive();
    UiContracts.number('layout.x', layout.x);
    UiContracts.number('layout.y', layout.y);
    UiContracts.number('layout.radius', layout.radius, Number.EPSILON);
    UiContracts.number('layout.scale', layout.scale, Number.EPSILON);
    const elapsedMs = this.elapsedSeconds * 1000;
    const time = this.reducedMotion ? 0 : elapsedMs / this.config.cycleMs;
    const spinPhase = elapsedMs % (this.config.spinDelayMs + this.config.spinDurationMs);
    const progress = this.reducedMotion
      ? 0
      : Math.max(0, (spinPhase - this.config.spinDelayMs) / this.config.spinDurationMs);
    emblem.position.set(layout.x, layout.y);
    emblem.scale.set(layout.scale);
    emblem.rotation = Math.PI * 2 * progress ** 2 * (3 - 2 * progress);
    this.emblem(emblem.clear(), 0, 0, layout.radius, time, palette);
    this.dust(particles.clear(), layout.x, layout.y, layout.radius * layout.scale, time, palette);
  }

  private emblem(
    g: Graphics,
    cx: number,
    cy: number,
    r: number,
    time: number,
    t: TrianglePalette,
  ): void {
    const phase = time * Math.PI * 2;
    const breathe = 1 + Math.sin(phase) * 0.035;
    for (let layer = this.config.layers - 1; layer >= 0; layer--) {
      const shift = Math.sin(phase - layer * 0.55);
      const radius = r * (breathe + layer * this.config.layerGap);
      const y = cy + shift * this.config.layerLift - layer * this.config.layerLift * 0.3;
      const points = this.triangle(cx + shift * layer * 0.55, y, radius);
      const strength = 1 - layer / this.config.layers;
      g.poly(points, true).stroke({
        color: t.accent,
        width: this.config.haloWidth,
        alpha: this.config.haloAlpha * strength,
      });
      g.poly(points, true).stroke({
        color: t.secondary,
        width: this.config.strokeWidth,
        alpha: this.config.echoAlpha + strength * 0.28,
      });
    }
    const points = this.triangle(cx, cy, r * breathe);
    g.poly(points, true)
      .fill({ color: t.accent, alpha: 0.018 })
      .stroke({ color: t.accent, width: this.config.strokeWidth, alpha: 0.9 });
    g.poly(this.triangle(cx, cy, r * breathe * 0.76), true).stroke({
      color: t.secondary,
      width: 1,
      alpha: 0.26,
    });
    for (let trail = 0; trail < 2; trail++) {
      const start = (time * 0.46 + trail * 0.5) % 1;
      const first = this.edge(cx, cy, r * breathe, start);
      g.moveTo(first.x, first.y);
      for (let step = 1; step <= 16; step++) {
        const point = this.edge(cx, cy, r * breathe, (start + step / 100) % 1);
        g.lineTo(point.x, point.y);
      }
      g.stroke({ color: t.highlight, width: this.config.strokeWidth * 1.6, alpha: 0.95 });
      const tip = this.edge(cx, cy, r * breathe, (start + 0.16) % 1);
      g.rect(tip.x - 1.5, tip.y - 1.5, 3, 3).fill(t.text);
    }
  }

  private dust(
    g: Graphics,
    cx: number,
    cy: number,
    r: number,
    time: number,
    t: TrianglePalette,
  ): void {
    for (const [i, particle] of this.particles.entries()) {
      const age = (time * particle.speed + particle.phase) % 1;
      const source = this.edge(cx, cy, r, particle.edge);
      const spread = 1 + age * age * this.config.particleSpread;
      const x = cx + (source.x - cx) * spread + Math.sin(time + particle.drift) * age * 6;
      const y = cy + (source.y - cy) * spread - age * r * 0.12;
      const size = this.config.particleSize * particle.size;
      const alpha = Math.sin(Math.PI * age) ** 2 * this.config.particleAlpha;
      g.rect(x, y, size, size).fill({ color: i % 5 === 0 ? t.highlight : t.accent, alpha });
    }
  }

  private triangle(cx: number, cy: number, r: number): number[] {
    return [
      cx,
      cy - r,
      cx + (r * Math.sqrt(3)) / 2,
      cy + r / 2,
      cx - (r * Math.sqrt(3)) / 2,
      cy + r / 2,
    ];
  }

  private edge(cx: number, cy: number, r: number, position: number): Point {
    const progress = position * 3;
    const halfWidth = (r * Math.sqrt(3)) / 2;
    if (progress < 1) return { x: cx + halfWidth * progress, y: cy - r + r * 1.5 * progress };
    if (progress < 2) return { x: cx + halfWidth * (3 - progress * 2), y: cy + r / 2 };
    return { x: cx - halfWidth * (3 - progress), y: cy + r / 2 - r * 1.5 * (progress - 2) };
  }
}

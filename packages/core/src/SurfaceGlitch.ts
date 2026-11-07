import { AnimatedEffect } from './AnimatedEffect.js';
import { SeededRandom } from './internal/SeededRandom.js';
import { GlitchSlices } from './internal/GlitchSlices.js';
import { UiContracts } from './UiContracts.js';

import type { GlitchOptions, UiBounds } from './types.js';
import type { Graphics } from 'pixi.js';

export type GlitchTarget = UiBounds & { readonly surface: Graphics };

/** Schedules deterministic distortion; owned drawing resources are isolated from host views. */
export class SurfaceGlitch extends AnimatedEffect {
  private readonly random: SeededRandom;
  constructor(private readonly motion: GlitchOptions) {
    super();
    UiContracts.number('durationMs', motion.durationMs, Number.EPSILON);
    UiContracts.number('minDelayMs', motion.minDelayMs, 0);
    UiContracts.number('spreadMs', motion.spreadMs, 0);
    UiContracts.integer('seed', motion.seed, 0, 0xffffffff);
    this.motion = { ...motion };
    this.random = new SeededRandom(motion.seed);
  }
  private key?: string;
  private targets: readonly GlitchTarget[] = [];
  private next = Infinity;
  private startedAt?: number;
  private targetIndex = -1;
  private amplitude = 1;
  private bandOffset = 0.13;
  private readonly slices = new GlitchSlices();

  protected override onActivityChanged(active: boolean): void {
    if (!active) {
      this.slices.restore();
      delete this.startedAt;
    }
  }

  protected override onMotionChanged(): void {
    this.slices.restore();
    delete this.startedAt;
    this.next = this.elapsedSeconds * 1000;
  }

  protected override onDispose(): void {
    this.slices.dispose();
    this.targets = [];
  }

  show(key: string, targets: readonly GlitchTarget[], revealDelay: number): void {
    this.assertLive();
    UiContracts.number('revealDelayMs', revealDelay, 0);
    for (const target of targets) UiContracts.bounds(target);
    this.slices.restore();
    this.targets = targets.map((target) => ({ ...target }));
    if (this.targetIndex >= targets.length) {
      this.targetIndex = -1;
      delete this.startedAt;
    }
    if (key === this.key) return;
    this.key = key;
    this.targetIndex = -1;
    this.next = this.elapsedSeconds * 1000 + revealDelay;
    delete this.startedAt;
  }

  hide(): void {
    this.assertLive();
    delete this.key;
    this.targets = [];
    this.next = Infinity;
    delete this.startedAt;
    this.slices.restore();
  }

  protected override onFrame(): void {
    const motion = this.motion;
    if (!this.targets.length) return;
    if (this.reducedMotion) {
      delete this.startedAt;
      this.slices.restore();
      return;
    }
    const now = this.elapsedSeconds * 1000;
    if (now < this.next) return;
    if (this.startedAt === undefined) {
      this.startedAt = now;
      const count = this.targets.length;
      const avoidPrevious = count > 1 && this.targetIndex >= 0 && this.targetIndex < count;
      const candidate = Math.floor(this.random.next() * (count - Number(avoidPrevious)));
      this.targetIndex = avoidPrevious && candidate >= this.targetIndex ? candidate + 1 : candidate;
      this.amplitude = (0.8 + this.random.next() * 0.42) * (this.random.next() < 0.5 ? -1 : 1);
      this.bandOffset = 0.07 + this.random.next() * 0.13;
    }
    const age = (now - this.startedAt) / motion.durationMs;
    if (age >= 1) {
      this.next = now + motion.minDelayMs + this.random.next() * motion.spreadMs;
      delete this.startedAt;
      this.slices.restore();
      return;
    }
    const target = this.targets[this.targetIndex];
    if (!target) return;
    const shift = this.amplitude * (age < 0.25 ? 14 : age < 0.44 ? -8 : age < 0.65 ? 0 : 5);
    if (shift === 0) this.slices.restore();
    else this.slices.draw(target, shift, this.bandOffset);
  }
}

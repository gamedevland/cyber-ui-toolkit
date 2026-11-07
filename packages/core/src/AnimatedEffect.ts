import { UiContracts } from './UiContracts.js';

import type { UiEffect } from './types.js';

/** Owns effect time only. The host owns scheduling, rendering, and borrowed views. */
export abstract class AnimatedEffect implements UiEffect {
  private seconds = 0;
  private running = true;
  private disposed = false;
  protected reducedMotion = false;

  get elapsedSeconds(): number {
    return this.seconds;
  }

  update(deltaSeconds: number): void {
    this.assertLive();
    UiContracts.number('deltaSeconds', deltaSeconds, 0);
    if (!this.running) return;
    const next = this.seconds + deltaSeconds;
    UiContracts.number('elapsedSeconds', next, 0);
    this.seconds = next;
    this.onFrame();
  }

  setActive(active: boolean): void {
    this.assertLive();
    if (this.running === active) return;
    this.running = active;
    this.onActivityChanged(active);
  }

  setReducedMotion(reduced: boolean): void {
    this.assertLive();
    if (this.reducedMotion === reduced) return;
    this.reducedMotion = reduced;
    this.onMotionChanged();
  }

  dispose(): void {
    if (this.disposed) return;
    this.onDispose();
    this.disposed = true;
    this.running = false;
  }

  protected assertLive(): void {
    if (this.disposed) throw new Error(`${this.constructor.name} is disposed`);
  }

  protected onFrame(): void {}
  protected onActivityChanged(_active: boolean): void {}
  protected onMotionChanged(): void {}
  protected onDispose(): void {}
}

import { AnimatedEffect } from './AnimatedEffect.js';
import { UiContracts } from './UiContracts.js';

import type { TextEchoOptions } from './types.js';
import type { Container } from 'pixi.js';

/** Borrows two text views; the host supplies content, font, tint, and bounds. */
export class TextEcho extends AnimatedEffect {
  private readonly options: TextEchoOptions;

  constructor(options: TextEchoOptions) {
    super();
    UiContracts.number('frameMs', options.frameMs, Number.EPSILON);
    UiContracts.number('cycleMs', options.cycleMs, Number.EPSILON);
    UiContracts.number('shift', options.shift, 0);
    this.options = { ...options };
  }

  offset(phaseOffsetMs = 0): number {
    this.assertLive();
    UiContracts.number('phaseOffsetMs', phaseOffsetMs, 0);
    if (this.reducedMotion) return 0;
    const frame = Math.floor(
      ((this.elapsedSeconds * 1000 + phaseOffsetMs) % this.options.cycleMs) / this.options.frameMs,
    );
    return (frame === 0 ? 1 : frame === 1 ? -0.5 : frame === 2 ? 0.5 : 0) * this.options.shift;
  }

  draw(
    primary: Container,
    echo: Container,
    x: number,
    y: number,
    enabled = true,
    phaseOffsetMs = 0,
  ): void {
    this.assertLive();
    UiContracts.number('x', x);
    UiContracts.number('y', y);
    const shift = enabled ? this.offset(phaseOffsetMs) : 0;
    primary.position.set(x + shift, y);
    echo.position.set(x - shift * 2, y - 0.5);
    echo.visible = enabled && shift !== 0;
  }
}

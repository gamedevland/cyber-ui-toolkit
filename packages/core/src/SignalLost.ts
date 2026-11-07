import { FaultGlyph } from './FaultGlyph.js';
import { UiContracts } from './UiContracts.js';

import type { Graphics } from 'pixi.js';

export type SignalPalette = {
  readonly background: number;
  readonly danger: number;
  readonly accent: number;
  readonly highlight: number;
};

/** Host supplies normalized progress; labels, routing, and report timing stay outside. */
export class SignalLost {
  private static readonly rows = [
    0.02, 0.09, 0.17, 0.23, 0.32, 0.38, 0.5, 0.59, 0.64, 0.72, 0.83, 0.9, 0.96,
  ];

  static draw(g: Graphics, width: number, height: number, progress: number, theme: SignalPalette) {
    UiContracts.number('width', width, Number.EPSILON);
    UiContracts.number('height', height, Number.EPSILON);
    UiContracts.number('progress', progress, 0, 1);
    const second = progress >= 0.46;
    const pulse = second
      ? Math.max(0, 1 - (progress - 0.46) / 0.29) * 0.85
      : Math.max(0, 1 - progress / 0.35);
    const fade = Math.min(1, (1 - progress) / 0.2);
    const shift = (second ? -1 : 1) * (Math.floor(progress * 22) % 2 ? -1 : 1) * pulse;
    const x = width / 2;
    const y = height * 0.46;
    g.rect(0, 0, width, height).fill({
      color: theme.background,
      alpha: (0.65 + pulse * 0.2) * fade,
    });
    g.rect(0, 0, width, height).fill({ color: theme.danger, alpha: (0.06 + pulse * 0.15) * fade });
    if (pulse > 0) this.drawTears(g, theme, width, height, shift, pulse * fade);
    const rail = Math.min(width * 0.43, 238);
    const railY = y + 16;
    g.rect(x - rail, railY, rail * 2, 1).fill({ color: theme.danger, alpha: fade * 0.5 });
    g.rect(x - rail, railY - 2, 11, 5)
      .rect(x + rail - 11, railY - 2, 11, 5)
      .fill({ color: theme.danger, alpha: fade * 0.82 });
    FaultGlyph.draw(g, x, y - 29, theme.danger, theme.highlight, fade, shift * 18, 3.9);
    return { x, y, fade, shift };
  }

  private static drawTears(
    g: Graphics,
    theme: SignalPalette,
    width: number,
    height: number,
    shift: number,
    alpha: number,
  ): void {
    for (const [i, row] of SignalLost.rows.entries()) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = width * (side < 0 ? -0.04 : 0.21 + (i % 4) * 0.09);
      const w = width * (i % 4 === 0 ? 1.06 : 0.49 + (i % 3) * 0.12);
      const y = row * height + shift * (i % 3) * 7;
      const h = 5 + (i % 5) * 5;
      const dx = shift * side * (17 + 9 * (i % 4));
      g.rect(x, y, w, h).fill({ color: theme.background, alpha: alpha * 0.86 });
      g.rect(x + dx, y, w, 1 + (i % 3)).fill({ color: theme.danger, alpha: alpha * 0.9 });
      g.rect(x - dx, y + h, w * 0.79, 1).fill({ color: theme.danger, alpha: alpha * 0.55 });
      if (i % 3 === 0)
        g.rect(x + w * 0.52 - dx, y + 3, w * 0.26, 1).fill({
          color: theme.accent,
          alpha: alpha * 0.34,
        });
    }
  }
}

import { UiContracts } from './UiContracts.js';

import type { Graphics } from 'pixi.js';

export class FaultGlyph {
  static draw(
    g: Graphics,
    x: number,
    y: number,
    red: number,
    echo: number,
    alpha: number,
    distortion: number,
    scale = 1,
  ): void {
    UiContracts.number('x', x);
    UiContracts.number('y', y);
    UiContracts.number('alpha', alpha, 0, 1);
    UiContracts.number('distortion', distortion);
    UiContracts.number('scale', scale, Number.EPSILON);
    const phases = [1, -0.65, 0.82];
    for (let i = 0; i < phases.length; i++) {
      const shift = distortion * (phases[i] ?? 0);
      const from = i / 3 + (distortion === 0 || i === 0 ? 0 : 0.04);
      const to = (i + 1) / 3;
      const cx = x + shift;
      for (const side of [-1, 1]) {
        g.moveTo(cx + side * 9 * from * scale, y + (-8 + 16 * from) * scale)
          .lineTo(cx + side * 9 * to * scale, y + (-8 + 16 * to) * scale)
          .stroke({ color: red, width: 1.8 * scale, alpha });
      }
      if (distortion !== 0)
        g.rect(
          cx + (i % 2 === 0 ? -15 : 11) * scale,
          y + (-8 + 16 * from) * scale,
          5 * scale,
          scale,
        ).fill({ color: echo, alpha: alpha * 0.45 });
      if (i === 2)
        g.rect(cx - 9 * scale, y + 7.2 * scale, 18 * scale, 1.8 * scale).fill({
          color: red,
          alpha,
        });
    }
    g.rect(x - scale - distortion * 0.65, y - 2 * scale, 2 * scale, 5 * scale)
      .circle(x + distortion * 0.82, y + 5 * scale, 1.05 * scale)
      .fill({ color: red, alpha });
  }
}

import { UiContracts } from './UiContracts.js';

import type { Graphics } from 'pixi.js';

export class TerminalSweep {
  static draw(
    g: Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
    progress: number,
    color: number,
    reduced: boolean,
    direction: 'down' | 'right' = 'down',
  ): void {
    UiContracts.bounds({ x, y, w, h });
    UiContracts.number('progress', progress);
    if (progress < 0 || progress >= 1) return;
    const alpha = Math.max(0, Math.min(1, progress * 5, (1 - progress) * 3));
    if (!reduced && direction === 'right') {
      const scan = w * progress;
      g.rect(x + Math.max(0, scan - 10), y + 3, Math.min(10, scan), h - 6).fill({
        color,
        alpha: 0.14 * alpha,
      });
      g.rect(x + scan, y + 3, 2, h - 6).fill({ color, alpha: 0.42 * alpha });
      g.rect(x + 2, y + h - 3, Math.max(1, scan - 2), 1).fill({ color, alpha: 0.57 * alpha });
    } else if (!reduced) {
      const scan = y + h * progress;
      g.rect(x + 3, scan - 1, Math.max(1, w - 6), 2).fill({ color, alpha: 0.55 * alpha });
      g.rect(x + 3, Math.max(y, scan - 7), Math.max(1, w - 6), Math.min(6, scan - y)).fill({
        color,
        alpha: 0.15 * alpha,
      });
    }
    const length = Math.min(25, w * 0.1, h * 0.24);
    for (const [dx, dy] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ] as const) {
      const px = x + (dx < 0 ? 0 : w);
      const py = y + (dy < 0 ? 0 : h);
      const reach = reduced ? length : length * Math.min(1, progress * 4);
      g.moveTo(px - dx * reach, py)
        .lineTo(px, py)
        .lineTo(px, py - dy * reach)
        .stroke({ color, width: 1.6, alpha: alpha * 0.8 });
    }
    if (!reduced) {
      const rail = Math.max(0, Math.min(1, (progress - 0.11) / 0.56));
      const span = (w - length * 2) * rail;
      const head = x + length + span;
      if (span > 0) {
        g.moveTo(x + length, y)
          .lineTo(head, y)
          .moveTo(x + w - length, y + h)
          .lineTo(x + w - length - span, y + h)
          .stroke({ color, width: 1, alpha: alpha * 0.55 });
        if (rail < 1) g.rect(head - 4, y - 1, 4, 2).fill({ color, alpha });
      }
    }
  }
}

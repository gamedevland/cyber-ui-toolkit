import { UiContracts } from './UiContracts.js';

import { TerminalUi } from './TerminalUi.js';

import type { Graphics } from 'pixi.js';

export class TerminalGlass {
  static focus(g: Graphics, x: number, y: number, w: number, h: number, color: number): void {
    UiContracts.bounds({ x, y, w, h });
    const corner = Math.min(10, w / 5, h / 4);
    g.moveTo(x + 2, y + corner)
      .lineTo(x + 2, y + 2)
      .lineTo(x + corner, y + 2)
      .moveTo(x + w - corner, y + h - 2)
      .lineTo(x + w - 2, y + h - 2)
      .lineTo(x + w - 2, y + h - corner)
      .stroke({ color, width: 2 });
    g.rect(x + w * 0.3, y, w * 0.4, 2).fill(color);
  }

  static draw(
    g: Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
    cut: number,
    surface: number,
    edge: number,
    accent: number,
    light: number,
  ): void {
    TerminalUi.plate(g, x, y, w, h, cut, surface, edge);
    const bevel = Math.min(cut, w / 3, h / 3);
    const right = x + w - 1;
    const top = y + 1;
    const face = Math.max(bevel, Math.min(h * 0.42, 32));
    g.poly([
      x + 1,
      top,
      right - bevel,
      top,
      right,
      top + bevel,
      right,
      top + face,
      x + 1,
      top + face + Math.min(8, h * 0.12),
    ]).fill({ color: accent, alpha: 0.09 });
    g.poly([
      x + w * 0.79,
      top,
      right - bevel,
      top,
      right,
      top + bevel,
      right,
      y + h - 1,
      x + w * 0.63,
      y + h - 1,
    ]).fill({ color: accent, alpha: 0.045 });
    g.moveTo(x + 2, top + face)
      .lineTo(x + w * 0.37, top + face)
      .stroke({ color: light, width: 1, alpha: 0.055 });
    g.moveTo(x + 2, top)
      .lineTo(right - bevel, top)
      .lineTo(right - 1, top + bevel)
      .stroke({ color: accent, width: 1, alpha: 0.4 });
    g.moveTo(x + 3, top + 1)
      .lineTo(x + Math.min(70, w * 0.32), top + 1)
      .stroke({ color: light, width: 1, alpha: 0.28 });
    TerminalUi.etch(g, x, y, w, h, accent);
  }
}

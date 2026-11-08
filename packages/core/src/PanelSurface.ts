import { UiContracts } from './UiContracts.js';

import type { UiBounds } from './types.js';
import type { Graphics } from 'pixi.js';

export type PanelPalette = {
  readonly surface: number;
  readonly edge: number;
  readonly accent: number;
};

/** Quiet information surface, distinct from bevelled actions and rounded selectors. */
export class PanelSurface {
  static draw(g: Graphics, bounds: UiBounds, palette: PanelPalette): void {
    UiContracts.bounds(bounds);
    const { x, y, w, h } = bounds;
    const { surface, edge, accent } = palette;
    g.roundRect(x, y, w, h, 3).fill(surface).stroke({ color: edge, width: 1 });
    g.rect(x, y + Math.min(8, h / 4), 3, Math.max(1, h - 16)).fill({ color: accent, alpha: 0.7 });
    g.moveTo(x + Math.min(12, w / 4), y + h - 1)
      .lineTo(x + w - Math.min(12, w / 4), y + h - 1)
      .stroke({ color: accent, width: 1, alpha: 0.2 });
  }
}

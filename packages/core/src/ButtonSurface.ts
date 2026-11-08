import { TerminalGlass } from './TerminalGlass.js';
import { TerminalUi } from './TerminalUi.js';
import { UiContracts } from './UiContracts.js';

import type { UiBounds } from './types.js';
import type { Graphics } from 'pixi.js';

export type ButtonVariant =
  | 'primary'
  | 'module'
  | 'switch'
  | 'danger'
  | 'icon'
  | 'nav'
  | 'segment'
  | 'tab'
  | 'utility'
  | 'line';
export type ButtonPalette = {
  readonly background: number;
  readonly focus: number;
  readonly panel: number;
  readonly inset: number;
  readonly panelEdge: number;
  readonly accent: number;
  readonly signal: number;
  readonly steel: number;
  readonly sapphire: number;
  readonly text: number;
  readonly muted: number;
  readonly danger: number;
};
export type ButtonSurfaceOptions = {
  readonly width: number;
  readonly height: number;
  readonly variant: ButtonVariant;
  readonly selected: boolean;
  readonly enabled: boolean;
  readonly explicitAccent?: boolean;
  readonly ready?: boolean;
};

/** Skin only: the host owns hit testing, focus, labels, and application actions. */
export class ButtonSurface {
  static draw(g: Graphics, options: ButtonSurfaceOptions, t: ButtonPalette): void {
    const { width: w, height: h, variant, selected, enabled } = options;
    UiContracts.number('width', w, Number.EPSILON);
    UiContracts.number('height', h, Number.EPSILON);
    if (
      variant === 'primary' ||
      variant === 'module' ||
      variant === 'switch' ||
      variant === 'danger'
    ) {
      if (variant === 'primary' && enabled) {
        TerminalUi.plate(g, 0, 0, w, h, 13, t.accent, t.accent);
        TerminalUi.etch(g, 0, 0, w, h, t.background);
      } else
        TerminalGlass.draw(
          g,
          0,
          0,
          w,
          h,
          variant === 'primary' ? 13 : 7,
          t.panel,
          t.panelEdge,
          variant === 'danger' ? t.danger : t.accent,
          t.text,
        );
      if (variant === 'module' && (enabled || selected || options.explicitAccent)) {
        g.rect(1, 6, 2, Math.max(1, h - 12)).fill({ color: t.accent, alpha: 0.84 });
      }
    } else if (variant === 'icon') {
      g.roundRect(0, 0, w, h, 7)
        .fill(selected ? t.steel : t.inset)
        .stroke({ color: selected ? t.focus : t.panelEdge, width: 1 });
    } else if (variant === 'nav' && selected) {
      g.roundRect(3, 5, w - 6, h - 10, 8).fill({ color: t.signal, alpha: 0.14 });
      g.roundRect(w * 0.32, 0, w * 0.36, 3, 1).fill(t.signal);
    } else if (variant === 'segment') {
      if (selected) g.roundRect(0, 0, w, h, h / 2).fill(t.sapphire);
    } else if (variant === 'tab') {
      const inset = 0;
      const radius = 8;
      g.roundRect(inset, inset, w - inset * 2, h - inset * 2, radius)
        .fill({ color: selected ? t.sapphire : t.inset, alpha: selected ? 1 : 0.5 })
        .stroke({
          color: selected ? t.accent : t.panelEdge,
          width: selected ? 1.5 : 1,
          alpha: selected ? 1 : 0.5,
        });
      if (selected) g.roundRect(w * 0.22, h - 4, w * 0.56, 3, 1.5).fill(t.accent);
    } else if (variant === 'utility') {
      g.moveTo(7, h - 1)
        .lineTo(w - 7, h - 1)
        .stroke({ color: t.panelEdge, width: 1 });
    }
    if (options.ready) {
      g.roundRect(1, 1, w - 2, h - 2, 7)
        .fill({ color: t.accent, alpha: 0.18 })
        .stroke({ color: t.accent, width: 2 });
      g.rect(1, 8, 4, Math.max(1, h - 16)).fill(t.accent);
    }
  }

  static segmentTrack(g: Graphics, bounds: UiBounds, t: ButtonPalette): void {
    UiContracts.bounds(bounds);
    const { x, y, w, h } = bounds;
    g.roundRect(x, y, w, h, h / 2)
      .fill(t.inset)
      .stroke({ color: t.panelEdge, width: 1 });
  }

  static toggle(
    g: Graphics,
    width: number,
    height: number,
    selected: boolean,
    t: ButtonPalette,
  ): void {
    UiContracts.number('width', width, Number.EPSILON);
    UiContracts.number('height', height, Number.EPSILON);
    g.roundRect(width - 56, height / 2 - 10, 41, 20, 10)
      .fill(selected ? t.sapphire : t.inset)
      .stroke({ color: t.panelEdge, width: 1 });
    g.circle(width - (selected ? 25 : 46), height / 2, 6).fill(selected ? t.focus : t.muted);
  }
}

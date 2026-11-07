import { UiContracts } from './UiContracts.js';

import type { Graphics } from 'pixi.js';

export type TerminalIcon =
  | 'chip'
  | 'battle'
  | 'agents'
  | 'skills'
  | 'quests'
  | 'gear'
  | 'bolt'
  | 'calendar'
  | 'credit'
  | 'capsule'
  | 'key'
  | 'left'
  | 'right'
  | 'exit'
  | 'play'
  | 'lock'
  | 'chest'
  | 'check'
  | 'speed'
  | 'target'
  | 'burst'
  | 'repair'
  | 'heart'
  | 'scan'
  | 'snow'
  | 'boss'
  | 'flag';

export class TerminalUi {
  static clippedRect(
    g: Graphics,
    area: { x: number; y: number; w: number; h: number },
    cut: number,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void {
    const topMin = area.x + Math.max(0, y - area.y - area.h + cut);
    const topMax = area.x + area.w - Math.max(0, cut - y + area.y);
    const bottomMin = area.x + Math.max(0, y + h - area.y - area.h + cut);
    const bottomMax = area.x + area.w - Math.max(0, cut - y - h + area.y);
    const rightTop = Math.max(topMin, Math.min(x + w, topMax));
    const leftTop = Math.min(rightTop, Math.max(x, topMin));
    const rightBottom = Math.max(bottomMin, Math.min(x + w, bottomMax));
    const leftBottom = Math.min(rightBottom, Math.max(x, bottomMin));
    g.poly([leftTop, y, rightTop, y, rightBottom, y + h, leftBottom, y + h]);
  }

  static plate(
    g: Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
    cut: number,
    fill: number,
    line: number,
    alpha = 1,
  ): void {
    UiContracts.bounds({ x, y, w, h });
    UiContracts.number('cut', cut, 0);
    UiContracts.number('alpha', alpha, 0, 1);
    const corner = Math.min(cut, w / 3, h / 3);
    g.poly([
      x,
      y,
      x + w - corner,
      y,
      x + w,
      y + corner,
      x + w,
      y + h,
      x + corner,
      y + h,
      x,
      y + h - corner,
    ])
      .fill({ color: fill, alpha })
      .stroke({ color: line, width: 1 });
  }

  static traces(g: Graphics, x: number, y: number, w: number, h: number, color: number): void {
    UiContracts.bounds({ x, y, w, h });
    for (let i = 0; i < 4; i++) {
      const a = x + w * (0.09 + i * 0.075);
      const b = x + w * (0.53 + i * 0.083);
      const row = y + h * (0.28 + i * 0.137);
      g.moveTo(a, y + h * 0.12)
        .lineTo(a, row - 12)
        .lineTo(a + 12, row)
        .lineTo(b, row)
        .lineTo(b + 13, row + 13)
        .lineTo(b + 13, y + h * 0.89)
        .stroke({ color, width: 1, alpha: 0.28 });
      g.rect(a - 2, y + h * 0.12 - 2, 4, 4).stroke({ color, width: 1, alpha: 0.46 });
      g.rect(b + 11, y + h * 0.89 - 2, 4, 4).fill({ color, alpha: 0.38 });
    }
  }

  static etch(g: Graphics, x: number, y: number, w: number, h: number, color: number): void {
    UiContracts.bounds({ x, y, w, h });
    if (w < 70 || h < 28) return;
    const right = x + w - 9;
    const bottom = y + h - 4;
    g.moveTo(x + 10, y + 4)
      .lineTo(x + 28, y + 4)
      .moveTo(right - 19, bottom)
      .lineTo(right, bottom)
      .stroke({ color, width: 1, alpha: 0.21 });
    for (let i = 0; i < 4; i++) {
      const left = right - i * 4;
      g.moveTo(left - 2, bottom - 2).lineTo(left, bottom - 4);
    }
    g.stroke({ color, width: 1, alpha: 0.25 });
  }

  static icon(
    g: Graphics,
    icon: TerminalIcon,
    x: number,
    y: number,
    size: number,
    color: number,
  ): void {
    UiContracts.number('x', x);
    UiContracts.number('y', y);
    UiContracts.number('size', size, Number.EPSILON);
    const u = size / 20;
    const width = Math.max(1, 1.65 * u);
    const path = (...points: number[]) => {
      g.poly(
        points.map((p, i) => (i % 2 === 0 ? x : y) + p * u),
        false,
      ).stroke({ color, width, cap: 'round', join: 'round' });
    };
    const ring = (dx: number, dy: number, radius: number) =>
      g.circle(x + dx * u, y + dy * u, radius * u).stroke({ color, width });
    switch (icon) {
      case 'chip':
        g.roundRect(x - 6 * u, y - 6 * u, 12 * u, 12 * u, 2 * u).stroke({ color, width });
        g.rect(x - 2 * u, y - 2 * u, 4 * u, 4 * u).fill(color);
        for (const i of [-3, 0, 3]) {
          path(i, -6, i, -9);
          path(i, 6, i, 9);
          path(-6, i, -9, i);
          path(6, i, 9, i);
        }
        break;
      case 'battle':
        path(0, -9, 7, -5, 6, 3, 0, 9, -6, 3, -7, -5, 0, -9);
        path(-3, 0, 0, 3, 4, -2);
        break;
      case 'agents':
        path(-8, -4, 8, -4, 8, 6, -8, 6, -8, -4);
        path(0, -4, 0, -8, 3, -8);
        path(-4, 0, -3, 0);
        path(3, 0, 4, 0);
        break;
      case 'skills':
        ring(0, -7, 2);
        ring(-6, 6, 2);
        ring(6, 6, 2);
        path(0, -4, 0, 0, -6, 0, -6, 3);
        path(0, 0, 6, 0, 6, 3);
        break;
      case 'quests':
      case 'calendar':
        g.roundRect(x - 7 * u, y - 7 * u, 14 * u, 15 * u, 2 * u).stroke({ color, width });
        path(-4, -3, 4, -3);
        path(-4, 1, 4, 1);
        path(-4, 5, icon === 'calendar' ? 4 : 1, 5);
        break;
      case 'gear':
        ring(0, 0, 6);
        ring(0, 0, 2);
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4;
          path(Math.cos(a) * 6, Math.sin(a) * 6, Math.cos(a) * 9, Math.sin(a) * 9);
        }
        break;
      case 'bolt':
        path(2, -9, -6, 1, -1, 1, -2, 9, 6, -1, 1, -1, 2, -9);
        break;
      case 'credit':
        path(0, -8, 7, -4, 7, 4, 0, 8, -7, 4, -7, -4, 0, -8);
        path(-2, 0, 2, 0);
        break;
      case 'capsule':
        g.roundRect(x - 5 * u, y - 8 * u, 10 * u, 16 * u, 5 * u).stroke({ color, width });
        path(-4, 0, 4, 0);
        break;
      case 'key':
        ring(-4, -3, 3.5);
        path(-1, 0, 6, 7, 8, 5);
        path(3, 4, 5, 2);
        break;
      case 'left':
        path(3, -5, -2, 0, 3, 5);
        break;
      case 'right':
        path(-3, -5, 2, 0, -3, 5);
        break;
      case 'exit':
        path(1, -7, 7, -7, 7, 7, 1, 7);
        path(2, 0, -7, 0);
        path(-3, -4, -7, 0, -3, 4);
        break;
      case 'play':
        g.poly([x - 4 * u, y - 6 * u, x + 6 * u, y, x - 4 * u, y + 6 * u]).fill(color);
        break;
      case 'lock':
        path(-4, -2, -4, -5, -2, -7, 2, -7, 4, -5, 4, -2);
        g.roundRect(x - 6 * u, y - 2 * u, 12 * u, 9 * u, 2 * u).stroke({ color, width });
        break;
      case 'chest':
        path(-8, 6, -8, -5, -5, -8, 5, -8, 8, -5, 8, 6, -8, 6);
        path(-8, -1, 8, -1);
        g.rect(x - 2 * u, y - 2 * u, 4 * u, 4 * u).fill(color);
        break;
      case 'speed':
        path(-8, -5, -3, 0, -8, 5);
        path(-1, -5, 4, 0, -1, 5);
        path(5, -5, 9, 0, 5, 5);
        break;
      case 'target':
        ring(0, 0, 6);
        for (const sign of [-1, 1]) {
          path(0, sign * 4, 0, sign * 9);
          path(sign * 4, 0, sign * 9, 0);
        }
        break;
      case 'burst':
        path(0, -9, 2, -3, 9, -3, 4, 1, 6, 8, 0, 4, -6, 8, -4, 1, -9, -3, -2, -3, 0, -9);
        break;
      case 'repair':
        ring(0, 0, 8);
        path(-4, 0, 4, 0);
        path(0, -4, 0, 4);
        break;
      case 'heart':
        path(0, 8, -8, 0, -8, -4, -4, -7, 0, -4, 4, -7, 8, -4, 8, 0, 0, 8);
        break;
      case 'scan':
        ring(0, 0, 8);
        path(-6, 1, -3, 1, -1, -4, 2, 4, 4, 1, 6, 1);
        break;
      case 'snow':
        for (const a of [0, Math.PI / 3, (2 * Math.PI) / 3])
          path(-8 * Math.cos(a), -8 * Math.sin(a), 8 * Math.cos(a), 8 * Math.sin(a));
        ring(0, 0, 2);
        break;
      case 'boss':
        path(-8, -6, -4, -2, 0, -7, 4, -2, 8, -6, 7, 5, -7, 5, -8, -6);
        path(-5, 8, 5, 8);
        break;
      case 'flag':
        path(-6, 9, -6, -8, 7, -8, 4, -4, 7, 0, -6, 0);
        break;
      case 'check':
        path(-6, 0, -2, 4, 6, -5);
        break;
    }
  }
}

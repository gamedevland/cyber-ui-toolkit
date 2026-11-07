import { SeededRandom } from './internal/SeededRandom.js';

import { TerminalUi } from './TerminalUi.js';
import { UiContracts } from './UiContracts.js';

import type { UiBounds } from './types.js';
import type { Graphics } from 'pixi.js';

export class BinaryField {
  static draw(
    g: Graphics,
    bounds: UiBounds,
    cut: number,
    size: number,
    seed: number,
    frame: number,
  ): void {
    UiContracts.bounds(bounds);
    UiContracts.number('cellSize', size, 1);
    UiContracts.number('cut', cut, 0);
    UiContracts.integer('frame', frame, 0);
    UiContracts.integer('seed', seed, -0x80000000, 0xffffffff);
    if (bounds.w <= 2 || bounds.h <= 2) return;
    const random = new SeededRandom(seed ^ Math.imul(frame + 1, 0x9e3779b9));
    const area = { x: bounds.x + 1, y: bounds.y + 1, w: bounds.w - 2, h: bounds.h - 2 };
    const columns = Math.ceil(area.w / size);
    const rows = Math.ceil(area.h / (size * 1.25));
    const cellW = area.w / columns;
    const cellH = area.h / rows;
    for (let row = 0; row < rows; row++)
      for (let column = 0; column < columns; column++) {
        const x = area.x + column * cellW + cellW * 0.2;
        const y = area.y + row * cellH + cellH * 0.15;
        const digitW = cellW * 0.6;
        const digitH = cellH * 0.7;
        if (random.next() > 0.5) {
          TerminalUi.clippedRect(g, area, cut - 1, x + digitW * 0.5, y, 0.8, digitH);
          TerminalUi.clippedRect(g, area, cut - 1, x + digitW * 0.2, y, digitW * 0.3, 0.8);
          TerminalUi.clippedRect(g, area, cut - 1, x, y + digitH - 0.8, digitW, 0.8);
        } else {
          TerminalUi.clippedRect(g, area, cut - 1, x, y, digitW, 0.8);
          TerminalUi.clippedRect(g, area, cut - 1, x, y + digitH - 0.8, digitW, 0.8);
          TerminalUi.clippedRect(g, area, cut - 1, x, y + 0.8, 0.8, digitH - 1.6);
          TerminalUi.clippedRect(g, area, cut - 1, x + digitW - 0.8, y + 0.8, 0.8, digitH - 1.6);
        }
      }
  }
}

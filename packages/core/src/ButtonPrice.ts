import { UiContracts } from './UiContracts.js';

/** Centers a localized action label, currency icon, and amount as one fitted row. */
export class ButtonPrice {
  static layout(
    width: number,
    labelWidth: number,
    amountWidth: number,
    iconSize: number,
    gap: number,
    padding: number,
  ) {
    UiContracts.number('width', width, Number.EPSILON);
    UiContracts.number('labelWidth', labelWidth, 0);
    UiContracts.number('amountWidth', amountWidth, 0);
    UiContracts.number('iconSize', iconSize, Number.EPSILON);
    UiContracts.number('gap', gap, 0);
    UiContracts.number('padding', padding, 0, width / 2);
    const total = labelWidth + amountWidth + iconSize + gap * 2;
    const scale = Math.min(1, (width - padding * 2) / total);
    const left = (width - total * scale) / 2;
    return {
      scale,
      labelX: left + (labelWidth * scale) / 2,
      iconX: left + (labelWidth + gap + iconSize / 2) * scale,
      amountX: left + (labelWidth + gap * 2 + iconSize + amountWidth / 2) * scale,
      iconSize: iconSize * scale,
    };
  }
}

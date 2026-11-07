import { UiContracts } from './UiContracts.js';

export type PanelTransitionInput = {
  readonly offset: number;
  readonly axis?: 'down' | 'right' | 'zoom' | undefined;
  readonly pivotX?: number | undefined;
  readonly pivotY?: number | undefined;
  readonly closing?: boolean | undefined;
};

/** Geometry shared by SDK tweens and hosts that sample animation progress themselves. */
export class PanelTransition {
  static origin(input: PanelTransitionInput) {
    UiContracts.number('offset', input.offset, 0);
    UiContracts.number('pivotX', input.pivotX ?? 0);
    UiContracts.number('pivotY', input.pivotY ?? 0);
    const sx = input.axis === 'right' ? 0.76 : input.axis === 'zoom' ? 0.95 : 1;
    const sy =
      input.axis === 'down' ? (input.closing ? 0.08 : 0.58) : input.axis === 'zoom' ? 0.92 : 1;
    const horizontal = input.axis === 'right';
    return {
      scaleX: sx,
      scaleY: sy,
      x: (input.pivotX ?? 0) * (1 - sx) + (horizontal ? -input.offset : 0),
      y: (input.pivotY ?? 0) * (1 - sy) + (horizontal ? 0 : input.offset),
      alpha: input.axis ? 0.12 : 0,
    };
  }
}

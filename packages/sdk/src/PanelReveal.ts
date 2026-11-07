import { PanelTransition } from '@gamedevland/cyber-ui';
import { BaseTypedAction } from '@gamedevland/engine/layouts';
import { SchemaDecoder as S } from '@gamedevland/engine/validation';

import type { InferDecoded } from '@gamedevland/engine/validation';

type Transform = {
  readonly x: number;
  readonly y: number;
  readonly scaleX: number;
  readonly scaleY: number;
  readonly alpha: number;
};

const configDecoder = S.object({});
const inputDecoder = S.object({
  duration: S.number({ min: 1, max: 2000 }),
  delay: S.number({ min: 0, max: 1000 }),
  offset: S.number({ min: 0, max: 16 }),
  axis: S.optional(S.enumOf(['down', 'right', 'zoom'] as const)),
  pivotX: S.optional(S.number()),
  pivotY: S.optional(S.number()),
  closing: S.optional(S.boolean()),
});

/** Reveals a dedicated animation wrapper relative to its attached layout transform. */
export class PanelReveal extends BaseTypedAction<
  InferDecoded<typeof configDecoder>,
  InferDecoded<typeof inputDecoder>
> {
  protected readonly configDecoder = configDecoder;
  protected readonly inputDecoder = inputDecoder;
  private origin?: Transform;

  protected override onInit(): void {
    const { x, y, alpha, scale } = this.node.view;
    this.origin = { x, y, alpha, scaleX: scale.x, scaleY: scale.y };
  }

  protected execute(input: InferDecoded<typeof inputDecoder>): void {
    this.killOwnedTweens();
    const origin = this.getOrigin();
    const shifted = PanelTransition.origin(input);
    const x = origin.x + shifted.x * origin.scaleX;
    const y = origin.y + shifted.y * origin.scaleY;
    const scaleX = origin.scaleX * shifted.scaleX;
    const scaleY = origin.scaleY * shifted.scaleY;
    const alpha = origin.alpha * shifted.alpha;
    const options = {
      duration: input.duration / 1000,
      delay: input.delay / 1000,
      ease: input.closing ? 'power2.in' : 'power3.out',
    };
    if (input.closing) {
      this.ownTween(this.node.tweens.to({ x, y, alpha }, options));
      this.ownTween(this.node.tweens.scaleXY(scaleX, scaleY, options));
      return;
    }
    this.node.setAlpha(alpha).setScale(scaleX, scaleY).setPosition(x, y);
    this.ownTween(this.node.tweens.to({ alpha: origin.alpha, x: origin.x, y: origin.y }, options));
    if (input.axis) {
      this.ownTween(this.node.tweens.scaleXY(origin.scaleX, origin.scaleY, options));
    }
  }

  protected override onCancel(): void {
    const origin = this.getOrigin();
    this.node
      .setAlpha(origin.alpha)
      .setPosition(origin.x, origin.y)
      .setScale(origin.scaleX, origin.scaleY);
  }

  private getOrigin(): Transform {
    if (!this.origin) throw new Error('PanelReveal must be initialized before use');
    return this.origin;
  }
}

import { BaseTypedComponent } from '@gamedevland/engine/layouts';

import type { UiEffect } from '@gamedevland/cyber-ui';
import type { NodeBase } from '@gamedevland/engine/layouts';

export type UiViewport = {
  readonly width: number;
  readonly height: number;
  readonly cssWidth: number;
  readonly cssHeight: number;
  readonly scale: number;
};

/** SDK owns scheduling and input; toolkit effects receive only their public host contracts. */
export abstract class ToolkitComponent<
  TConfig,
  TNode extends NodeBase = NodeBase,
> extends BaseTypedComponent<TConfig, TNode> {
  private readonly effects = new Set<UiEffect>();
  private reducedMotion = false;

  protected get uiViewport(): UiViewport {
    const virtual = this.node.screen.getVirtualSize();
    const css = this.node.screen.getViewportSize();
    return {
      ...virtual,
      cssWidth: css.width,
      cssHeight: css.height,
      scale: this.node.screen.getScale(),
    };
  }

  protected ownEffect<TEffect extends UiEffect>(effect: TEffect): TEffect {
    effect.setActive(this.enabled);
    effect.setReducedMotion(this.reducedMotion);
    this.effects.add(effect);
    return effect;
  }

  protected setUiReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
    for (const effect of this.effects) effect.setReducedMotion(reduced);
  }

  protected override onUpdate(deltaSeconds: number): void {
    for (const effect of this.effects) effect.update(deltaSeconds);
  }

  protected override onEnable(): void {
    for (const effect of this.effects) effect.setActive(true);
  }

  protected override onDisable(): void {
    for (const effect of this.effects) effect.setActive(false);
  }

  override onDetach(): void | Promise<void> {
    for (const effect of this.effects) effect.dispose();
    this.effects.clear();
    return super.onDetach();
  }
}

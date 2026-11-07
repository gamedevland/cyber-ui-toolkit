import type { GlitchTarget } from '../SurfaceGlitch.js';
import type { Graphics } from 'pixi.js';

type Slice = { readonly mask: Graphics; readonly copy: Graphics; readonly offset: number };

/** Owns masks and displaced copies, never the source Graphics or its shared context. */
export class GlitchSlices {
  private active?: GlitchTarget;
  private cutout?: Graphics;
  private slices: readonly Slice[] = [];

  dispose(): void {
    this.restore();
    for (const { mask, copy } of this.slices) {
      copy.destroy({ context: false });
      mask.destroy({ context: true });
    }
    this.slices = [];
    this.cutout?.destroy({ context: true });
    delete this.cutout;
  }

  draw(target: GlitchTarget, shift: number, bandOffset: number): void {
    const active = this.active;
    if (
      !active ||
      active.surface !== target.surface ||
      active.x !== target.x ||
      active.y !== target.y ||
      active.w !== target.w ||
      active.h !== target.h ||
      active.surface.parent !== this.cutout?.parent
    )
      this.attachSlices(target, bandOffset);
    const distance = Math.min(1, target.w / 140) * shift;
    target.surface.updateLocalTransform();
    this.cutout?.setFromMatrix(target.surface.localTransform);
    for (const { mask, copy, offset } of this.slices) {
      const x = Math.round(distance * offset);
      const y = Math.round(distance * offset * 0.22);
      copy.setFromMatrix(target.surface.localTransform);
      mask.setFromMatrix(target.surface.localTransform);
      copy.context = target.surface.context;
      copy.alpha = target.surface.alpha;
      copy.tint = target.surface.tint;
      copy.blendMode = target.surface.blendMode;
      copy.visible = target.surface.visible;
      copy.position.x += x;
      copy.position.y += y;
      mask.position.x += x;
      mask.position.y += y;
    }
  }

  private attachSlices(target: GlitchTarget, bandOffset: number): void {
    this.restore();
    const source = target.surface;
    const parent = source.parent;
    if (!parent) throw new Error('SurfaceGlitch requires an attached Graphics');
    if (source.mask) throw new Error('SurfaceGlitch requires an unmasked Graphics');
    const cutout = (this.cutout ??= source.clone(true).clear());
    if (!this.slices.length) {
      this.slices = [1, -0.72, 0.54].map((offset) => ({
        offset,
        mask: cutout.clone(true),
        copy: cutout.clone(),
      }));
      cutout.eventMode = 'none';
      for (const { mask, copy } of this.slices) {
        mask.eventMode = 'none';
        copy.eventMode = 'none';
      }
    }
    cutout.clear();
    const left = target.x - 2;
    const width = target.w + 4;
    const thickness = Math.max(3, Math.min(34, target.h * 0.18));
    let index = parent.getChildIndex(source) + 1;
    parent.addChildAt(cutout, index++);
    for (const [i, { mask, copy }] of this.slices.entries()) {
      const top = target.y + target.h * (bandOffset + i * 0.28);
      cutout.rect(left, top, width, thickness);
      mask.clear().rect(left, top, width, thickness).fill(0xffffff);
      // Share the live drawing so changes to the panel also reach the displaced strips.
      copy.context = source.context;
      parent.addChildAt(copy, index++);
      parent.addChildAt(mask, index++);
      copy.mask = mask;
    }
    cutout.fill(0xffffff);
    source.setMask({ mask: cutout, inverse: true });
    source.updateLocalTransform();
    cutout.setFromMatrix(source.localTransform);
    this.active = target;
  }

  restore(): void {
    const cutout = this.cutout;
    if (!this.active || !cutout) return;
    const source = this.active.surface;
    source.mask = null;
    source.setMask({ inverse: false });
    cutout.removeFromParent();
    for (const { mask, copy } of this.slices) {
      copy.mask = null;
      copy.removeFromParent();
      copy.context = cutout.context;
      mask.removeFromParent();
    }
    delete this.active;
  }
}

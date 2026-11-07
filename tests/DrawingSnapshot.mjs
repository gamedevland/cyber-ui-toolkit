import { createHash } from 'node:crypto';

export class DrawingSnapshot {
  static hash(graphics) {
    const commands = graphics.context.instructions.map(({ action, data }) => ({
      action,
      path: data.path.instructions,
      style: {
        color: data.style.color,
        alpha: data.style.alpha,
        width: data.style.width,
        alignment: data.style.alignment,
        cap: data.style.cap,
        join: data.style.join,
        miterLimit: data.style.miterLimit,
        pixelLine: data.style.pixelLine,
      },
    }));
    return createHash('sha256').update(JSON.stringify(commands)).digest('hex');
  }
}

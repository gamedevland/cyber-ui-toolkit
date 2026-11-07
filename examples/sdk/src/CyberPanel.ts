import { CyberPreset, TerminalGlass } from '@gamedevland/cyber-ui';
import { ToolkitComponent } from '@gamedevland/cyber-ui-sdk';
import { SchemaDecoder as S } from '@gamedevland/engine/validation';

import type { Graphics } from '@gamedevland/engine/layouts';
import type { InferDecoded } from '@gamedevland/engine/validation';

const configDecoder = S.object({
  width: S.number({ min: 48 }),
  height: S.number({ min: 28 }),
  cut: S.number({ min: 0 }),
});

/** Attach to a Graphics node; its parent owns positioning and application input. */
export class CyberPanel extends ToolkitComponent<InferDecoded<typeof configDecoder>, Graphics> {
  protected readonly configDecoder = configDecoder;

  protected override onReady(): void {
    const { width, height, cut } = this.config;
    const palette = CyberPreset.palette;
    TerminalGlass.draw(
      this.node.view.clear(),
      0,
      0,
      width,
      height,
      cut,
      palette.panel,
      palette.panelEdge,
      palette.accent,
      palette.text,
    );
  }
}

# @gamedevland/cyber-ui

Procedural cyberpunk UI surfaces, vector icons, and host-driven effects for PixiJS 8.
ES modules and strict TypeScript declarations. No GameDevLand SDK dependency.

```sh
npm install pixi.js @gamedevland/cyber-ui
```

```ts
import { Graphics } from 'pixi.js';
import { CyberPreset, TerminalGlass, TerminalUi } from '@gamedevland/cyber-ui';

const surface = new Graphics();
const theme = CyberPreset.palette;
TerminalGlass.draw(
  surface,
  0,
  0,
  320,
  180,
  12,
  theme.panel,
  theme.panelEdge,
  theme.accent,
  theme.text,
);
TerminalUi.icon(surface, 'gear', 28, 28, 24, theme.accent);
// Attach surface to your existing Pixi scene.
```

## API

- `TerminalUi`: beveled plates, traces, etching, clipped paths, 27 vector icons.
- `TerminalGlass`: layered surfaces and focus accents.
- `ButtonSurface`: primary/module/danger/icon/nav/segment/switch/utility/line skins.
- `TriangleLoader`, `TextEcho`, `SurfaceGlitch`: seeded or host-timed effects.
- `BinaryField`, `SignalBrackets`, `TerminalSweep`, `FaultGlyph`, `SignalLost`: drawing helpers.
- `PanelTransition`: transition geometry.
- `CyberPreset`: optional immutable palettes and effect options.
- `AnimatedEffect`, `UiEffect`: base lifecycle and structural host contract.

Drawing uses local logical Pixi coordinates. Surfaces append instructions: clear before
rebuilding a drawing. Text, input, hit areas, focus, layout and audio belong to the host.
`ButtonSurface` state affects appearance only; disable input separately.

Effects receive `update(deltaSeconds)` in seconds, `setActive(boolean)` for pause, and
`setReducedMotion(boolean)` for the host's preference. Options ending in `Ms` are milliseconds.
Call `dispose()` before destroying borrowed views; disposal is idempotent.

`SurfaceGlitch` accepts attached, unmasked Graphics and borrows their live contexts. It does
not include text or arbitrary Container snapshots. All effects leave host contexts alive.
Core does not create renderers, tickers, DOM listeners, asset loaders, or audio players.

[Full API guide and examples](https://github.com/gamedevland/cyber-ui-toolkit#readme)
· [Source and issues](https://github.com/gamedevland/cyber-ui-toolkit)

MIT License. PixiJS `>=8.16.0 <9`. Node.js 22.12+ for Node usage.

# Cyber UI Toolkit

Procedural cyberpunk UI for **PixiJS 8** and TypeScript: beveled panels, glass surfaces,
button skins, vector icons, and deterministic visual effects.

The toolkit draws into your existing Pixi objects. Your application owns layout, text,
input, accessibility, audio, and the render loop. No extra renderer, ticker, fonts,
textures, or game services are created by core.

## Packages

| Package                     | Purpose                                        | Peers                                             |
| --------------------------- | ---------------------------------------------- | ------------------------------------------------- |
| `@gamedevland/cyber-ui`     | Surfaces, icons, geometry, effects             | PixiJS `>=8.16.0 <9`                              |
| `@gamedevland/cyber-ui-sdk` | Optional component lifecycle and reveal action | Core `^0.1.0`, GameDevLand SDK `0.0.11`, PixiJS 8 |

ES modules with TypeScript declarations. MIT licensed. Development and Node usage require
Node.js 22.12 or later. Browser applications use a bundler such as Vite.

```sh
npm install pixi.js @gamedevland/cyber-ui
```

## Quick start

Use this in a TypeScript/Vite application:

```ts
import { Application, Graphics, Rectangle, Text } from 'pixi.js';
import { ButtonSurface, CyberPreset, TerminalGlass, TerminalUi } from '@gamedevland/cyber-ui';

const app = new Application();
await app.init({ width: 480, height: 320, background: 0x07111d, antialias: true });
document.body.appendChild(app.canvas);
const theme = CyberPreset.palette;

const panel = app.stage.addChild(new Graphics());
TerminalGlass.draw(
  panel,
  24,
  24,
  432,
  272,
  12,
  theme.panel,
  theme.panelEdge,
  theme.accent,
  theme.text,
);

const button = app.stage.addChild(new Graphics());
button.position.set(56, 208);
ButtonSurface.draw(
  button,
  {
    width: 220,
    height: 56,
    variant: 'primary',
    enabled: true,
    selected: false,
  },
  theme,
);
TerminalUi.icon(button, 'play', 28, 28, 20, theme.background);

const label = button.addChild(
  new Text({
    text: 'START',
    style: { fontFamily: 'monospace', fontSize: 18, fill: theme.background },
  }),
);
label.anchor.set(0.5);
label.position.set(124, 28);
label.eventMode = 'none';

button.eventMode = 'static';
button.cursor = 'pointer';
button.hitArea = new Rectangle(0, 0, 220, 56);
button.on('pointertap', () => {
  console.log('Start requested');
});
```

These input calls are for a standalone Pixi host. SDK applications use `node.input` inside
components and emit application intent through their event/FSM flow.

## Surfaces and icons

All positions are **local logical Pixi units**, before parent scaling. Icon coordinates
specify the center; surface coordinates specify the top-left corner.

```ts
// Compact plate or counter background: x, y, width, height, corner cut, fill, border.
TerminalUi.plate(panel, 56, 64, 160, 36, 7, theme.inset, theme.panelEdge);
TerminalUi.icon(panel, 'credit', 76, 82, 18, theme.accent);

// Optional decorations append to the same Graphics.
TerminalUi.traces(panel, 24, 24, 432, 272, theme.accent);
TerminalUi.etch(panel, 24, 24, 432, 272, theme.accent);
TerminalGlass.focus(panel, 24, 24, 432, 272, theme.accent);
```

Drawing methods append instructions. **Clear once before rebuilding a surface**; do not clear
between decorations that belong to the same drawing. Redraw static surfaces when their size,
theme, or visual state changes, rather than every frame. `TriangleLoader.draw()` clears its
two dedicated Graphics itself.

### Button skins

`ButtonSurface.draw(graphics, options, palette)` paints at `(0, 0)`.
`options` contains `width`, `height`, `variant`, `enabled`, `selected`, and optional
`explicitAccent` for the module accent rail.

| Variant   | Drawing                                                   |
| --------- | --------------------------------------------------------- |
| `primary` | Solid accent when enabled; glass otherwise                |
| `module`  | Glass surface with optional accent rail                   |
| `danger`  | Glass with danger accent                                  |
| `icon`    | Rounded inset surface, highlighted when selected          |
| `nav`     | Selection background and top marker when selected         |
| `segment` | Filled rounded selection when selected                    |
| `switch`  | Glass surface; add the knob with `ButtonSurface.toggle()` |
| `utility` | Bottom rule                                               |
| `line`    | No background; use with a host-owned label/icon           |

```ts
ButtonSurface.toggle(button, 220, 56, true, theme);
```

`enabled` changes the skin, not event routing. The host must also disable input and style the
label as appropriate. Hover, pressed, focus, keyboard navigation, and hit areas are host-owned.
Keep controls large enough for their decorations and labels; skins do not measure text.

### Icons

`TerminalUi.icon(graphics, name, centerX, centerY, size, color)` accepts the exported
`TerminalIcon` union:

```text
chip battle agents skills quests gear bolt calendar credit capsule key
left right exit play lock chest check speed target burst repair heart
scan snow boss flag
```

Colors are numeric RGB values. `CyberPreset.palette` supplies defaults; customize a copy:

```ts
const palette = { ...CyberPreset.palette, accent: 0x68e0cb };
```

## Effects and time

`TriangleLoader`, `TextEcho`, and `SurfaceGlitch` implement `UiEffect`:

```ts
update(deltaSeconds: number): void;
setActive(active: boolean): void;
setReducedMotion(reduced: boolean): void;
dispose(): void;
```

The host supplies finite, non-negative **seconds**. Configuration fields ending in `Ms`
use milliseconds. Pausing freezes effect time. The same seed and sequence of deltas produce
the same animation. `dispose()` is idempotent; other calls on a disposed effect throw.

### Triangle loader

```ts
import { CyberPreset, TriangleLoader } from '@gamedevland/cyber-ui';

const emblem = app.stage.addChild(new Graphics());
const particles = app.stage.addChild(new Graphics());
const loader = new TriangleLoader(CyberPreset.triangle);
loader.setReducedMotion(matchMedia('(prefers-reduced-motion: reduce)').matches);

const tick = (ticker: import('pixi.js').Ticker) => {
  loader.update(ticker.deltaMS / 1000);
  loader.draw(
    emblem,
    particles,
    { x: app.screen.width / 2, y: 120, radius: 64, scale: 1 },
    CyberPreset.trianglePalette,
  );
};
app.ticker.add(tick);

// When removing this screen, before destroying its borrowed Graphics:
app.ticker.remove(tick);
loader.dispose();
```

`draw()` accepts new bounds without resetting time. Reduced motion produces a static frame.
`outerRadius(radius)` returns the clearance needed for the outer layers.

### Text echo

```ts
const echoEffect = new TextEcho(CyberPreset.textEcho);
// Each frame, with two host-created Text objects:
echoEffect.update(deltaSeconds);
echoEffect.draw(title, titleEcho, centerX, centerY);
```

The host supplies matching text content, anchors, font, and colors. `offset(phaseOffsetMs?)`
returns the current displacement without drawing. Reduced motion hides the echo.

### Surface glitch

```ts
const glitch = new SurfaceGlitch(CyberPreset.glitch);
glitch.show('menu', [{ surface: button, x: 0, y: 0, w: 220, h: 56 }], 200);
// Each frame:
glitch.update(deltaSeconds);
// Remove targets or destroy this effect before destroying the screen:
glitch.hide();
glitch.dispose();
```

Import `TextEcho` and `SurfaceGlitch` from core when using these examples.
`show(key, targets, revealDelayMs)` registers local bounds. Reusing the key updates targets
without restarting the schedule; changing the key restarts it. Targets must be attached,
unmasked Graphics. Source transforms and live context changes are supported. Text, sibling
objects, filters, and arbitrary Container snapshots are outside this effect's contract.
Do not replace the target's mask while the effect owns it. Pause, reduced motion, hide, and
disposal remove temporary strips and restore the source. Borrowed contexts are never destroyed.

### Other drawing helpers

| API                                                                       | Host-supplied input                                                       |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `BinaryField.draw(g, bounds, cut, cellSize, seed, frame)`                 | Integer frame index; call `g.fill()` afterward                            |
| `TerminalSweep.draw(g, x, y, w, h, progress, color, reduced, direction?)` | Progress in `[0, 1)`; `down` or `right`                                   |
| `SignalBrackets.draw(...)`                                                | `BracketOptions`, layout, elapsed milliseconds, motion preference, colors |
| `FaultGlyph.draw(g, x, y, color, echo, alpha, distortion, scale?)`        | Fault symbol state                                                        |
| `SignalLost.draw(g, width, height, progress, palette)`                    | Progress in `[0, 1]`; returns label center, fade, and shift               |
| `PanelTransition.origin(input)`                                           | Offset, optional `down`/`right`/`zoom` axis, pivot and closing flag       |

These helpers append instructions and do not run clocks. `SignalLost` and the decorative
helpers require the host to select a static state or suppress motion when needed.
Public options and result shapes are available in the shipped TypeScript declarations.
External JSON must be decoded by the host before it reaches these typed APIs.

## GameDevLand SDK

```sh
npm install @gamedevland/cyber-ui @gamedevland/cyber-ui-sdk @gamedevland/engine@0.0.11 pixi.js
```

Use SDK-created Graphics through `node.view` or `node.getChildGraphics(id).view`.
Do not create a second Application or ticker inside a component.

- Extend `ToolkitComponent<TConfig, TNode>` and declare your SDK config decoder.
- Register stateful effects with `ownEffect()` in `onReady()`.
- Pass the host preference through `setUiReducedMotion()`, including later preference changes.
- Overrides of update/enable/disable/detach hooks must preserve the base hooks. Return the
  base detach result so SDK cleanup can finish.
- `uiViewport` separates virtual width/height, CSS width/height, and screen scale. Node-local
  bounds still come from your layout.
- Register `PanelReveal` as an SDK action for a dedicated animation wrapper. It preserves
  the transform captured at attachment; cancellation restores it. Duration/delay are authored
  milliseconds. Do not animate or relayout that wrapper independently while the action owns it.

See the [SDK package guide](packages/sdk/README.md) and the typechecked
[CyberPanel component](examples/sdk/src/CyberPanel.ts).

## Develop and verify

```sh
npm ci
npm run check
npm run demo
```

The [standalone gallery](examples/standalone/src/Gallery.ts) demonstrates all button variants,
resizing, palette changes, pause, reduced motion, and effects. `npm run demo` starts Vite;
`npm run build:demo` builds the gallery without the SDK adapter.

`npm run check` runs strict type checking, lint, formatting, tests, and the gallery build.
Tests cover vector regression fixtures, host resource ownership, effect timing, real SDK
component lifecycle, and npm archive contents. Vector fingerprints do not verify GPU pixels,
font layout, browser interaction, or mobile performance; check those in the target application.

```sh
npm run pack
```

This builds both packages and writes installable `.tgz` archives to `artifacts/`.
Only compiled modules, declarations, source maps, package README, metadata, and license ship.
To install before registry publication, pass the archives to `npm install`.

Releases use matching package versions. Run the **Publish npm packages** GitHub Actions
workflow on the reviewed release commit after checks pass. Configure npm trusted publishing
for that workflow, or provide its `NPM_TOKEN` secret. Core publishes before the SDK adapter;
CI publication includes provenance. Publishing requires access to the `@gamedevland` scope.

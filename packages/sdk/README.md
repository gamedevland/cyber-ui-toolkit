# @gamedevland/cyber-ui-sdk

GameDevLand SDK lifecycle adapter for Cyber UI Toolkit. Uses the host SDK's public APIs,
Graphics, input routing, tweens and render loop.

```sh
npm install @gamedevland/cyber-ui @gamedevland/cyber-ui-sdk @gamedevland/engine@0.0.11 pixi.js
```

## A panel component

```ts
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
```

Register the component in your `GlobalDiDefinition.registerComponents()`:

```ts
group.add('CyberPanel', CyberPanel);
```

The `Graphics` element factory must also be registered. Add the component to a Graphics
node in your SDK layout:

```json
{
  "type": "Graphics",
  "components": {
    "surface": {
      "type": "CyberPanel",
      "data": { "width": 320, "height": 180, "cut": 12 }
    }
  }
}
```

The parent layout owns positioning. Add Text nodes for content and use `node.input` for
interaction. Changing a component's appearance does not execute application commands.

## Animated components

In `onReady()`, register effects with `this.ownEffect(new TriangleLoader(options))`.
Base `onUpdate(deltaSeconds)` advances owned effects. Render them into child Graphics after
calling `super.onUpdate(deltaSeconds)` exactly once. Enable/disable pauses them; detach
disposes them before SDK views are removed. Call `setUiReducedMotion(reduced)` when the host
preference changes; later-owned effects inherit the preference too.

Overrides of lifecycle hooks preserve the base hooks. In an overridden `onDetach()`, return
`super.onDetach()` after releasing your own resources. Do not dispose effects registered
with `ownEffect()` separately. `uiViewport` returns logical width/height, CSS width/height,
and scale; local bounds remain the application's responsibility.

## PanelReveal action

Register in `GlobalDiDefinition.registerServices()`:

```ts
import { DiTokens } from '@gamedevland/engine/di';
import { PanelReveal } from '@gamedevland/cyber-ui-sdk';

registrar.transientClass(DiTokens.action('PanelReveal'), PanelReveal);
```

Attach to a dedicated Container wrapper in the layout:

```json
{
  "type": "Container",
  "actions": { "reveal": { "type": "PanelReveal" } }
}
```

Invoke through the SDK node action facade:

```ts
void node.runAction('reveal', {
  duration: 240,
  delay: 0,
  offset: 8,
  axis: 'down',
});
```

`duration`: 1–2000 ms; `delay`: 0–1000 ms; `offset`: 0–16 local units.
`axis` is optional (`down`, `right`, `zoom`); `pivotX`, `pivotY`, and `closing` are optional.
The action captures the wrapper transform at attachment. Opening returns to that transform;
closing moves/scales/fades away; cancellation restores it. Keep layout and other animations
on a parent or child so they do not compete for the wrapper's transform. Use a static state
instead when reduced motion is enabled. The action schedules SDK-owned tweens; invocation
does not wait for their completion.

[Full guide](https://github.com/gamedevland/cyber-ui-toolkit#readme)
· [Typechecked component](https://github.com/gamedevland/cyber-ui-toolkit/blob/main/examples/sdk/src/CyberPanel.ts)

MIT License. Core `^0.1.0`, SDK `0.0.11`, PixiJS `>=8.16.0 <9`.

import assert from 'node:assert/strict';
import test from 'node:test';
import { Container, Graphics } from '@gamedevland/engine/layouts';
import { SchemaDecoder as S } from '@gamedevland/engine/validation';
import { CyberPreset, SurfaceGlitch, TextEcho, TriangleLoader } from '@gamedevland/cyber-ui';
import { ToolkitComponent } from '@gamedevland/cyber-ui-sdk';

test('effects use SDK-created Pixi objects without loading a second runtime into core', () => {
  const root = Container.create('root', { type: 'Container' }, {}).view;
  const emblem = Graphics.create('emblem', { type: 'Graphics' }, {}).view;
  const dust = Graphics.create('dust', { type: 'Graphics' }, {}).view;
  root.addChild(emblem, dust);
  const loader = new TriangleLoader(CyberPreset.triangle);
  loader.update(0.016);
  loader.draw(emblem, dust, { x: 160, y: 100, radius: 84, scale: 1 }, CyberPreset.trianglePalette);
  assert.ok(emblem.context.instructions.length > 0);
  assert.equal(dust.context.instructions.length, CyberPreset.triangle.particles);
  const sourceContext = emblem.context;
  const effect = new SurfaceGlitch(CyberPreset.glitch);
  effect.show('SDK', [{ surface: emblem, x: -100, y: -100, w: 200, h: 200 }], 0);
  effect.update(0);
  assert.equal(root.children.length, 9);
  effect.dispose();
  loader.dispose();
  assert.equal(root.children.length, 2);
  assert.equal(sourceContext.destroyed, false);
  assert.equal(Boolean(emblem.mask), false);
});

class HostComponent extends ToolkitComponent {
  configDecoder = S.object({});
  effect;
  onReady() {
    this.effect = this.ownEffect(new TextEcho(CyberPreset.textEcho));
  }
  reduce() {
    this.setUiReducedMotion(true);
  }
  viewport() {
    return this.uiViewport;
  }
}

test('real SDK component enable/disable/detach drives toolkit lifecycle', async () => {
  const component = new HostComponent();
  const node = Container.create('root', { type: 'Container' }, {});
  component.init(node, {});
  component.ready();
  component.update(0.1);
  assert.equal(component.effect.elapsedSeconds, 0);
  component.enable();
  component.update(0.1);
  assert.equal(component.effect.elapsedSeconds, 0.1);
  component.disable();
  component.update(10);
  assert.equal(component.effect.elapsedSeconds, 0.1);
  component.enable();
  component.update(0.1);
  assert.equal(component.effect.elapsedSeconds, 0.2);
  component.reduce();
  assert.equal(component.effect.offset(), 0);
  component.onDetach();
  component.onDetach();
  assert.throws(() => component.effect.update(0), /disposed/);
  await component.completeDetach();
  assert.equal(node.view.destroyed, false);
  component.init(node, {});
  component.ready();
  component.enable();
  component.update(0.05);
  assert.equal(component.effect.elapsedSeconds, 0.05);
});

test('viewport mapping keeps CSS size, logical size, and scale separate', () => {
  const component = new HostComponent();
  // A narrow host boundary fixture; renderer and browser behavior are not simulated.
  component.init(
    {
      screen: {
        getVirtualSize: () => ({ width: 720, height: 1280 }),
        getViewportSize: () => ({ width: 360, height: 640 }),
        getScale: () => 0.5,
      },
    },
    {},
  );
  assert.deepEqual(component.viewport(), {
    width: 720,
    height: 1280,
    cssWidth: 360,
    cssHeight: 640,
    scale: 0.5,
  });
});

class LateEffectComponent extends ToolkitComponent {
  configDecoder = S.object({});
  effect;
  onReady() {
    this.setUiReducedMotion(true);
    this.effect = this.ownEffect(new TextEcho(CyberPreset.textEcho));
    this.ownEffect(this.effect);
  }
}

test('newly-owned effects inherit reduced motion and are updated only once', () => {
  const component = new LateEffectComponent();
  component.init(Container.create('root', { type: 'Container' }, {}), {});
  component.ready();
  component.enable();
  component.update(0.1);
  assert.equal(component.effect.offset(), 0);
  assert.equal(component.effect.elapsedSeconds, 0.1);
  component.onDetach();
});

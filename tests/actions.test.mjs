import assert from 'node:assert/strict';
import test from 'node:test';
import { Container } from '@gamedevland/engine/layouts';
import { PanelReveal } from '@gamedevland/cyber-ui-sdk';

class TweenRecorder {
  calls = [];
  killed = 0;
  handle() {
    return {
      kill: () => {
        this.killed++;
      },
      then: () => new Promise(() => {}),
    };
  }
  to(properties, options) {
    this.calls.push({ properties, options });
    return this.handle();
  }
  scaleXY(x, y, options) {
    this.calls.push({ scale: { x, y }, options });
    return this.handle();
  }
}

test('reveal uses the attached transform, replaces tweens and restores it on cancellation', () => {
  const node = Container.create('panel', { type: 'Container' }, {});
  node.setPosition(40, 60).setScale(2, 3).setAlpha(0.8);
  const tweens = new TweenRecorder();
  Object.defineProperty(node, 'tweens', { value: tweens });
  const action = new PanelReveal();
  action.init(node, {});
  action.run({ duration: 240, delay: 20, offset: 8, axis: 'down' });
  assert.equal(node.view.x, 40);
  assert.equal(node.view.y, 84);
  assert.equal(node.view.scale.y, 3 * 0.58);
  assert.equal(node.view.alpha, 0.8 * 0.12);
  assert.deepEqual(tweens.calls[0], {
    properties: { alpha: 0.8, x: 40, y: 60 },
    options: { duration: 0.24, delay: 0.02, ease: 'power3.out' },
  });
  action.run({ duration: 100, delay: 0, offset: 4, axis: 'right', closing: true });
  assert.equal(tweens.killed, 2);
  assert.deepEqual(tweens.calls[2].properties, { x: 32, y: 60, alpha: 0.8 * 0.12 });
  action.cancel();
  assert.equal(tweens.killed, 4);
  assert.equal(node.view.x, 40);
  assert.equal(node.view.y, 60);
  assert.equal(node.view.scale.x, 2);
  assert.equal(node.view.scale.y, 3);
  assert.equal(node.view.alpha, 0.8);
});

test('SDK decoding rejects invalid reveal input before mutating the node', () => {
  const node = Container.create('panel', { type: 'Container' }, {});
  node.setPosition(40, 60);
  const action = new PanelReveal();
  action.init(node, {});
  assert.throws(() => action.run({ duration: 0, delay: 0, offset: 1 }));
  assert.throws(() => action.run({ duration: 100, delay: 0, offset: 17 }));
  assert.equal(node.view.x, 40);
  assert.equal(node.view.y, 60);
});

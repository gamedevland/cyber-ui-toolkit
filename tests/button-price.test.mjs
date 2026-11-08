import assert from 'node:assert/strict';
import test from 'node:test';
import { ButtonPrice } from '@gamedevland/cyber-ui';

test('localized purchase rows stay centered and fit narrow buttons without overlapping currency amounts', () => {
  for (const width of [90, 160, 300])
    for (const label of [28, 180]) {
      const row = ButtonPrice.layout(width, label, 30, 15, 6, 12);
      const left = row.labelX - (label * row.scale) / 2;
      const right = row.amountX + (30 * row.scale) / 2;
      assert.ok(left >= 12 - 1e-6 && right <= width - 12 + 1e-6);
      assert.ok(Math.abs((left + right) / 2 - width / 2) < 1e-6);
      assert.ok(row.labelX + (label * row.scale) / 2 < row.iconX - row.iconSize / 2);
      assert.ok(row.iconX + row.iconSize / 2 < row.amountX - (30 * row.scale) / 2);
    }
});

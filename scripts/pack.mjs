import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const destination = resolve(root, 'artifacts');
mkdirSync(destination, { recursive: true });
for (const workspace of ['@gamedevland/cyber-ui', '@gamedevland/cyber-ui-sdk']) {
  execFileSync('npm', ['pack', '--workspace', workspace, '--pack-destination', destination], {
    cwd: root,
    stdio: 'inherit',
  });
}

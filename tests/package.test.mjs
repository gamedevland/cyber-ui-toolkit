import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

test('packed core runs in a clean directory without SDK or Pixi runtime imports', () => {
  const workspace = resolve(import.meta.dirname, '..');
  const directory = mkdtempSync(resolve(tmpdir(), 'cyber-ui-core-'));
  try {
    const packed = JSON.parse(
      execFileSync(
        'npm',
        ['pack', '--workspace', '@gamedevland/cyber-ui', '--pack-destination', directory, '--json'],
        { cwd: workspace, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
      ),
    );
    const archive = resolve(directory, packed[0].filename);
    execFileSync('tar', ['-xzf', archive, '-C', directory]);
    const manifest = JSON.parse(readFileSync(resolve(directory, 'package/package.json'), 'utf8'));
    assert.notEqual(manifest.private, true);
    assert.equal(manifest.license, 'MIT');
    assert.equal(manifest.dependencies, undefined);
    assert.deepEqual(Object.keys(manifest.peerDependencies), ['pixi.js']);
    const entry = pathToFileURL(resolve(directory, 'package/dist/index.js')).href;
    const result = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '--eval',
        `const toolkit = await import(${JSON.stringify(entry)}); const effect = new toolkit.TextEcho(toolkit.CyberPreset.textEcho); effect.update(0.09); if (effect.offset() !== -0.5) throw new Error('Unexpected animation state'); console.log('independent core ok');`,
      ],
      { cwd: directory, encoding: 'utf8' },
    );
    assert.match(result, /independent core ok/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

for (const name of ['cyber-ui', 'cyber-ui-sdk']) {
  test(`${name} archive contains only public package assets`, () => {
    const workspace = resolve(import.meta.dirname, '..');
    const output = JSON.parse(
      execFileSync('npm', ['pack', '--workspace', `@gamedevland/${name}`, '--dry-run', '--json'], {
        cwd: workspace,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }),
    )[0];
    const paths = output.files.map(({ path }) => path);
    assert.ok(paths.includes('LICENSE'));
    assert.ok(paths.includes('README.md'));
    assert.ok(paths.includes('dist/index.js'));
    assert.ok(paths.includes('dist/index.d.ts'));
    assert.ok(paths.every((path) => /^(dist\/|README\.md$|LICENSE$|package\.json$)/.test(path)));
    assert.ok(!paths.some((path) => /AGENTS|PLAN|experiment|node_modules|\.tgz/.test(path)));
    const manifest = JSON.parse(
      readFileSync(
        resolve(workspace, `packages/${name === 'cyber-ui' ? 'core' : 'sdk'}/package.json`),
        'utf8',
      ),
    );
    assert.equal(manifest.version, '0.1.0');
    assert.equal(manifest.publishConfig.access, 'public');
    assert.equal(
      manifest.repository.url,
      'git+https://github.com/gamedevland/cyber-ui-toolkit.git',
    );
  });
}

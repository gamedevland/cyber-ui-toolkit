import preset from './presets/default.json' with { type: 'json' };

import type { GlitchOptions, TextEchoOptions, TriangleOptions, TrianglePalette } from './types.js';

/** Optional defaults; caller configuration is never loaded from a game or SDK. */
export class CyberPreset {
  static readonly triangle: Readonly<TriangleOptions> = Object.freeze(preset.triangle);
  static readonly trianglePalette: Readonly<TrianglePalette> = Object.freeze(
    preset.trianglePalette,
  );
  static readonly textEcho: Readonly<TextEchoOptions> = Object.freeze(preset.textEcho);
  static readonly glitch: Readonly<GlitchOptions> = Object.freeze(preset.glitch);
  static readonly palette = Object.freeze(preset.palette);
}

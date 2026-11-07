export type UiBounds = {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
};

/** Values are logical, local Pixi units; time deltas are seconds. */
export interface UiEffect {
  update(deltaSeconds: number): void;
  setActive(active: boolean): void;
  setReducedMotion(reduced: boolean): void;
  dispose(): void;
}

export type TriangleOptions = {
  readonly cycleMs: number;
  readonly spinDelayMs: number;
  readonly spinDurationMs: number;
  readonly layers: number;
  readonly layerGap: number;
  readonly layerLift: number;
  readonly strokeWidth: number;
  readonly haloWidth: number;
  readonly haloAlpha: number;
  readonly echoAlpha: number;
  readonly particles: number;
  readonly particleSize: number;
  readonly particleSpread: number;
  readonly particleAlpha: number;
  readonly seed: number;
};
export type TrianglePalette = {
  readonly accent: number;
  readonly secondary: number;
  readonly highlight: number;
  readonly text: number;
};
export type TriangleLayout = {
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly scale: number;
};
export type TextEchoOptions = {
  readonly frameMs: number;
  readonly cycleMs: number;
  readonly shift: number;
};
export type GlitchOptions = {
  readonly durationMs: number;
  readonly minDelayMs: number;
  readonly spreadMs: number;
  readonly seed: number;
};

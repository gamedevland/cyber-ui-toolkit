import {
  BinaryField,
  ButtonSurface,
  CyberPreset,
  SignalLost,
  SurfaceGlitch,
  TerminalGlass,
  TerminalUi,
  TextEcho,
  TriangleLoader,
} from '@gamedevland/cyber-ui';
import { Application, Container, Graphics, Rectangle, Text } from 'pixi.js';

import type { ButtonVariant, GlitchTarget } from '@gamedevland/cyber-ui';
import type { Ticker } from 'pixi.js';

/** A plain Pixi host that supplies the same API inputs as the SDK adapter. */
export class Gallery {
  private readonly app = new Application();
  private readonly loader = new TriangleLoader(CyberPreset.triangle);
  private readonly echo = new TextEcho(CyberPreset.textEcho);
  private readonly glitch = new SurfaceGlitch(CyberPreset.glitch);
  private readonly emblem = new Graphics();
  private readonly dust = new Graphics();
  private readonly panel = new Graphics();
  private readonly binary = new Graphics();
  private readonly title = new Text({
    text: 'INITIALIZING SYSTEM',
    style: { fontFamily: 'monospace', fontSize: 15, fill: 0x70ccff },
  });
  private readonly titleEcho = new Text({
    text: 'INITIALIZING SYSTEM',
    style: { fontFamily: 'monospace', fontSize: 15, fill: 0xffd65c },
  });
  private readonly faultLayer = new Container();
  private readonly faultSurface = new Graphics();
  private readonly faultTitle = new Text({
    text: 'SIGNAL LOST',
    style: { fontFamily: 'monospace', fontSize: 27, fill: 0xff6387, fontWeight: 'bold' },
  });
  private readonly variants: readonly ButtonVariant[] = [
    'primary',
    'module',
    'danger',
    'icon',
    'nav',
    'segment',
    'switch',
    'utility',
    'line',
  ];
  private readonly controls: {
    readonly surface: Graphics;
    readonly label: Text;
    readonly variant: ButtonVariant;
  }[] = [];
  private readonly listeners = new AbortController();
  private accent = 0x70ccff;
  private controlWidth = 260;
  private speed = 1;
  private active = true;
  private reduced = false;
  private selected = 'nav';
  private faultAge = Infinity;
  private width = 0;
  private binaryFrame = -1;

  private constructor(private readonly host: HTMLElement) {}

  static async start(): Promise<Gallery> {
    const host = document.getElementById('canvas');
    if (!(host instanceof HTMLElement)) throw new Error('Missing gallery canvas host');
    const gallery = new Gallery(host);
    await gallery.init();
    return gallery;
  }

  private async init(): Promise<void> {
    await this.app.init({
      background: 0x050c16,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    this.host.appendChild(this.app.canvas);
    this.app.stage.addChild(
      this.panel,
      this.binary,
      this.dust,
      this.emblem,
      this.titleEcho,
      this.title,
    );
    this.title.anchor.set(0.5);
    this.titleEcho.anchor.set(0.5);
    for (const variant of this.variants) {
      const surface = new Graphics();
      const label = new Text({
        text: variant.toUpperCase(),
        style: { fontFamily: 'monospace', fontSize: 14, fill: 0xe4f5ff },
      });
      label.anchor.set(0.5);
      surface.eventMode = 'static';
      surface.cursor = 'pointer';
      surface.on('pointertap', () => {
        this.selected = variant;
        this.layout();
      });
      this.controls.push({ surface, label, variant });
      this.app.stage.addChild(surface, label);
    }
    this.faultTitle.anchor.set(0.5);
    this.faultLayer.addChild(this.faultSurface, this.faultTitle);
    this.app.stage.addChild(this.faultLayer);
    for (const id of ['width', 'accent', 'speed', 'active', 'reduced']) {
      const input = document.getElementById(id);
      if (!(input instanceof HTMLInputElement)) throw new Error(`Missing gallery input ${id}`);
      input.addEventListener(
        'input',
        () => {
          if (id === 'width') this.controlWidth = input.valueAsNumber;
          if (id === 'accent') this.accent = Number.parseInt(input.value.slice(1), 16);
          if (id === 'speed') this.speed = input.valueAsNumber;
          if (id === 'active') this.active = input.checked;
          if (id === 'reduced') this.reduced = input.checked;
          for (const effect of [this.loader, this.echo, this.glitch]) {
            effect.setActive(this.active);
            effect.setReducedMotion(this.reduced);
          }
          this.binaryFrame = -1;
          this.layout();
        },
        { signal: this.listeners.signal },
      );
    }
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reducedInput = document.getElementById('reduced');
    if (reducedInput instanceof HTMLInputElement) reducedInput.checked = this.reduced;
    for (const effect of [this.loader, this.echo, this.glitch])
      effect.setReducedMotion(this.reduced);
    document.getElementById('fault')?.addEventListener(
      'click',
      () => {
        this.faultAge = this.reduced ? Infinity : 0;
      },
      { signal: this.listeners.signal },
    );
    window.addEventListener('resize', () => this.layout(), { signal: this.listeners.signal });
    this.layout();
    this.app.ticker.add(this.tick);
  }

  private layout(): void {
    this.width = Math.max(240, this.host.clientWidth);
    const w = Math.min(this.controlWidth, this.width - 48);
    const columns = Math.max(1, Math.floor((this.width - 24) / (w + 24)));
    const height = 350 + Math.ceil(this.controls.length / columns) * 78;
    this.app.renderer.resize(this.width, height);
    this.panel.clear();
    TerminalGlass.draw(
      this.panel,
      24,
      254,
      this.width - 48,
      64,
      12,
      CyberPreset.palette.panel,
      CyberPreset.palette.panelEdge,
      this.accent,
      CyberPreset.palette.text,
    );
    const targets: GlitchTarget[] = [];
    const palette = { ...CyberPreset.palette, accent: this.accent };
    for (const [index, control] of this.controls.entries()) {
      const x = 24 + (index % columns) * (w + 24);
      const y = 350 + Math.floor(index / columns) * 78;
      const selected = control.variant === this.selected;
      control.surface.position.set(x, y);
      control.surface.hitArea = new Rectangle(0, 0, w, 56);
      control.surface.clear();
      ButtonSurface.draw(
        control.surface,
        { width: w, height: 56, variant: control.variant, selected, enabled: true },
        palette,
      );
      if (control.variant === 'switch')
        ButtonSurface.toggle(control.surface, w, 56, selected, palette);
      TerminalUi.icon(
        control.surface,
        control.variant === 'danger' ? 'lock' : 'chip',
        22,
        28,
        20,
        control.variant === 'primary' ? palette.background : this.accent,
      );
      control.label.position.set(x + w / 2, y + 28);
      control.label.style.fill = control.variant === 'primary' ? palette.background : palette.text;
      targets.push({ surface: control.surface, x: 0, y: 0, w, h: 56 });
    }
    this.glitch.show('gallery', targets, 0);
    this.binaryFrame = -1;
  }

  private readonly tick = (ticker: Ticker): void => {
    const deltaSeconds = (ticker.deltaMS / 1000) * this.speed;
    this.loader.update(deltaSeconds);
    this.echo.update(deltaSeconds);
    this.glitch.update(deltaSeconds);
    this.loader.draw(
      this.emblem,
      this.dust,
      { x: this.width / 2, y: 104, radius: 52, scale: 1 },
      { ...CyberPreset.trianglePalette, accent: this.accent },
    );
    this.echo.draw(this.title, this.titleEcho, this.width / 2, 225);
    const frame = this.reduced ? 0 : Math.floor(this.loader.elapsedSeconds * 8);
    if (frame !== this.binaryFrame) {
      this.binaryFrame = frame;
      BinaryField.draw(
        this.binary.clear(),
        { x: 24, y: 254, w: this.width - 48, h: 64 },
        12,
        9,
        7291,
        frame,
      );
      this.binary.fill({ color: this.accent, alpha: 0.18 });
    }
    if (this.active) this.faultAge += deltaSeconds;
    this.faultLayer.visible = this.faultAge < 1;
    if (this.faultLayer.visible) {
      const sample = SignalLost.draw(
        this.faultSurface.clear(),
        this.width,
        this.app.screen.height,
        this.faultAge,
        { background: 0x050c16, danger: 0xff6387, accent: this.accent, highlight: 0xffd65c },
      );
      this.faultTitle.position.set(sample.x + sample.shift * 4, sample.y + 43);
      this.faultTitle.alpha = sample.fade;
    }
  };

  dispose(): void {
    this.listeners.abort();
    this.app.ticker.remove(this.tick);
    for (const effect of [this.loader, this.echo, this.glitch]) effect.dispose();
    this.app.destroy(true, { children: true });
  }
}

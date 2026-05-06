import { Container, Sprite, Texture, Text, TextStyle, Graphics } from 'pixi.js';

interface ButtonOptions {
  textureKey?: string;
  label?: string;
  width?: number;
  height?: number;
  onClick: () => void;
}

export class Button extends Container {
  private _enabled = true;
  private bg: Sprite | Graphics;

  constructor(opts: ButtonOptions) {
    super();

    if (opts.textureKey) {
      const sprite = new Sprite(Texture.from(opts.textureKey));
      sprite.anchor.set(0.5);
      if (opts.width) sprite.width = opts.width;
      if (opts.height) sprite.height = opts.height;
      this.bg = sprite;
    } else {
      // Fallback graphic button
      const g = new Graphics();
      const w = opts.width ?? 160;
      const h = opts.height ?? 60;
      g.roundRect(-w / 2, -h / 2, w, h, 12);
      g.fill({ color: 0xcc2200 });
      this.bg = g;
    }

    this.addChild(this.bg);

    if (opts.label) {
      const style = new TextStyle({
        fontFamily: 'Arial Black',
        fontSize: 28,
        fontWeight: 'bold',
        fill: '#ffffff',
        stroke: { color: '#000000', width: 4 },
      });
      const label = new Text({ text: opts.label, style });
      label.anchor.set(0.5);
      this.addChild(label);
    }

    this.eventMode = 'static';
    this.cursor = 'pointer';

    this.on('pointerover', () => {
      if (this._enabled) {
        this.scale.set(1.08);
      }
    });

    this.on('pointerout', () => {
      this.scale.set(1.0);
    });

    this.on('pointerdown', () => {
      if (this._enabled) {
        this.scale.set(0.95);
      }
    });

    this.on('pointerup', () => {
      if (this._enabled) {
        this.scale.set(1.08);
        opts.onClick();
      }
    });
  }

  setEnabled(val: boolean) {
    this._enabled = val;
    this.alpha = val ? 1.0 : 0.5;
    this.cursor = val ? 'pointer' : 'default';
  }
}

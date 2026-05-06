import { Container, Sprite, Texture, Ticker } from 'pixi.js';
import { GAME_CONFIG } from '../config/GameConfig';

export class FoxCharacter extends Container {
  private sprite: Sprite;
  private idleKeys: string[];
  private winKeys: string[];
  private frame: number = 0;
  private timer: number = 0;
  private mode: 'idle' | 'win' = 'idle';
  private ticker: Ticker;

  constructor(ticker: Ticker, idleKeys: string[], winKeys: string[]) {
    super();

    this.ticker = ticker;
    this.idleKeys = idleKeys;
    this.winKeys = winKeys;

    this.sprite = new Sprite(Texture.from(this.idleKeys[0]));
    this.sprite.anchor.set(0.5, 1);
    this.sprite.scale.set(GAME_CONFIG.layout.foxScalePSD);
    this.addChild(this.sprite);

    this.ticker.add((tickData) => this.update(tickData.deltaMS));
  }

  setMode(mode: 'idle' | 'win'): void {
    if (this.mode === mode) return;
    this.mode = mode;
    this.frame = 0;
    this.timer = 0;
  }

  private update(deltaMS: number): void {
    this.timer += deltaMS;
    const stepMs = 1000 / GAME_CONFIG.animation.foxFPS;

    if (this.timer < stepMs) return;

    this.timer -= stepMs;
    const keys = this.mode === 'win' ? this.winKeys : this.idleKeys;
    this.frame = (this.frame + 1) % keys.length;
    this.sprite.texture = Texture.from(keys[this.frame]);
  }
}

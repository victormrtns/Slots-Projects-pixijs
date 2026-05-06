import { Container, Sprite, Texture, Ticker } from 'pixi.js';
import { GAME_CONFIG } from '../config/GameConfig';
import { getBigWinKeys } from '../assets/assets';

interface BigWinConfig {
  cx: number;
  cy: number;
  targetWidth: number;
}

export class BigWinAnimation {
  private container: Container = new Container();
  private ticker: Ticker;
  private bigWinTextures: Texture[];
  private activeCallback: ((ticker: { deltaMS: number }) => void) | null = null;

  constructor(ticker: Ticker) {
    this.ticker = ticker;
    // Pre-cache textures once
    this.bigWinTextures = getBigWinKeys().map((k) => Texture.from(k));
  }

  play(config: BigWinConfig): void {
    if (this.bigWinTextures.length === 0) return;

    const { cx, cy, targetWidth } = config;
    const sprite = new Sprite(this.bigWinTextures[0]);
    sprite.anchor.set(0.5);
    sprite.scale.set(targetWidth / sprite.texture.width);
    sprite.x = cx;
    sprite.y = cy;

    this.container.addChild(sprite);

    let frame = 0;
    let timerMs = 0;
    let loops = 0;
    const stepMs = 1000 / GAME_CONFIG.animation.bigWinFPS;

    const update = (ticker: { deltaMS: number }) => {
      timerMs += ticker.deltaMS;
      if (timerMs < stepMs) return;
      timerMs -= stepMs;

      frame++;
      if (frame >= this.bigWinTextures.length) {
        frame = 0;
        loops++;
        if (loops >= GAME_CONFIG.animation.bigWinLoops) {
          this.removeTicker(update);
          this.container.removeChild(sprite);
          sprite.destroy();
          return;
        }
      }

      sprite.texture = this.bigWinTextures[frame];
    };

    this.activeCallback = update;
    this.ticker.add(update as Parameters<typeof this.ticker.add>[0]);
  }

  getContainer(): Container {
    return this.container;
  }

  clear(): void {
    if (this.activeCallback) {
      this.removeTicker(this.activeCallback);
    }
    this.container.removeChildren();
  }

  private removeTicker(cb: (ticker: { deltaMS: number }) => void): void {
    this.ticker.remove(cb as Parameters<typeof this.ticker.add>[0]);
    if (this.activeCallback === cb) {
      this.activeCallback = null;
    }
  }
}
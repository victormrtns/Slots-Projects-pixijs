import { Container, Graphics, BlurFilter, Ticker } from 'pixi.js';
import { GAME_CONFIG } from '../config/GameConfig';

interface ReelGlowConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ReelGlow {
  private container: Container = new Container();
  private ticker: Ticker;
  private activeCallback: ((ticker: { deltaMS: number }) => void) | null = null;

  constructor(ticker: Ticker) {
    this.ticker = ticker;
  }

  play(config: ReelGlowConfig): void {
    const { x, y, width, height } = config;
    const GLOW_INITIAL_ALPHA = 0.42;

    const glow = new Graphics();
    glow.rect(x, y, width, height);
    glow.fill({ color: 0xffdd00, alpha: GLOW_INITIAL_ALPHA });
    glow.filters = [new BlurFilter({ strength: 12 })];

    this.container.addChild(glow);

    let elapsedMs = 0;

    const update = (ticker: { deltaMS: number }) => {
      elapsedMs += ticker.deltaMS;
      glow.alpha = Math.max(0, GLOW_INITIAL_ALPHA * (1 - elapsedMs / GAME_CONFIG.animation.glowDurationMS));

      if (elapsedMs >= GAME_CONFIG.animation.glowDurationMS) {
        this.removeTicker(update);
        this.container.removeChild(glow);
        glow.destroy();
      }
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
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

  constructor(ticker: Ticker) {
    this.ticker = ticker;
  }

  play(config: ReelGlowConfig): void {
    const { x, y, width, height } = config;

    const glow = new Graphics();
    glow.rect(x - 16, y - 16, width + 32, height + 32);
    glow.fill({ color: 0xffdd00, alpha: 0.42 });
    glow.filters = [new BlurFilter({ strength: 32 })];

    this.container.addChild(glow);

    let elapsedMs = 0;

    const update = (ticker: { deltaMS: number }) => {
      elapsedMs += ticker.deltaMS;
      glow.alpha = Math.max(0, 0.42 - (elapsedMs / GAME_CONFIG.animation.glowDurationMS) * 0.42);

      if (elapsedMs >= GAME_CONFIG.animation.glowDurationMS) {
        this.ticker.remove(update as Parameters<typeof this.ticker.add>[0]);
        this.container.removeChild(glow);
        glow.destroy();
      }
    };

    this.ticker.add(update as Parameters<typeof this.ticker.add>[0]);
  }

  getContainer(): Container {
    return this.container;
  }

  clear(): void {
    this.container.removeChildren();
  }
}


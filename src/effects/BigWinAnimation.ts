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
  private bigWinKeys: string[] = getBigWinKeys();

  constructor(ticker: Ticker) {
    this.ticker = ticker;
  }

  play(config: BigWinConfig): void {
    if (this.bigWinKeys.length === 0) return;

    const { cx, cy, targetWidth } = config;
    const sprite = new Sprite(Texture.from(this.bigWinKeys[0]));
    sprite.anchor.set(0.5);
    sprite.scale.set(targetWidth / sprite.texture.width);
    sprite.x = cx;
    sprite.y = cy;

    this.container.addChild(sprite);

    let frame = 0;
    let timer = 0;
    let loops = 0;

    const update = (ticker: { deltaMS: number }) => {
      timer += ticker.deltaMS;
      if (timer < 1000 / GAME_CONFIG.animation.bigWinFPS) return;
      timer -= 1000 / GAME_CONFIG.animation.bigWinFPS;

      frame++;
      if (frame >= this.bigWinKeys.length) {
        frame = 0;
        loops++;
        if (loops >= GAME_CONFIG.animation.bigWinLoops) {
          this.ticker.remove(update as Parameters<typeof this.ticker.add>[0]);
          this.container.removeChild(sprite);
          sprite.destroy();
          return;
        }
      }

      sprite.texture = Texture.from(this.bigWinKeys[frame]);
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

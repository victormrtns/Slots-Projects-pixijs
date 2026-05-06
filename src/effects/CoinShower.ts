import { Container, Sprite, Texture, Ticker } from 'pixi.js';
import { GAME_CONFIG } from '../config/GameConfig';
import { getCoinKeys } from '../assets/assets';

interface CoinShowerConfig {
  x: number;
  y: number;
  width: number;
}

export class CoinShower {
  private container: Container = new Container();
  private ticker: Ticker;
  private coinKeys: string[] = getCoinKeys();

  constructor(ticker: Ticker) {
    this.ticker = ticker;
  }

  play(config: CoinShowerConfig): void {
    const { x, y, width } = config;
    const coinCount = GAME_CONFIG.animation.coinCount;
    const coins: Array<{
      sprite: Sprite;
      vx: number;
      vy: number;
      frame: number;
      elapsed: number;
      delay: number;
    }> = [];

    for (let i = 0; i < coinCount; i++) {
      const coin = new Sprite(Texture.from(this.coinKeys[0]));
      coin.anchor.set(0.5);
      coin.scale.set(0.6 + Math.random() * 0.4);
      coin.x = x + Math.random() * width;
      coin.y = y - 50;
      this.container.addChild(coin);

      coins.push({
        sprite: coin,
        vx: (Math.random() - 0.5) * 6,
        vy: -6 - Math.random() * 7,
        frame: Math.floor(Math.random() * this.coinKeys.length),
        elapsed: 0,
        delay: i * 50,
      });
    }

    let activeCoinCount = coinCount;

    const update = (ticker: { deltaMS: number }) => {
      for (const coinData of coins) {
        coinData.elapsed += ticker.deltaMS;

        if (coinData.elapsed < coinData.delay) continue;

        coinData.vy += GAME_CONFIG.animation.coinGravity * (ticker.deltaMS / 16);
        coinData.sprite.x += coinData.vx;
        coinData.sprite.y += coinData.vy;

        coinData.frame = (coinData.frame + 1) % this.coinKeys.length;
        coinData.sprite.texture = Texture.from(this.coinKeys[coinData.frame]);

        if (coinData.sprite.y > GAME_CONFIG.layout.psdHeight - 20) {
          this.container.removeChild(coinData.sprite);
          coinData.sprite.destroy();
          activeCoinCount--;
        }
      }

      if (activeCoinCount === 0) {
        this.ticker.remove(update as Parameters<typeof this.ticker.add>[0]);
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

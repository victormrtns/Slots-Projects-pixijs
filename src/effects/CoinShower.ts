import { Container, Sprite, Texture, Ticker } from 'pixi.js';
import { GAME_CONFIG } from '../config/GameConfig';
import { getCoinKeys } from '../assets/assets';

interface CoinShowerConfig {
  x: number;
  y: number;
  width: number;
}

interface CoinState {
  sprite: Sprite;
  vx: number;
  vy: number;
  frame: number;
  elapsed: number;
  delay: number;
  alive: boolean;
}

export class CoinShower {
  private container: Container = new Container();
  private ticker: Ticker;
  private coinTextures: Texture[];
  private activeCallback: ((ticker: { deltaMS: number }) => void) | null = null;

  constructor(ticker: Ticker) {
    this.ticker = ticker;
    // Pre-cache textures once — avoid Texture.from() every frame
    this.coinTextures = getCoinKeys().map((k) => Texture.from(k));
  }

  play(config: CoinShowerConfig): void {
    const { x, y, width } = config;
    const coinCount = GAME_CONFIG.animation.coinCount;
    const coins: CoinState[] = [];

    for (let i = 0; i < coinCount; i++) {
      const sprite = new Sprite(this.coinTextures[0]);
      sprite.anchor.set(0.5);
      sprite.scale.set(0.6 + Math.random() * 0.4);
      sprite.x = x + Math.random() * width;
      sprite.y = y - 50;
      sprite.visible = false;
      this.container.addChild(sprite);

      coins.push({
        sprite,
        vx: (Math.random() - 0.5) * 6,
        vy: -6 - Math.random() * 7,
        frame: Math.floor(Math.random() * this.coinTextures.length),
        elapsed: 0,
        delay: i * 50,
        alive: true,
      });
    }

    const update = (ticker: { deltaMS: number }) => {
      let allDead = true;

      for (const coinData of coins) {
        if (!coinData.alive) continue;
        allDead = false;

        coinData.elapsed += ticker.deltaMS;
        if (coinData.elapsed < coinData.delay) continue;

        coinData.sprite.visible = true;
        coinData.vy += GAME_CONFIG.animation.coinGravity * (ticker.deltaMS / 16);
        coinData.sprite.x += coinData.vx;
        coinData.sprite.y += coinData.vy;

        coinData.frame = (coinData.frame + 1) % this.coinTextures.length;
        coinData.sprite.texture = this.coinTextures[coinData.frame];

        if (coinData.sprite.y > GAME_CONFIG.layout.psdHeight - 20) {
          coinData.alive = false;
          this.container.removeChild(coinData.sprite);
          coinData.sprite.destroy();
        }
      }

      if (allDead) {
        this.removeTicker(update);
      }
    };

    this.activeCallback = update;
    this.ticker.add(update as Parameters<typeof this.ticker.add>[0]);
  }

  getContainer(): Container {
    return this.container;
  }

  clear(): void {
    // Remove ticker callback FIRST, then clean up sprites
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
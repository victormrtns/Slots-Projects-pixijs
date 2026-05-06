import { Container, Sprite, Texture, Ticker } from 'pixi.js';
import { GAME_CONFIG } from '../config/GameConfig';
import { getBigWinKeys, getMegaWinKeys, getSuperMegaWinKeys, getTotalWinKeys } from '../assets/assets';

export type WinTier = 'none' | 'big_win' | 'mega_win' | 'super_mega_win' | 'total_win';

interface BigWinConfig {
  cx: number;
  cy: number;
  targetWidth: number;
}

/** Pre-cache all tier textures once at construction, play the correct set based on tier. */
export class BigWinAnimation {
  private container: Container = new Container();
  private ticker: Ticker;
  private activeCallback: ((ticker: { deltaMS: number }) => void) | null = null;

  private tierTextures: Record<Exclude<WinTier, 'none'>, Texture[]>;

  constructor(ticker: Ticker) {
    this.ticker = ticker;
    this.tierTextures = {
      big_win: getBigWinKeys().map((k) => Texture.from(k)),
      mega_win: getMegaWinKeys().map((k) => Texture.from(k)),
      super_mega_win: getSuperMegaWinKeys().map((k) => Texture.from(k)),
      total_win: getTotalWinKeys().map((k) => Texture.from(k)),
    };
  }

  /** Determine which tier to show based on win amount relative to bet. */
  static resolveTier(totalWin: number, bet: number): WinTier {
    if (bet <= 0 || totalWin <= 0) return 'none';
    const multiplier = totalWin / bet;
    const t = GAME_CONFIG.gameplay.winTiers;
    if (multiplier >= t.totalWin) return 'total_win';
    if (multiplier >= t.superMegaWin) return 'super_mega_win';
    if (multiplier >= t.megaWin) return 'mega_win';
    if (multiplier >= t.bigWin) return 'big_win';
    return 'none';
  }

  play(config: BigWinConfig, tier: WinTier = 'big_win'): void {
    if (tier === 'none') return;
    const textures = this.tierTextures[tier];
    if (!textures || textures.length === 0) return;

    const { cx, cy, targetWidth } = config;
    const sprite = new Sprite(textures[0]);
    sprite.anchor.set(0.5);
    sprite.scale.set(targetWidth / sprite.texture.width);
    sprite.x = cx;
    sprite.y = cy;

    this.container.addChild(sprite);

    let frame = 0;
    let timerMs = 0;
    let loops = 0;
    const stepMs = 1000 / GAME_CONFIG.animation.bigWinFPS;

    const update = (tickerData: { deltaMS: number }) => {
      timerMs += tickerData.deltaMS;
      if (timerMs < stepMs) return;
      timerMs -= stepMs;

      frame++;
      if (frame >= textures.length) {
        frame = 0;
        loops++;
        if (loops >= GAME_CONFIG.animation.bigWinLoops) {
          this.removeTicker(update);
          this.container.removeChild(sprite);
          sprite.destroy();
          return;
        }
      }

      sprite.texture = textures[frame];
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
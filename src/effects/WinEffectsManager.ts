import { Container, Ticker, Rectangle } from 'pixi.js';
import { CoinShower } from './CoinShower';
import { BigWinAnimation } from './BigWinAnimation';
import { ReelGlow } from './ReelGlow';

export class WinEffectsManager {
  private container: Container = new Container();
  private coinShower: CoinShower;
  private bigWinAnimation: BigWinAnimation;
  private reelGlow: ReelGlow;

  constructor(ticker: Ticker) {
    this.coinShower = new CoinShower(ticker);
    this.bigWinAnimation = new BigWinAnimation(ticker);
    this.reelGlow = new ReelGlow(ticker);

    this.container.addChild(
      this.coinShower.getContainer(),
      this.reelGlow.getContainer(),
      this.bigWinAnimation.getContainer()
    );
  }

  triggerAll(reelBounds: Rectangle): void {
    const reelCx = reelBounds.x + reelBounds.width / 2;
    const reelCy = reelBounds.y + reelBounds.height / 2;

    this.reelGlow.play({
      x: reelBounds.x - 16,
      y: reelBounds.y - 16,
      width: reelBounds.width + 32,
      height: reelBounds.height + 32,
    });

    this.coinShower.play({
      x: reelBounds.x,
      y: reelBounds.y,
      width: reelBounds.width,
    });

    this.bigWinAnimation.play({
      cx: reelCx,
      cy: reelCy,
      targetWidth: reelBounds.width * 0.8,
    });
  }

  getContainer(): Container {
    return this.container;
  }

  clear(): void {
    this.coinShower.clear();
    this.bigWinAnimation.clear();
    this.reelGlow.clear();
  }
}
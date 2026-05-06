import { Application, Container } from 'pixi.js';
import { Reel, SYMBOL_W, SYMBOL_H, VISIBLE_ROWS } from './Reel';

const REEL_COUNT = 6;
const REEL_CASCADE_MS = 180;

export class SlotMachine extends Container {
  private reels: Reel[] = [];
  private spinning = false;

  onSpinComplete?: () => void;

  constructor(app: Application) {
    super();

    // Build and position each reel in a horizontal strip
    for (let i = 0; i < REEL_COUNT; i++) {
      const reel = new Reel();
      reel.x = i * SYMBOL_W;
      reel.y = 0;
      this.addChild(reel);
      this.reels.push(reel);
    }

    app.ticker.add((ticker) => {
      for (const reel of this.reels) reel.update(ticker.deltaMS);
    });
  }

  get isSpinning(): boolean { return this.spinning; }

  async startSpin() {
    if (this.spinning) return;
    this.spinning = true;

    for (let i = 0; i < this.reels.length; i++) {
      setTimeout(() => this.reels[i].spin(), i * REEL_CASCADE_MS);
    }

    await delay((this.reels.length - 1) * REEL_CASCADE_MS + 600);

    const stopPromises = this.reels.map((reel, i) =>
      delay(i * REEL_CASCADE_MS).then(() => reel.stop()),
    );
    await Promise.all(stopPromises);

    this.spinning = false;
    this.onSpinComplete?.();
  }

  get machineWidth():  number { return REEL_COUNT * SYMBOL_W; }
  get machineHeight(): number { return VISIBLE_ROWS * SYMBOL_H; }
}

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

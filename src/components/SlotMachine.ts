import { Application, Container, Ticker } from 'pixi.js';
import { Reel, SYMBOL_W, SYMBOL_H, VISIBLE_ROWS } from './Reel';
import { EventEmitter } from '../utils/EventEmitter';
import { GAME_CONFIG } from '../config/GameConfig';

const REEL_COUNT = 6;
const REEL_CASCADE_MS = GAME_CONFIG.animation.reelCascadeMS;

interface SlotMachineEvents extends Record<string, any> {
  spinStart: void;
  spinComplete: void;
}

export class SlotMachine extends Container {
  private reels: Reel[] = [];
  private spinning = false;
  private gameEvents: EventEmitter<SlotMachineEvents> = new EventEmitter();
  private ticker: Ticker;

  constructor(app: Application) {
    super();

    this.ticker = app.ticker;

    for (let i = 0; i < REEL_COUNT; i++) {
      const reel = new Reel();
      reel.x = i * SYMBOL_W;
      reel.y = 0;
      this.addChild(reel);
      this.reels.push(reel);
    }

    this.ticker.add((ticker) => {
      for (const reel of this.reels) reel.update(ticker.deltaMS);
    });
  }

  get isSpinning(): boolean {
    return this.spinning;
  }

  onSpinStart(listener: () => void): void {
    this.gameEvents.on('spinStart', listener);
  }

  onSpinComplete(listener: () => void): void {
    this.gameEvents.on('spinComplete', listener);
  }

  async startSpin() {
    if (this.spinning) return;
    this.spinning = true;
    this.gameEvents.emit('spinStart', undefined);

    for (let i = 0; i < this.reels.length; i++) {
      setTimeout(() => this.reels[i].spin(), i * REEL_CASCADE_MS);
    }

    await delay((this.reels.length - 1) * REEL_CASCADE_MS + 600);

    const stopPromises = this.reels.map((reel, i) =>
      delay(i * REEL_CASCADE_MS).then(() => reel.stop())
    );
    await Promise.all(stopPromises);

    this.spinning = false;
    this.gameEvents.emit('spinComplete', undefined);
  }

  get machineWidth(): number {
    return REEL_COUNT * SYMBOL_W;
  }
  get machineHeight(): number {
    return VISIBLE_ROWS * SYMBOL_H;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

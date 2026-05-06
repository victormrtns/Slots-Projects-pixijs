import { Container, Sprite, Texture, Graphics } from 'pixi.js';
import { SYMBOL_KEYS, SymbolKey, SYMBOL_ANIM_FRAMES } from '../assets/assets';

const SYMBOL_ANIM_FPS = 22;

/** Sprite augmented with its current symbol key + per-sprite frame offset. */
type AnimSprite = Sprite & { symbolKey: SymbolKey; frameOffset: number };

function frameKey(sym: SymbolKey, frame: number): string {
  return `${sym}_${String(frame % SYMBOL_ANIM_FRAMES).padStart(2, '0')}`;
}

// Cell size matches the MAIN GAME.psd grid (177 × 157 per cell, 5 visible rows)
export const SYMBOL_W = 177;
export const SYMBOL_H = 157;
export const VISIBLE_ROWS = 5;
const STRIP_SYMBOLS = 8;

const SPIN_SPEED = 48;
const BOUNCE_AMOUNT = 22;

type ReelState = 'idle' | 'spinning' | 'stopping' | 'bouncing';

function randomSymbolKey(): SymbolKey {
  return SYMBOL_KEYS[Math.floor(Math.random() * SYMBOL_KEYS.length)];
}

export class Reel extends Container {
  private stripY = 0;
  private speed = 0;
  private state: ReelState = 'idle';

  private symbols: AnimSprite[] = [];
  private reelMask: Graphics;
  private resolveStop?: () => void;

  private bounceDir = 1;
  private bounceProgress = 0;

  /** Shared animation-frame counter for all sprites in this reel (idle anim). */
  private animFrame = 0;
  private animTimer = 0;

  constructor() {
    super();

    for (let i = 0; i < STRIP_SYMBOLS; i++) {
      const key = randomSymbolKey();
      const sprite = new Sprite(Texture.from(frameKey(key, 0))) as AnimSprite;
      sprite.symbolKey   = key;
      sprite.frameOffset = Math.floor(Math.random() * SYMBOL_ANIM_FRAMES);
      sprite.anchor.set(0.5);
      sprite.width  = SYMBOL_W * 0.85;
      sprite.height = SYMBOL_H * 0.85;
      sprite.x = SYMBOL_W / 2;
      sprite.y = i * SYMBOL_H + SYMBOL_H / 2;
      this.addChild(sprite);
      this.symbols.push(sprite);
    }

    this.reelMask = new Graphics();
    this.reelMask.rect(0, 0, SYMBOL_W, SYMBOL_H * VISIBLE_ROWS);
    this.reelMask.fill({ color: 0xffffff });
    this.addChild(this.reelMask);
    this.mask = this.reelMask;
  }

  spin() {
    this.state = 'spinning';
    this.speed = SPIN_SPEED;
  }

  stop(): Promise<void> {
    if (this.state !== 'spinning') return Promise.resolve();
    this.state = 'stopping';
    return new Promise((resolve) => { this.resolveStop = resolve; });
  }

  update(delta: number) {
    // Idle: just animate symbol frames (no strip motion)
    if (this.state === 'idle') {
      this.advanceAnim(delta);
      return;
    }
    const dt = delta / (1000 / 60);

    if (this.state === 'spinning') {
      this.advanceStrip(this.speed * dt);
    }

    if (this.state === 'stopping') {
      this.speed = Math.max(this.speed - 1.6 * dt, 4);
      this.advanceStrip(this.speed * dt);
      const offset = this.stripY % SYMBOL_H;
      if (this.speed <= 4 && offset < this.speed * dt * 2) {
        this.snapToGrid();
        this.state = 'bouncing';
        this.bounceProgress = 0;
        this.bounceDir = 1;
      }
    }

    if (this.state === 'bouncing') {
      this.bounceProgress += 0.08 * dt;
      if (this.bounceProgress >= 1) {
        this.bounceProgress = 1;
        if (this.bounceDir === 1) {
          this.bounceDir = -1;
          this.bounceProgress = 0;
        } else {
          this.randomiseSymbols();
          this.state = 'idle';
          this.resolveStop?.();
          this.resolveStop = undefined;
          return;
        }
      }
      const ease = 1 - Math.pow(1 - this.bounceProgress, 3);
      const offset = BOUNCE_AMOUNT * ease * this.bounceDir;
      this.setSymbolOffset(offset);
    }
  }

  private advanceStrip(amount: number) {
    this.stripY += amount;
    const totalHeight = STRIP_SYMBOLS * SYMBOL_H;
    for (let i = 0; i < this.symbols.length; i++) {
      let y = (i * SYMBOL_H + SYMBOL_H / 2 + this.stripY) % totalHeight;
      if (y < 0) y += totalHeight;
      this.symbols[i].y = y - SYMBOL_H;
    }
  }

  private snapToGrid() {
    const totalHeight = STRIP_SYMBOLS * SYMBOL_H;
    this.stripY = Math.round(this.stripY / SYMBOL_H) * SYMBOL_H;
    for (let i = 0; i < this.symbols.length; i++) {
      let y = (i * SYMBOL_H + SYMBOL_H / 2 + this.stripY) % totalHeight;
      if (y < 0) y += totalHeight;
      this.symbols[i].y = y - SYMBOL_H;
    }
  }

  private setSymbolOffset(offset: number) {
    for (const s of this.symbols) s.y += offset;
  }

  private randomiseSymbols() {
    for (const s of this.symbols) {
      s.symbolKey = randomSymbolKey();
      s.frameOffset = Math.floor(Math.random() * SYMBOL_ANIM_FRAMES);
      s.texture = Texture.from(frameKey(s.symbolKey, this.animFrame + s.frameOffset));
    }
  }

  /** Advance the per-symbol idle animation. */
  private advanceAnim(deltaMS: number) {
    this.animTimer += deltaMS;
    const stepMS = 1000 / SYMBOL_ANIM_FPS;
    if (this.animTimer < stepMS) return;
    // Catch up multiple frames if a long pause happened (eg. tab regained focus)
    const steps = Math.floor(this.animTimer / stepMS);
    this.animTimer -= steps * stepMS;
    this.animFrame = (this.animFrame + steps) % SYMBOL_ANIM_FRAMES;
    for (const s of this.symbols) {
      s.texture = Texture.from(frameKey(s.symbolKey, this.animFrame + s.frameOffset));
    }
  }

  get reelWidth():  number { return SYMBOL_W; }
  get reelHeight(): number { return SYMBOL_H * VISIBLE_ROWS; }
}

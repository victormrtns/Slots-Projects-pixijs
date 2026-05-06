import {
  Application,
  Container,
  Sprite,
  Texture,
  Text,
  TextStyle,
  Graphics,
  BlurFilter,
  Rectangle,
} from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../app';
import { SlotMachine } from '../components/SlotMachine';
import { SYMBOL_W, SYMBOL_H } from '../components/Reel';
import { getFoxIdleKeys, getFoxWinKeys, getCoinKeys, getBigWinKeys } from '../assets/assets';

// Source PSD canvas — every layer position below uses these coordinates
const PSD_W = 1920;
const PSD_H = 1080;
const WORLD_SCALE = GAME_WIDTH / PSD_W; // 1280 / 1920 → 0.6667 (matches GAME_HEIGHT 720)
void GAME_HEIGHT; void PSD_H;

// Reel grid origin in PSD coords (matches the symbols-grid bbox in MAIN GAME.psd)
const GRID_X = 429;
const GRID_Y = 156;

// Display centres in PSD coords (read directly from the PSD layer bboxes)
const BALANCE_CX = 558, BALANCE_CY = 1023;
const WIN_CX     = 847, WIN_CY     = 1022;
const BET_CX     = 1115, BET_CY    = 1023;

// Button hit-circles in PSD coords
const BTN_DOWN = { x: 1301, y: 1016, r: 50 };
const BTN_SPIN = { x: 1436, y: 1023, r: 75 };
const BTN_UP   = { x: 1571, y: 1016, r: 50 };

// Fox area in PSD coords
const FOX_BOTTOM_X = 1729;
const FOX_BOTTOM_Y = 988;
const FOX_SCALE_PSD = 0.96;

export class HomeScene extends Container {
  private world!: Container;

  private slotMachine!: SlotMachine;
  private spinSprite!: Sprite;
  private balanceLbl!: Text;
  private winLbl!: Text;
  private betLbl!: Text;

  private balance = 4000;
  private bet     = 100;
  private lastWin = 0;
  private spinning = false;

  private foxSprite!: Sprite;
  private foxIdleKeys: string[];
  private foxWinKeys:  string[];
  private foxFrame  = 0;
  private foxTimer  = 0;
  private foxMode: 'idle' | 'win' = 'idle';
  private readonly FOX_FPS = 18;

  private coinKeys: string[];
  private coinLayer!: Container;
  private bigWinLayer!: Container;
  private bigWinKeys: string[];

  constructor(app: Application) {
    super();

    this.foxIdleKeys = getFoxIdleKeys();
    this.foxWinKeys  = getFoxWinKeys();
    this.coinKeys    = getCoinKeys();
    this.bigWinKeys  = getBigWinKeys();

    this.world = new Container();
    this.world.scale.set(WORLD_SCALE);
    this.addChild(this.world);

    this.buildBackground();
    this.buildSlotMachine(app);
    this.buildFox(app);

    this.coinLayer   = new Container();
    this.bigWinLayer = new Container();
    this.world.addChild(this.coinLayer, this.bigWinLayer);

    this.buildLogo();
    this.buildPanels();
    this.buildButtons(app);

    this.alpha = 0;
    let t = 0;
    const fade = (ticker: { deltaMS: number }) => {
      t += ticker.deltaMS / 600;
      this.alpha = Math.min(t, 1);
      if (t >= 1) app.ticker.remove(fade as Parameters<typeof app.ticker.add>[0]);
    };
    app.ticker.add(fade as Parameters<typeof app.ticker.add>[0]);
  }

  private buildBackground() {
    this.world.addChild(new Sprite(Texture.from('ui_bg')));
    this.world.addChild(new Sprite(Texture.from('ui_frame')));
  }

  private buildLogo() {
    this.world.addChild(new Sprite(Texture.from('ui_logo')));
  }

  private buildSlotMachine(app: Application) {
    this.slotMachine = new SlotMachine(app);
    this.slotMachine.x = GRID_X;
    this.slotMachine.y = GRID_Y;
    this.world.addChild(this.slotMachine);

    this.slotMachine.onSpinComplete = () => {
      this.spinning = false;
      this.setSpinEnabled(true);

      const won = Math.random() > 0.38;
      if (won) {
        this.lastWin = this.bet * Math.floor(Math.random() * 12 + 2);
        this.balance += this.lastWin;
        this.winLbl.text     = `$${this.lastWin.toLocaleString()}`;
        this.balanceLbl.text = `$${this.balance.toLocaleString()}`;
        this.triggerWinEffects();
        this.foxMode  = 'win';
        this.foxFrame = 0;
      } else {
        this.lastWin = 0;
        this.winLbl.text = '$0';
        this.foxMode = 'idle';
      }
    };
  }

  private buildFox(app: Application) {
    this.foxSprite = new Sprite(Texture.from(this.foxIdleKeys[0]));
    this.foxSprite.anchor.set(0.5, 1);
    this.foxSprite.scale.set(FOX_SCALE_PSD);
    this.foxSprite.x = FOX_BOTTOM_X;
    this.foxSprite.y = FOX_BOTTOM_Y;
    this.world.addChild(this.foxSprite);

    app.ticker.add((t) => this.updateFox(t.deltaMS));
  }

  private updateFox(dt: number) {
    this.foxTimer += dt;
    if (this.foxTimer < 1000 / this.FOX_FPS) return;
    this.foxTimer -= 1000 / this.FOX_FPS;
    const keys = this.foxMode === 'win' ? this.foxWinKeys : this.foxIdleKeys;
    this.foxFrame = (this.foxFrame + 1) % keys.length;
    this.foxSprite.texture = Texture.from(keys[this.foxFrame]);
  }

  private buildPanels() {
    this.world.addChild(new Sprite(Texture.from('ui_panel_balance')));
    this.world.addChild(new Sprite(Texture.from('ui_panel_win')));
    this.world.addChild(new Sprite(Texture.from('ui_panel_bet')));

    const labelStyle = new TextStyle({
      fontFamily: 'GROBOLD, "Arial Black", sans-serif',
      fontSize: 38,
      fontWeight: 'bold',
      fill: '#f7b32a',
      stroke: { color: '#3a1500', width: 5 },
    });
    const valueStyle = new TextStyle({
      fontFamily: 'GROBOLD, "Arial Black", sans-serif',
      fontSize: 50,
      fontWeight: 'bold',
      fill: '#34ff5a',
      stroke: { color: '#001500', width: 4 },
    });

    const addLabel = (text: string, cx: number, cy: number) => {
      const t = new Text({ text, style: labelStyle });
      t.anchor.set(0.5);
      t.x = cx; t.y = cy;
      this.world.addChild(t);
    };

    addLabel('BALANCE', BALANCE_CX, 974);
    addLabel('WIN',     WIN_CX,     961);
    addLabel('BET',     BET_CX,     974);

    const addValue = (cx: number, cy: number): Text => {
      const t = new Text({ text: '', style: valueStyle });
      t.anchor.set(0.5);
      t.x = cx; t.y = cy;
      this.world.addChild(t);
      return t;
    };

    this.balanceLbl = addValue(BALANCE_CX, BALANCE_CY);
    this.winLbl     = addValue(WIN_CX,     WIN_CY);
    this.betLbl     = addValue(BET_CX,     BET_CY);

    this.balanceLbl.text = `$${this.balance.toLocaleString()}`;
    this.winLbl.text     = '$0';
    this.betLbl.text     = `$${this.bet.toLocaleString()}`;
  }

  private buildButtons(app: Application) {
    const downSprite = new Sprite(Texture.from('ui_btn_down'));
    this.makeClickable(downSprite, BTN_DOWN, () => {
      if (this.bet > 10) { this.bet -= 10; this.betLbl.text = `$${this.bet}`; }
    });
    this.world.addChild(downSprite);

    this.spinSprite = new Sprite(Texture.from('ui_btn_spin'));
    this.makeClickable(this.spinSprite, BTN_SPIN, () => this.handleSpin(app));
    this.world.addChild(this.spinSprite);

    const upSprite = new Sprite(Texture.from('ui_btn_up'));
    this.makeClickable(upSprite, BTN_UP, () => {
      this.bet += 10; this.betLbl.text = `$${this.bet}`;
    });
    this.world.addChild(upSprite);
  }

  /** Move the sprite's pivot to the button centre so we can scale on hover. */
  private makeClickable(
    sprite: Sprite,
    hit: { x: number; y: number; r: number },
    onClick: () => void,
  ) {
    sprite.eventMode = 'static';
    sprite.cursor    = 'pointer';
    sprite.pivot.set(hit.x, hit.y);
    sprite.x = hit.x;
    sprite.y = hit.y;
    // hitArea is in the sprite's LOCAL (texture-pixel) coordinate space — the
    // visible button content lives at (hit.x ± r) inside the 1920×1080 texture.
    sprite.hitArea = new Rectangle(hit.x - hit.r, hit.y - hit.r, hit.r * 2, hit.r * 2);

    sprite.on('pointerover', () => { if (sprite.alpha === 1) sprite.scale.set(1.06); });
    sprite.on('pointerout',  () => sprite.scale.set(1.0));
    sprite.on('pointerdown', () => { if (sprite.alpha === 1) sprite.scale.set(0.94); });
    sprite.on('pointerup',   () => { sprite.scale.set(1.0); if (sprite.alpha === 1) onClick(); });
  }

  private setSpinEnabled(enabled: boolean) {
    this.spinSprite.alpha  = enabled ? 1.0 : 0.55;
    this.spinSprite.cursor = enabled ? 'pointer' : 'default';
  }

  private async handleSpin(_app: Application) {
    if (this.spinning) return;
    this.spinning = true;
    this.setSpinEnabled(false);
    this.lastWin = 0;
    this.winLbl.text = '$0';
    this.foxMode = 'idle';
    this.coinLayer.removeChildren();
    this.bigWinLayer.removeChildren();

    if (this.balance >= this.bet) {
      this.balance -= this.bet;
      this.balanceLbl.text = `$${this.balance.toLocaleString()}`;
    }

    await this.slotMachine.startSpin();
  }

  private spawnCoinShower() {
    const COIN_COUNT = 24;
    const reelLeft  = GRID_X;
    const reelRight = GRID_X + 6 * SYMBOL_W;

    for (let i = 0; i < COIN_COUNT; i++) {
      const coin = new Sprite(Texture.from(this.coinKeys[0]));
      coin.anchor.set(0.5);
      coin.scale.set(0.6 + Math.random() * 0.4);

      coin.x = reelLeft + Math.random() * (reelRight - reelLeft);
      coin.y = GRID_Y - 50;
      this.coinLayer.addChild(coin);

      const vx = (Math.random() - 0.5) * 6;
      let   vy = -6 - Math.random() * 7;
      let   frame = Math.floor(Math.random() * this.coinKeys.length);
      let   elapsed = 0;
      const delay   = i * 50;

      const iv = setInterval(() => {
        elapsed += 16;
        if (elapsed < delay) return;

        vy += 0.7;
        coin.x += vx;
        coin.y += vy;

        frame = (frame + 1) % this.coinKeys.length;
        coin.texture = Texture.from(this.coinKeys[frame]);

        if (coin.y > PSD_H - 20) {
          clearInterval(iv);
          this.coinLayer.removeChild(coin);
          coin.destroy();
        }
      }, 16);
    }
  }

  private playBigWin() {
    if (this.bigWinKeys.length === 0) return;

    const sprite = new Sprite(Texture.from(this.bigWinKeys[0]));
    sprite.anchor.set(0.5);

    const reelCx = GRID_X + (6 * SYMBOL_W) / 2;
    const reelCy = GRID_Y + (5 * SYMBOL_H) / 2;
    const targetW = 6 * SYMBOL_W * 0.8;
    sprite.scale.set(targetW / sprite.texture.width);
    sprite.x = reelCx;
    sprite.y = reelCy;

    this.bigWinLayer.addChild(sprite);

    let frame = 0, timer = 0, loops = 0;
    const FPS = 24;
    const MAX_LOOPS = 2;

    const iv = setInterval(() => {
      timer += 16;
      if (timer < 1000 / FPS) return;
      timer -= 1000 / FPS;

      frame++;
      if (frame >= this.bigWinKeys.length) {
        frame = 0; loops++;
        if (loops >= MAX_LOOPS) {
          clearInterval(iv);
          this.bigWinLayer.removeChild(sprite);
          sprite.destroy();
          return;
        }
      }
      sprite.texture = Texture.from(this.bigWinKeys[frame]);
    }, 16);
  }

  private triggerReelGlow() {
    const glow = new Graphics();
    glow.rect(GRID_X - 16, GRID_Y - 16, 6 * SYMBOL_W + 32, 5 * SYMBOL_H + 32);
    glow.fill({ color: 0xffdd00, alpha: 0.42 });
    glow.filters = [new BlurFilter({ strength: 32 })];
    this.coinLayer.addChild(glow);

    let e = 0;
    const iv = setInterval(() => {
      e += 16;
      glow.alpha = Math.max(0, 0.42 - (e / 800) * 0.42);
      if (e >= 800) { clearInterval(iv); glow.destroy(); }
    }, 16);
  }

  private triggerWinEffects() {
    this.triggerReelGlow();
    this.spawnCoinShower();
    this.playBigWin();
  }
}

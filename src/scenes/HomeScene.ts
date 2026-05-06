import { Application, Container, Sprite, Texture, Text, TextStyle, Rectangle } from 'pixi.js';
import { GAME_CONFIG, WORLD_SCALE } from '../config/GameConfig';
import { SlotMachine } from '../components/SlotMachine';
import { FoxCharacter } from '../components/FoxCharacter';
import { WinEffectsManager } from '../effects/WinEffectsManager';
import { GameState } from '../game/GameState';
import { fadeIn } from '../utils/fadeIn';
import { SYMBOL_W, SYMBOL_H } from '../components/Reel';
import { getFoxIdleKeys, getFoxWinKeys } from '../assets/assets';

export class HomeScene extends Container {
  private world!: Container;
  private slotMachine!: SlotMachine;
  private spinSprite!: Sprite;
  private balanceLbl!: Text;
  private winLbl!: Text;
  private betLbl!: Text;
  private foxCharacter!: FoxCharacter;
  private winEffectsManager!: WinEffectsManager;
  private gameState: GameState = new GameState();
  private spinning = false;

  constructor(app: Application) {
    super();

    this.world = new Container();
    this.world.scale.set(WORLD_SCALE);
    this.addChild(this.world);

    this.buildBackground();
    this.buildSlotMachine(app);
    this.buildFox(app);
    this.buildWinEffects(app);
    this.buildLogo();
    this.buildPanels();
    this.buildButtons(app);

    this.initializeGameState();
    this.fadeInScene(app);
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
    this.slotMachine.x = GAME_CONFIG.layout.gridX;
    this.slotMachine.y = GAME_CONFIG.layout.gridY;
    this.world.addChild(this.slotMachine);

    this.slotMachine.onSpinComplete(() => {
      this.spinning = false;
      this.setSpinEnabled(true);
      this.updateLabels();

      if (this.gameState.lastWin > 0) {
        this.triggerWinEffects();
        this.foxCharacter.setMode('win');
      } else {
        this.foxCharacter.setMode('idle');
      }
    });
  }

  private buildFox(app: Application) {
    const foxIdleKeys = getFoxIdleKeys();
    const foxWinKeys = getFoxWinKeys();

    this.foxCharacter = new FoxCharacter(app.ticker, foxIdleKeys, foxWinKeys);
    this.foxCharacter.x = GAME_CONFIG.layout.foxBottomX;
    this.foxCharacter.y = GAME_CONFIG.layout.foxBottomY;
    this.world.addChild(this.foxCharacter);
  }

  private buildWinEffects(app: Application) {
    this.winEffectsManager = new WinEffectsManager(app.ticker);
    this.world.addChild(this.winEffectsManager.getContainer());
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
      t.x = cx;
      t.y = cy;
      this.world.addChild(t);
    };

    addLabel('BALANCE', GAME_CONFIG.layout.panelBalance.cx, 974);
    addLabel('WIN', GAME_CONFIG.layout.panelWin.cx, 961);
    addLabel('BET', GAME_CONFIG.layout.panelBet.cx, 974);

    const addValue = (cx: number, cy: number): Text => {
      const t = new Text({ text: '', style: valueStyle });
      t.anchor.set(0.5);
      t.x = cx;
      t.y = cy;
      this.world.addChild(t);
      return t;
    };

    this.balanceLbl = addValue(GAME_CONFIG.layout.panelBalance.cx, GAME_CONFIG.layout.panelBalance.cy);
    this.winLbl = addValue(GAME_CONFIG.layout.panelWin.cx, GAME_CONFIG.layout.panelWin.cy);
    this.betLbl = addValue(GAME_CONFIG.layout.panelBet.cx, GAME_CONFIG.layout.panelBet.cy);

    this.updateLabels();
  }

  private buildButtons(app: Application) {
    const downSprite = new Sprite(Texture.from('ui_btn_down'));
    this.makeClickable(downSprite, GAME_CONFIG.layout.buttonDown, () => {
      this.gameState.decreaseBet();
      this.updateLabels();
    });
    this.world.addChild(downSprite);

    this.spinSprite = new Sprite(Texture.from('ui_btn_spin'));
    this.makeClickable(this.spinSprite, GAME_CONFIG.layout.buttonSpin, () => this.handleSpin());
    this.world.addChild(this.spinSprite);

    const upSprite = new Sprite(Texture.from('ui_btn_up'));
    this.makeClickable(upSprite, GAME_CONFIG.layout.buttonUp, () => {
      this.gameState.increaseBet();
      this.updateLabels();
    });
    this.world.addChild(upSprite);
  }

  private makeClickable(
    sprite: Sprite,
    hit: { x: number; y: number; r: number },
    onClick: () => void
  ) {
    sprite.eventMode = 'static';
    sprite.cursor = 'pointer';
    sprite.pivot.set(hit.x, hit.y);
    sprite.x = hit.x;
    sprite.y = hit.y;
    sprite.hitArea = new Rectangle(hit.x - hit.r, hit.y - hit.r, hit.r * 2, hit.r * 2);

    sprite.on('pointerover', () => {
      if (sprite.alpha === 1) sprite.scale.set(1.06);
    });
    sprite.on('pointerout', () => sprite.scale.set(1.0));
    sprite.on('pointerdown', () => {
      if (sprite.alpha === 1) sprite.scale.set(0.94);
    });
    sprite.on('pointerup', () => {
      sprite.scale.set(1.0);
      if (sprite.alpha === 1) onClick();
    });
  }

  private setSpinEnabled(enabled: boolean) {
    this.spinSprite.alpha = enabled ? 1.0 : 0.55;
    this.spinSprite.cursor = enabled ? 'pointer' : 'default';
  }

  private async handleSpin() {
    if (this.spinning) return;

    this.spinning = true;
    this.setSpinEnabled(false);
    this.winEffectsManager.clear();
    this.winLbl.text = '$0';
    this.foxCharacter.setMode('idle');

    if (!this.gameState.placeBet()) {
      this.spinning = false;
      this.setSpinEnabled(true);
      return;
    }

    this.updateLabels();

    // Calculate result BEFORE spinning — determines which symbols the reels land on
    const result = this.gameState.resolveSpinResult();
    this.slotMachine.setResult(result.grid);

    await this.slotMachine.startSpin();
  }

  private updateLabels() {
    this.balanceLbl.text = `$${this.gameState.balance.toLocaleString()}`;
    this.betLbl.text = `$${this.gameState.bet.toLocaleString()}`;
    this.winLbl.text = `$${this.gameState.lastWin.toLocaleString()}`;
  }

  private triggerWinEffects() {
    const reelBounds = new Rectangle(
      GAME_CONFIG.layout.gridX,
      GAME_CONFIG.layout.gridY,
      6 * SYMBOL_W,
      5 * SYMBOL_H
    );
    this.winEffectsManager.triggerAll(reelBounds);
  }

  private initializeGameState() {
    this.updateLabels();
  }

  private async fadeInScene(app: Application) {
    await fadeIn(this, app.ticker, 600);
  }
}
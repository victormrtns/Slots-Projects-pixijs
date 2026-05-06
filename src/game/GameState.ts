import { EventEmitter } from '../utils/EventEmitter';
import { GAME_CONFIG } from '../config/GameConfig';

export interface GameStateEvents extends Record<string, any> {
  win: { amount: number };
  lose: void;
}

export class GameState extends EventEmitter<GameStateEvents> {
  private _balance: number = 4000;
  private _bet: number = 100;
  private _lastWin: number = 0;

  get balance(): number {
    return this._balance;
  }

  get bet(): number {
    return this._bet;
  }

  get lastWin(): number {
    return this._lastWin;
  }

  placeBet(): boolean {
    if (this._balance >= this._bet) {
      this._balance -= this._bet;
      return true;
    }
    return false;
  }

  calculateResult(): { won: boolean; amount: number } {
    const winThreshold = 1 - GAME_CONFIG.gameplay.winChance;
    const won = Math.random() > winThreshold;

    if (won) {
      const multiplier = Math.floor(
        Math.random() *
          (GAME_CONFIG.gameplay.maxWinMultiplier - GAME_CONFIG.gameplay.minWinMultiplier + 1) +
          GAME_CONFIG.gameplay.minWinMultiplier
      );
      const amount = this._bet * multiplier;
      this._lastWin = amount;
      this._balance += amount;
      this.emit('win', { amount });
      return { won: true, amount };
    }

    this._lastWin = 0;
    this.emit('lose', undefined);
    return { won: false, amount: 0 };
  }

  increaseBet(step: number = GAME_CONFIG.gameplay.minBetStep): void {
    this._bet += step;
  }

  decreaseBet(step: number = GAME_CONFIG.gameplay.minBetStep): void {
    if (this._bet > step) {
      this._bet -= step;
    }
  }
}

import { EventEmitter } from '../utils/EventEmitter';
import { GAME_CONFIG } from '../config/GameConfig';
import { generateSpinResult, SpinResult, WinLine } from './SpinResultGenerator';

export interface GameStateEvents extends Record<string, any> {
  win: { amount: number; winningLines: WinLine[] };
  lose: void;
}

export class GameState extends EventEmitter<GameStateEvents> {
  private _balance: number = 4000;
  private _bet: number = 100;
  private _lastWin: number = 0;
  private _lastResult: SpinResult | null = null;

  get balance(): number {
    return this._balance;
  }

  get bet(): number {
    return this._bet;
  }

  get lastWin(): number {
    return this._lastWin;
  }

  get lastResult(): SpinResult | null {
    return this._lastResult;
  }

  placeBet(): boolean {
    if (this._balance >= this._bet) {
      this._balance -= this._bet;
      return true;
    }
    return false;
  }

  /** Generate spin result based on real payline evaluation. Call BEFORE spinning the reels. */
  resolveSpinResult(): SpinResult {
    const result = generateSpinResult(this._bet);
    this._lastResult = result;

    if (result.totalWin > 0) {
      this._lastWin = result.totalWin;
      this._balance += result.totalWin;
      this.emit('win', { amount: result.totalWin, winningLines: result.winningLines });
    } else {
      this._lastWin = 0;
      this.emit('lose', undefined);
    }

    return result;
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
import { EventEmitter } from '../utils/EventEmitter';
import { GAME_CONFIG } from '../config/GameConfig';
import { api, SpinResponse, WinLine, WinTier } from './api';

export interface GameStateEvents extends Record<string, any> {
  win: { amount: number; winningLines: WinLine[] };
  lose: void;
  balance: { balance: number };
  error: { message: string };
}

export class GameState extends EventEmitter<GameStateEvents> {
  private _balance: number = 0;
  private _bet: number = 100;
  private _lastWin: number = 0;
  private _lastResult: SpinResponse | null = null;

  get balance(): number {
    return this._balance;
  }

  get bet(): number {
    return this._bet;
  }

  get lastWin(): number {
    return this._lastWin;
  }

  get lastResult(): SpinResponse | null {
    return this._lastResult;
  }

  get lastTier(): WinTier {
    return this._lastResult?.tier ?? 'none';
  }

  async initialize(): Promise<void> {
    try {
      const info = await api.getPlayer();
      this._balance = info.balance;
      this.emit('balance', { balance: this._balance });
    } catch (err) {
      this.emit('error', { message: (err as Error).message });
    }
  }

  async requestSpin(): Promise<SpinResponse | null> {
    if (this._balance < this._bet) return null;
    try {
      const result = await api.postSpin(this._bet);
      this._lastResult = result;
      this._balance = result.balance;
      this._lastWin = result.totalWin;
      this.emit('balance', { balance: this._balance });

      if (result.totalWin > 0) {
        this.emit('win', { amount: result.totalWin, winningLines: result.wins });
      } else {
        this.emit('lose', undefined);
      }
      return result;
    } catch (err) {
      this.emit('error', { message: (err as Error).message });
      return null;
    }
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

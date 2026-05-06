import { SymbolKey, SYMBOL_KEYS } from '../assets/assets';
import { PAYTABLE, SYMBOL_WEIGHTS } from '../config/Paytable';
import { PAYLINES, REEL_COUNT, ROW_COUNT } from '../config/Paylines';

export interface WinLine {
  paylineIndex: number;
  symbol: SymbolKey;
  count: number;
  payout: number;
  positions: Array<{ col: number; row: number }>;
}

export interface SpinResult {
  /** grid[col][row] — 6 columns, 5 rows each */
  grid: SymbolKey[][];
  totalWin: number;
  winningLines: WinLine[];
}

/** Weighted random pool — built once, sampled by index. */
const WEIGHTED_POOL: SymbolKey[] = buildWeightedPool();

function buildWeightedPool(): SymbolKey[] {
  const pool: SymbolKey[] = [];
  for (const key of SYMBOL_KEYS) {
    const weight = SYMBOL_WEIGHTS[key];
    for (let i = 0; i < weight; i++) {
      pool.push(key);
    }
  }
  return pool;
}

function pickRandomSymbol(): SymbolKey {
  return WEIGHTED_POOL[Math.floor(Math.random() * WEIGHTED_POOL.length)];
}

function generateGrid(): SymbolKey[][] {
  const grid: SymbolKey[][] = [];
  for (let col = 0; col < REEL_COUNT; col++) {
    const column: SymbolKey[] = [];
    for (let row = 0; row < ROW_COUNT; row++) {
      column.push(pickRandomSymbol());
    }
    grid.push(column);
  }
  return grid;
}

function evaluatePaylines(grid: SymbolKey[][], bet: number): { totalWin: number; winningLines: WinLine[] } {
  const winningLines: WinLine[] = [];
  let totalWin = 0;

  for (let pi = 0; pi < PAYLINES.length; pi++) {
    const payline = PAYLINES[pi];
    const firstSymbol = grid[0][payline[0]];
    let count = 1;

    for (let col = 1; col < REEL_COUNT; col++) {
      if (grid[col][payline[col]] === firstSymbol) {
        count++;
      } else {
        break;
      }
    }

    if (count >= 3) {
      const multiplier = PAYTABLE[firstSymbol][count];
      if (multiplier !== undefined && multiplier > 0) {
        const payout = Math.round(bet * multiplier);
        totalWin += payout;

        const positions: Array<{ col: number; row: number }> = [];
        for (let col = 0; col < count; col++) {
          positions.push({ col, row: payline[col] });
        }

        winningLines.push({
          paylineIndex: pi,
          symbol: firstSymbol,
          count,
          payout,
          positions,
        });
      }
    }
  }

  return { totalWin, winningLines };
}

export function generateSpinResult(bet: number): SpinResult {
  const grid = generateGrid();
  const { totalWin, winningLines } = evaluatePaylines(grid, bet);
  return { grid, totalWin, winningLines };
}
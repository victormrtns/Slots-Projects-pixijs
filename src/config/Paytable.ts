import { SymbolKey } from '../assets/assets';

/** Multipliers per symbol: key = consecutive count (3–6), value = bet multiplier */
export const PAYTABLE: Record<SymbolKey, Partial<Record<number, number>>> = {
  // Premium symbols (thematic)
  safe:       { 3: 5,   4: 15,  5: 40,  6: 100 },
  bank:       { 3: 4,   4: 12,  5: 35,  6: 80 },
  dynamite:   { 3: 3,   4: 10,  5: 25,  6: 60 },
  handcuffs:  { 3: 2,   4: 8,   5: 20,  6: 50 },
  camera:     { 3: 2,   4: 6,   5: 15,  6: 40 },

  // Low symbols (letters/numbers)
  letterA:    { 3: 1,   4: 3,   5: 8,   6: 20 },
  letterK:    { 3: 1,   4: 3,   5: 7,   6: 18 },
  letterQ:    { 3: 0.8, 4: 2.5, 5: 6,   6: 15 },
  letterJ:    { 3: 0.8, 4: 2,   5: 5,   6: 12 },
  number10:   { 3: 0.5, 4: 1.5, 5: 4,   6: 10 },
};

/** Reel weight per symbol — lower = rarer. Used when generating random grids. */
export const SYMBOL_WEIGHTS: Record<SymbolKey, number> = {
  safe:       1,
  bank:       1,
  dynamite:   2,
  handcuffs:  2,
  camera:     2,
  letterA:    3,
  letterK:    3,
  letterQ:    4,
  letterJ:    4,
  number10:   4,
};
/**
 * Each payline is an array of 6 numbers.
 * Index = column (0-5), value = row (0-4, top to bottom).
 *
 * Example: [2,2,2,2,2,2] = middle horizontal line.
 */
export type Payline = readonly number[];

export const PAYLINES: readonly Payline[] = [
  [2, 2, 2, 2, 2, 2],  // 1  — centre horizontal
  [0, 0, 0, 0, 0, 0],  // 2  — top horizontal
  [4, 4, 4, 4, 4, 4],  // 3  — bottom horizontal
  [0, 1, 2, 2, 1, 0],  // 4  — inverted V
  [4, 3, 2, 2, 3, 4],  // 5  — V shape
  [1, 1, 1, 1, 1, 1],  // 6  — second row
  [3, 3, 3, 3, 3, 3],  // 7  — fourth row
  [0, 0, 1, 1, 0, 0],  // 8  — slight dip top
  [4, 4, 3, 3, 4, 4],  // 9  — slight rise bottom
  [0, 1, 2, 3, 4, 4],  // 10 — diagonal descending
  [4, 3, 2, 1, 0, 0],  // 11 — diagonal ascending
  [2, 1, 0, 0, 1, 2],  // 12 — mountain top
  [2, 3, 4, 4, 3, 2],  // 13 — valley bottom
  [1, 0, 0, 0, 0, 1],  // 14 — flat top with edges
  [3, 4, 4, 4, 4, 3],  // 15 — flat bottom with edges
  [0, 1, 1, 1, 1, 0],  // 16 — shallow dip top
  [4, 3, 3, 3, 3, 4],  // 17 — shallow rise bottom
  [1, 2, 3, 2, 1, 0],  // 18 — wave down
  [3, 2, 1, 2, 3, 4],  // 19 — wave up
  [2, 2, 1, 1, 2, 2],  // 20 — centre with top bump
] as const;

export const REEL_COUNT = 6;
export const ROW_COUNT = 5;
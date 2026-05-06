import { GAME_WIDTH } from '../app';

// PSD source canvas dimensions
const PSD_W = 1920;
const PSD_H = 1080;

// Layout scale
export const WORLD_SCALE = GAME_WIDTH / PSD_W;

export const GAME_CONFIG = {
  layout: {
    gridX: 429,
    gridY: 156,
    panelBalance: { cx: 558, cy: 1023 },
    panelWin: { cx: 847, cy: 1022 },
    panelBet: { cx: 1115, cy: 1023 },
    buttonDown: { x: 1301, y: 1016, r: 50 },
    buttonSpin: { x: 1436, y: 1023, r: 75 },
    buttonUp: { x: 1571, y: 1016, r: 50 },
    foxBottomX: 1729,
    foxBottomY: 988,
    foxScalePSD: 0.96,
    psdWidth: PSD_W,
    psdHeight: PSD_H,
  },
  gameplay: {
    winChance: 0.38,
    minBetStep: 10,
    minWinMultiplier: 2,
    maxWinMultiplier: 12,
  },
  animation: {
    foxFPS: 18,
    symbolAnimFPS: 22,
    coinCount: 24,
    spinSpeed: 48,
    bounceAmount: 22,
    glowDurationMS: 800,
    coinGravity: 0.7,
    bigWinFPS: 24,
    bigWinLoops: 2,
    reelCascadeMS: 180,
  },
} as const;

import { Assets } from 'pixi.js';

export const SYMBOL_KEYS = [
  'bank', 'camera', 'dynamite', 'handcuffs',
  'letterA', 'letterJ', 'letterK', 'letterQ', 'number10', 'safe',
] as const;

export type SymbolKey = (typeof SYMBOL_KEYS)[number];

export const SYMBOL_ANIM_FRAMES = 46;

export const FOX_IDLE_FRAMES  = 21;
export const FOX_WIN_FRAMES   = 21;
export const COIN_FRAMES      = 46;
export const BIG_WIN_FRAMES   = 46;

const symbolAssets = Object.fromEntries(
  SYMBOL_KEYS.map((k) => [k, `/assets/symbols/${k}.png`])
);

// Animated symbol frames: <key>_00 .. <key>_45 → /assets/symbols_anim/<key>/<key>_NN.png
const symbolAnimAssets = Object.fromEntries(
  SYMBOL_KEYS.flatMap((k) =>
    Array.from({ length: SYMBOL_ANIM_FRAMES }, (_, i) => {
      const n = String(i).padStart(2, '0');
      return [`${k}_${n}`, `/assets/symbols_anim/${k}/${k}_${n}.png`];
    })
  )
);

const makeFrameAssets = (
  prefix: string,
  folder: string,
  count: number,
  padLen = 2,
) =>
  Object.fromEntries(
    Array.from({ length: count }, (_, i) => {
      const n = String(i).padStart(padLen, '0');
      return [`${prefix}_${n}`, `/assets/${folder}/${prefix}_${n}.png`];
    })
  );

// Fox-Idle_00 … Fox-Idle_20
const foxIdleAssets = Object.fromEntries(
  Array.from({ length: FOX_IDLE_FRAMES }, (_, i) => {
    const n = String(i).padStart(2, '0');
    return [`fox_idle_${n}`, `/assets/character/idle/Fox-Idle_${n}.png`];
  })
);
// Win_00 … Win_20
const foxWinAssets = Object.fromEntries(
  Array.from({ length: FOX_WIN_FRAMES }, (_, i) => {
    const n = String(i).padStart(2, '0');
    return [`fox_win_${n}`, `/assets/character/win/Win_${n}.png`];
  })
);

// Golden_coin_1_00 … _45
const coinAssets = Object.fromEntries(
  Array.from({ length: COIN_FRAMES }, (_, i) => {
    const n = String(i).padStart(2, '0');
    return [`coin_${n}`, `/assets/coins/Golden_coin_1_${n}.png`];
  })
);

// Big_Win_00 … _45
const bigWinAssets = Object.fromEntries(
  Array.from({ length: BIG_WIN_FRAMES }, (_, i) => {
    const n = String(i).padStart(2, '0');
    return [`bigwin_${n}`, `/assets/wins/big_win/Big_Win_${n}.png`];
  })
);

void makeFrameAssets; // unused helper kept for reference

// UI assets extracted from MAIN GAME.psd
const uiAssets = {
  ui_bg:            '/assets/ui/bg.png',
  ui_frame:         '/assets/ui/machine_frame.png',
  ui_logo:          '/assets/ui/game_logo.png',
  ui_panel_balance: '/assets/ui/panel_balance.png',
  ui_panel_win:     '/assets/ui/panel_win.png',
  ui_panel_bet:     '/assets/ui/panel_bet.png',
  ui_btn_down:      '/assets/ui/btn_green_0.png',
  ui_btn_up:        '/assets/ui/btn_green_1.png',
  ui_btn_spin:      '/assets/ui/btn_spin.png',
};

export const ASSET_MANIFEST = {
  bundles: [
    {
      name: 'game',
      assets: {
        ...symbolAssets,
        ...symbolAnimAssets,
        ...foxIdleAssets,
        ...foxWinAssets,
        ...coinAssets,
        ...bigWinAssets,
        ...uiAssets,
      },
    },
  ],
};

export async function loadAssets(): Promise<void> {
  await Assets.init({ manifest: ASSET_MANIFEST });
  await Assets.loadBundle('game');
}

export const getFoxIdleKeys = () =>
  Array.from({ length: FOX_IDLE_FRAMES }, (_, i) => `fox_idle_${String(i).padStart(2, '0')}`);

export const getFoxWinKeys = () =>
  Array.from({ length: FOX_WIN_FRAMES }, (_, i) => `fox_win_${String(i).padStart(2, '0')}`);

export const getCoinKeys = () =>
  Array.from({ length: COIN_FRAMES }, (_, i) => `coin_${String(i).padStart(2, '0')}`);

export const getBigWinKeys = () =>
  Array.from({ length: BIG_WIN_FRAMES }, (_, i) => `bigwin_${String(i).padStart(2, '0')}`);

/** Animation-frame keys for a given symbol — e.g. ['bank_00', 'bank_01', ... 'bank_45'] */
export const getSymbolAnimKeys = (key: SymbolKey): string[] =>
  Array.from({ length: SYMBOL_ANIM_FRAMES }, (_, i) => `${key}_${String(i).padStart(2, '0')}`);

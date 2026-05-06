import { Assets } from 'pixi.js';

export const SYMBOL_KEYS = [
  'bank', 'camera', 'dynamite', 'handcuffs',
  'letterA', 'letterJ', 'letterK', 'letterQ', 'number10', 'safe',
] as const;

export type SymbolKey = (typeof SYMBOL_KEYS)[number];

export const SYMBOL_ANIM_FRAMES = 46;
export const FOX_IDLE_FRAMES = 21;
export const FOX_WIN_FRAMES = 21;
export const COIN_FRAMES = 46;
export const BIG_WIN_FRAMES = 46;
export const MEGA_WIN_FRAMES = 46;
export const SUPER_MEGA_WIN_FRAMES = 46;
export const TOTAL_WIN_FRAMES = 46;

// DRY helper: generates frame keys and asset paths
function getFrameAssets(
  prefix: string,
  folder: string,
  count: number,
  filenamePattern: (n: string) => string = (n) => `${prefix}_${n}`,
  padLen = 2,
): Record<string, string> {
  return Object.fromEntries(
    Array.from({ length: count }, (_, i) => {
      const n = String(i).padStart(padLen, '0');
      const key = `${prefix}_${n}`;
      const path = `/assets/${folder}/${filenamePattern(n)}.png`;
      return [key, path];
    })
  );
}

function getFrameKeys(prefix: string, count: number, padLen = 2): string[] {
  return Array.from({ length: count }, (_, i) => `${prefix}_${String(i).padStart(padLen, '0')}`);
}

const symbolAssets = Object.fromEntries(SYMBOL_KEYS.map((k) => [k, `/assets/symbols/${k}.png`]));

// Animated symbol frames
const symbolAnimAssets = Object.fromEntries(
  SYMBOL_KEYS.flatMap((k) =>
    Array.from({ length: SYMBOL_ANIM_FRAMES }, (_, i) => {
      const n = String(i).padStart(2, '0');
      return [`${k}_${n}`, `/assets/symbols_anim/${k}/${k}_${n}.png`];
    })
  )
);

// Fox animations
const foxIdleAssets = getFrameAssets('fox_idle', 'character/idle', FOX_IDLE_FRAMES, (n) => `Fox-Idle_${n}`);
const foxWinAssets = getFrameAssets('fox_win', 'character/win', FOX_WIN_FRAMES, (n) => `Win_${n}`);

// Effects
const coinAssets = getFrameAssets('coin', 'coins', COIN_FRAMES, (n) => `Golden_coin_1_${n}`);
const bigWinAssets = getFrameAssets('bigwin', 'wins/big_win', BIG_WIN_FRAMES, (n) => `Big_Win_${n}`);
const megaWinAssets = getFrameAssets('megawin', 'wins/mega_win', MEGA_WIN_FRAMES, (n) => `Mega_Win_${n}`);
const superMegaWinAssets = getFrameAssets('supermegawin', 'wins/super_mega_win', SUPER_MEGA_WIN_FRAMES, (n) => `Super_Mega_Win_${n}`);
const totalWinAssets = getFrameAssets('totalwin', 'wins/total_win', TOTAL_WIN_FRAMES, (n) => `Total_Win_${n}`);

const uiAssets = {
  ui_bg: '/assets/ui/bg.png',
  ui_frame: '/assets/ui/machine_frame.png',
  ui_logo: '/assets/ui/game_logo.png',
  ui_panel_balance: '/assets/ui/panel_balance.png',
  ui_panel_win: '/assets/ui/panel_win.png',
  ui_panel_bet: '/assets/ui/panel_bet.png',
  ui_btn_down: '/assets/ui/btn_green_0.png',
  ui_btn_up: '/assets/ui/btn_green_1.png',
  ui_btn_spin: '/assets/ui/btn_spin.png',
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
        ...megaWinAssets,
        ...superMegaWinAssets,
        ...totalWinAssets,
        ...uiAssets,
      },
    },
  ],
};

export async function loadAssets(): Promise<void> {
  await Assets.init({ manifest: ASSET_MANIFEST });
  await Assets.loadBundle('game');
}

export const getFoxIdleKeys = (): string[] => getFrameKeys('fox_idle', FOX_IDLE_FRAMES);
export const getFoxWinKeys = (): string[] => getFrameKeys('fox_win', FOX_WIN_FRAMES);
export const getCoinKeys = (): string[] => getFrameKeys('coin', COIN_FRAMES);
export const getBigWinKeys = (): string[] => getFrameKeys('bigwin', BIG_WIN_FRAMES);
export const getMegaWinKeys = (): string[] => getFrameKeys('megawin', MEGA_WIN_FRAMES);
export const getSuperMegaWinKeys = (): string[] => getFrameKeys('supermegawin', SUPER_MEGA_WIN_FRAMES);
export const getTotalWinKeys = (): string[] => getFrameKeys('totalwin', TOTAL_WIN_FRAMES);

export const getSymbolAnimKeys = (key: SymbolKey): string[] =>
  getFrameKeys(key, SYMBOL_ANIM_FRAMES);
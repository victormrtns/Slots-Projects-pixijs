import { SymbolKey } from '../assets/assets';

export type WinTier = 'none' | 'big_win' | 'mega_win' | 'super_mega_win' | 'total_win';

export interface WinLine {
  paylineIndex: number;
  symbol: SymbolKey;
  count: number;
  payout: number;
  positions: Array<{ col: number; row: number }>;
}

export interface SpinResponse {
  grid: SymbolKey[][];
  wins: WinLine[];
  totalWin: number;
  multiplier: number;
  tier: WinTier;
  balance: number;
}

export interface PlayerInfo {
  balance: number;
}

const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:8000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      /* ignore */
    }
    throw new Error(`API ${path} failed: ${detail}`);
  }
  return (await res.json()) as T;
}

export const api = {
  postSpin: (bet: number) =>
    request<SpinResponse>('/spin', { method: 'POST', body: JSON.stringify({ bet }) }),
  getPlayer: () => request<PlayerInfo>('/player'),
};

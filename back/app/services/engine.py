"""Authoritative slot game engine.

Mirrors the original frontend SpinResultGenerator.ts so behavior is preserved.
"""

import secrets

from app.utils.paylines import PAYLINES, REEL_COUNT, ROW_COUNT
from app.utils.paytable import PAYTABLE, SYMBOL_WEIGHTS, resolve_tier

# Weighted pool built once at import.
_WEIGHTED_POOL: list[str] = []
for _key, _weight in SYMBOL_WEIGHTS.items():
    _WEIGHTED_POOL.extend([_key] * _weight)


def _pick_symbol() -> str:
    # secrets.randbelow uses a CSPRNG — preferable to random.random for an
    # authoritative server-side RNG.
    return _WEIGHTED_POOL[secrets.randbelow(len(_WEIGHTED_POOL))]


def _generate_grid() -> list[list[str]]:
    return [[_pick_symbol() for _ in range(ROW_COUNT)] for _ in range(REEL_COUNT)]


def _evaluate_paylines(grid: list[list[str]], bet: int):
    wins = []
    total_win = 0

    for pi, payline in enumerate(PAYLINES):
        first_symbol = grid[0][payline[0]]
        count = 1
        for col in range(1, REEL_COUNT):
            if grid[col][payline[col]] == first_symbol:
                count += 1
            else:
                break

        if count >= 3:
            mult = PAYTABLE.get(first_symbol, {}).get(count)
            if mult and mult > 0:
                payout = round(bet * mult)
                total_win += payout
                positions = [{"col": c, "row": payline[c]} for c in range(count)]
                wins.append({
                    "paylineIndex": pi,
                    "symbol": first_symbol,
                    "count": count,
                    "payout": payout,
                    "positions": positions,
                })

    return total_win, wins


def generate_spin(bet: int) -> dict:
    grid = _generate_grid()
    total_win, wins = _evaluate_paylines(grid, bet)
    multiplier = (total_win / bet) if bet > 0 else 0.0
    tier = resolve_tier(total_win, bet)
    return {
        "grid": grid,
        "wins": wins,
        "totalWin": total_win,
        "multiplier": round(multiplier, 2),
        "tier": tier,
    }

"""Paytable + symbol rarity weights.

Symbol keys match frontend asset keys exactly so the response can be rendered
without translation.
"""

# Frontend SymbolKey values (camelCase to mirror TS)
SYMBOLS = [
    "safe",
    "bank",
    "dynamite",
    "handcuffs",
    "camera",
    "letterA",
    "letterK",
    "letterQ",
    "letterJ",
    "number10",
]

# Rarity tiers as specified in the technical test (lower = rarer).
# 1=safe/bank, 2=dynamite/handcuffs/camera, 3=A/K, 4=Q/J/10
SYMBOL_WEIGHTS: dict[str, int] = {
    "safe": 1,
    "bank": 1,
    "dynamite": 2,
    "handcuffs": 2,
    "camera": 2,
    "letterA": 3,
    "letterK": 3,
    "letterQ": 4,
    "letterJ": 4,
    "number10": 4,
}

# Bet multiplier per consecutive count (3-6). Preserves frontend Paytable.ts.
PAYTABLE: dict[str, dict[int, float]] = {
    "safe":      {3: 5,   4: 15,  5: 40, 6: 100},
    "bank":      {3: 4,   4: 12,  5: 35, 6: 80},
    "dynamite":  {3: 3,   4: 10,  5: 25, 6: 60},
    "handcuffs": {3: 2,   4: 8,   5: 20, 6: 50},
    "camera":    {3: 2,   4: 6,   5: 15, 6: 40},
    "letterA":   {3: 1,   4: 3,   5: 8,  6: 20},
    "letterK":   {3: 1,   4: 3,   5: 7,  6: 18},
    "letterQ":   {3: 0.8, 4: 2.5, 5: 6,  6: 15},
    "letterJ":   {3: 0.8, 4: 2,   5: 5,  6: 12},
    "number10":  {3: 0.5, 4: 1.5, 5: 4,  6: 10},
}

WIN_TIERS = {
    "bigWin": 2,
    "megaWin": 4,
    "superMegaWin": 8,
    "totalWin": 25,
}


def resolve_tier(total_win: int, bet: int) -> str:
    if bet <= 0 or total_win <= 0:
        return "none"
    m = total_win / bet
    if m >= WIN_TIERS["totalWin"]:
        return "total_win"
    if m >= WIN_TIERS["superMegaWin"]:
        return "super_mega_win"
    if m >= WIN_TIERS["megaWin"]:
        return "mega_win"
    if m >= WIN_TIERS["bigWin"]:
        return "big_win"
    return "none"

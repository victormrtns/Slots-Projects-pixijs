from datetime import datetime
from typing import List

from pydantic import BaseModel, Field


class SpinRequest(BaseModel):
    bet: int = Field(..., gt=0, description="Bet amount in credits")


class WinPosition(BaseModel):
    col: int
    row: int


class WinLine(BaseModel):
    paylineIndex: int
    symbol: str
    count: int
    payout: int
    positions: List[WinPosition]


class SpinResponse(BaseModel):
    grid: List[List[str]]
    wins: List[WinLine]
    totalWin: int
    multiplier: float
    tier: str
    balance: int


class HistoryEntry(BaseModel):
    id: int
    createdAt: datetime
    bet: int
    totalWin: int
    multiplier: float
    tier: str

    class Config:
        from_attributes = True


class StatsResponse(BaseModel):
    totalSpins: int
    totalBet: int
    totalPaid: int
    rtp: float
    bigWins: int
    biggestWin: int

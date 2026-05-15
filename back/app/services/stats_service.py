from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.spin import Spin


def get_stats(db: Session) -> dict:
    row = db.query(
        func.count(Spin.id),
        func.coalesce(func.sum(Spin.bet), 0),
        func.coalesce(func.sum(Spin.total_win), 0),
        func.coalesce(func.max(Spin.total_win), 0),
    ).one()
    total_spins, total_bet, total_paid, biggest_win = row
    big_wins = (
        db.query(func.count(Spin.id))
        .filter(Spin.win_tier.in_(["big_win", "mega_win", "super_mega_win", "total_win"]))
        .scalar()
    )
    rtp = round((total_paid / total_bet) * 100, 2) if total_bet else 0.0
    return {
        "totalSpins": int(total_spins),
        "totalBet": int(total_bet),
        "totalPaid": int(total_paid),
        "rtp": rtp,
        "bigWins": int(big_wins or 0),
        "biggestWin": int(biggest_win),
    }


def get_history(db: Session, limit: int = 50) -> list:
    spins = (
        db.query(Spin)
        .order_by(Spin.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": s.id,
            "createdAt": s.created_at,
            "bet": s.bet,
            "totalWin": s.total_win,
            "multiplier": s.multiplier,
            "tier": s.win_tier,
        }
        for s in spins
    ]

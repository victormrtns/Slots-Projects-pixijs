import json

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.spin import Spin
from app.services.engine import generate_spin
from app.services.player_service import get_or_create_player


def execute_spin(db: Session, bet: int) -> dict:
    if bet <= 0:
        raise HTTPException(status_code=400, detail="bet must be positive")

    player = get_or_create_player(db)
    if player.balance < bet:
        raise HTTPException(status_code=400, detail="insufficient balance")

    result = generate_spin(bet)

    player.balance = player.balance - bet + result["totalWin"]

    spin = Spin(
        bet=bet,
        total_win=result["totalWin"],
        multiplier=result["multiplier"],
        win_tier=result["tier"],
        grid_json=json.dumps(result["grid"]),
        paylines_json=json.dumps(result["wins"]),
    )
    db.add(spin)
    db.commit()
    db.refresh(player)

    return {
        "grid": result["grid"],
        "wins": result["wins"],
        "totalWin": result["totalWin"],
        "multiplier": result["multiplier"],
        "tier": result["tier"],
        "balance": player.balance,
    }

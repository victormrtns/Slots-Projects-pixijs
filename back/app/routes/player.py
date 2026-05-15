from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.player_service import get_or_create_player

router = APIRouter()


class PlayerInfo(BaseModel):
    balance: int


@router.get("/player", response_model=PlayerInfo)
def player_info(db: Session = Depends(get_db)):
    p = get_or_create_player(db)
    return PlayerInfo(balance=p.balance)

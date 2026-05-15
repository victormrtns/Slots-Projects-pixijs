import os

from sqlalchemy.orm import Session

from app.models.player import Player

STARTING_BALANCE = int(os.getenv("STARTING_BALANCE", "4000"))
DEFAULT_PLAYER = "default"


def get_or_create_player(db: Session, name: str = DEFAULT_PLAYER) -> Player:
    player = db.query(Player).filter(Player.name == name).first()
    if player is None:
        player = Player(name=name, balance=STARTING_BALANCE)
        db.add(player)
        db.commit()
        db.refresh(player)
    return player

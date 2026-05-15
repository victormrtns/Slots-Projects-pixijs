from sqlalchemy import Column, Integer, String

from app.database import Base


class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(64), unique=True, nullable=False, default="default")
    balance = Column(Integer, nullable=False, default=4000)

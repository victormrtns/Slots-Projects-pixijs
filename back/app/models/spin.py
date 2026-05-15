from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, Text

from app.database import Base


class Spin(Base):
    __tablename__ = "spins"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    bet = Column(Integer, nullable=False)
    total_win = Column(Integer, nullable=False, default=0)
    multiplier = Column(Float, nullable=False, default=0.0)
    win_tier = Column(String(32), nullable=False, default="none")
    grid_json = Column(Text, nullable=False)
    paylines_json = Column(Text, nullable=False)

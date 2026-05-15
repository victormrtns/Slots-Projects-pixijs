from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.spin import StatsResponse
from app.services.stats_service import get_stats

router = APIRouter()


@router.get("/stats", response_model=StatsResponse)
def stats(db: Session = Depends(get_db)):
    return get_stats(db)

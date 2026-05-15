from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.spin import HistoryEntry
from app.services.stats_service import get_history

router = APIRouter()


@router.get("/history", response_model=List[HistoryEntry])
def list_history(
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=500),
):
    return get_history(db, limit=limit)

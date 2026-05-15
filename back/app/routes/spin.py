from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.spin import SpinRequest, SpinResponse
from app.services.spin_service import execute_spin

router = APIRouter()


@router.post("/spin", response_model=SpinResponse)
def post_spin(payload: SpinRequest, db: Session = Depends(get_db)):
    return execute_spin(db, payload.bet)

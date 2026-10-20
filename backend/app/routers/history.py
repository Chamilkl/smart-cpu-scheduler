from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import SimulationHistory
from app.schemas import HistoryResponse

router = APIRouter()

@router.get("/", response_model=List[HistoryResponse])
def get_history(
    session_id: Optional[str] = Query(None),
    algorithm: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(SimulationHistory)
    if session_id:
        query = query.filter(SimulationHistory.session_id == session_id)
    if algorithm:
        query = query.filter(SimulationHistory.algorithm == algorithm)
    return query.order_by(SimulationHistory.created_at.desc()).offset(offset).limit(limit).all()

@router.delete("/{history_id}")
def delete_history(history_id: int, db: Session = Depends(get_db)):
    record = db.query(SimulationHistory).filter(SimulationHistory.id == history_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="History not found")
    db.delete(record)
    db.commit()
    return {"message": "Deleted successfully"}

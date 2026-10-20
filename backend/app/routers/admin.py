from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import SimulationHistory, TestDataset

router = APIRouter()

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_simulations = db.query(SimulationHistory).count()
    by_algorithm = db.query(
        SimulationHistory.algorithm,
        func.count(SimulationHistory.id)
    ).group_by(SimulationHistory.algorithm).all()
    
    return {
        "total_simulations": total_simulations,
        "by_algorithm": {algo: count for algo, count in by_algorithm},
        "database": "SQLite",
        "status": "operational"
    }

@router.get("/datasets")
def list_datasets(db: Session = Depends(get_db)):
    return db.query(TestDataset).all()

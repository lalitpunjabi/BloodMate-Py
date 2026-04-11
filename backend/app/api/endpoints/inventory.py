from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.db import models
from app.schemas import schemas

router = APIRouter()

@router.post("/", response_model=schemas.BloodUnitResponse)
def add_blood_unit(
    unit: schemas.BloodUnitCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin)
):
    db_unit = models.BloodUnit(**unit.model_dump())
    db.add(db_unit)
    
    # Simple gamification: Give donor points if linked
    if unit.donor_id:
        donor = db.query(models.DonorProfile).filter(models.DonorProfile.id == unit.donor_id).first()
        if donor:
            donor.user.points += 50
            donor.user.streak += 1
            
    db.commit()
    db.refresh(db_unit)
    return db_unit

@router.get("/", response_model=List[schemas.BloodUnitResponse])
def get_inventory(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    return db.query(models.BloodUnit).filter(models.BloodUnit.status == "Available").all()

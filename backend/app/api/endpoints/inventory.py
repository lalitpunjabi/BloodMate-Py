from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.db import models
from app.schemas import schemas

router = APIRouter()


def sync_expired_units(db: Session) -> None:
    db.query(models.BloodUnit).filter(
        models.BloodUnit.status == "Available",
        models.BloodUnit.expiry_date < datetime.utcnow(),
    ).update({"status": "Expired"}, synchronize_session=False)
    db.commit()

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
    sync_expired_units(db)
    return db.query(models.BloodUnit).filter(models.BloodUnit.status == "Available").all()


@router.get("/alerts")
def get_inventory_alerts(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    sync_expired_units(db)
    expiring_before = datetime.utcnow() + timedelta(days=7)
    expiring_units = db.query(models.BloodUnit).filter(
        models.BloodUnit.status == "Available",
        models.BloodUnit.expiry_date <= expiring_before,
    ).order_by(models.BloodUnit.expiry_date.asc()).all()

    return {
        "expiring_units_count": len(expiring_units),
        "expiring_soon": [
            {
                "id": unit.id,
                "blood_group": unit.blood_group,
                "expiry_date": unit.expiry_date,
                "status": unit.status,
            }
            for unit in expiring_units
        ],
    }

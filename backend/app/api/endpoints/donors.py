from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.db import models
from app.schemas import schemas

router = APIRouter()

@router.post("/", response_model=schemas.DonorProfileResponse)
def create_donor_profile(
    profile: schemas.DonorProfileCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    existing = db.query(models.DonorProfile).filter(models.DonorProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists for this user")
        
    db_profile = models.DonorProfile(
        user_id=current_user.id,
        blood_group=profile.blood_group,
        phone=profile.phone,
        address=profile.address
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.get("/", response_model=List[schemas.DonorProfileResponse])
def get_donors(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin)
):
    return db.query(models.DonorProfile).all()

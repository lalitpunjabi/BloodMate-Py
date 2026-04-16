from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.db import models
from app.schemas import schemas

router = APIRouter()


@router.post("/", response_model=schemas.RecipientProfileResponse)
def create_recipient_profile(
    profile: schemas.RecipientProfileCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    db_profile = models.RecipientProfile(
        **profile.model_dump(),
        created_by=current_user.id,
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile


@router.get("/", response_model=List[schemas.RecipientProfileResponse])
def get_recipients(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    query = db.query(models.RecipientProfile)
    if current_user.role != models.RoleEnum.admin:
        query = query.filter(models.RecipientProfile.created_by == current_user.id)
    return query.order_by(models.RecipientProfile.created_at.desc()).all()

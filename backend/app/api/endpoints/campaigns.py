from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.db import models
from app.schemas import schemas

router = APIRouter()

@router.post("/", response_model=schemas.CampaignResponse)
def create_campaign(
    campaign: schemas.CampaignCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin)
):
    db_campaign = models.Campaign(**campaign.model_dump())
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign

@router.get("/", response_model=List[schemas.CampaignResponse])
def get_campaigns(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    return db.query(models.Campaign).order_by(models.Campaign.date.desc()).all()

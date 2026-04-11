from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.db import models
from app.schemas import schemas

router = APIRouter()

@router.post("/", response_model=schemas.BloodRequestResponse)
def create_request(
    request: schemas.BloodRequestCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    db_request = models.BloodRequest(
        **request.model_dump(),
        requested_by=current_user.id
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@router.get("/", response_model=List[schemas.BloodRequestResponse])
def get_requests(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    # If standard user, only see own requests or emergency requests
    if current_user.role == models.RoleEnum.user:
        return db.query(models.BloodRequest).filter(
            (models.BloodRequest.requested_by == current_user.id) | 
            (models.BloodRequest.urgency_level == "Emergency")
        ).all()
        
    return db.query(models.BloodRequest).all()

@router.patch("/{req_id}/status", response_model=schemas.BloodRequestResponse)
def update_status(
    req_id: int,
    status: models.RequestStatusEnum,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin)
):
    db_request = db.query(models.BloodRequest).filter(models.BloodRequest.id == req_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
        
    db_request.status = status
    db.commit()
    db.refresh(db_request)
    return db_request

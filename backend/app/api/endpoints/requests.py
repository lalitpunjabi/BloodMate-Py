from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.core.blood_compatibility import get_compatible_donor_groups
from app.db import models
from app.schemas import schemas

router = APIRouter()


def enrich_request_with_matches(
    db: Session, request_obj: models.BloodRequest
) -> schemas.BloodRequestResponse:
    compatible_groups = get_compatible_donor_groups(request_obj.blood_group)
    available_units = db.query(models.BloodUnit).filter(
        models.BloodUnit.status == "Available",
        models.BloodUnit.blood_group.in_(compatible_groups),
    ).count()

    payload = schemas.BloodRequestResponse.model_validate(request_obj, from_attributes=True)
    payload.compatible_available_units = available_units
    payload.compatible_blood_groups = compatible_groups
    return payload

@router.post("/", response_model=schemas.BloodRequestResponse)
def create_request(
    request: schemas.BloodRequestCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    payload = request.model_dump(exclude={"recipient_profile_id"})
    if request.recipient_profile_id is not None:
        recipient = db.query(models.RecipientProfile).filter(
            models.RecipientProfile.id == request.recipient_profile_id
        ).first()
        if not recipient:
            raise HTTPException(status_code=404, detail="Recipient profile not found")
        payload["patient_name"] = recipient.full_name
        payload["blood_group"] = recipient.blood_group
        payload["hospital"] = recipient.hospital

    db_request = models.BloodRequest(
        **payload,
        requested_by=current_user.id
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return enrich_request_with_matches(db, db_request)

@router.get("/", response_model=List[schemas.BloodRequestResponse])
def get_requests(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    # If standard user, only see own requests or emergency requests
    if current_user.role == models.RoleEnum.user:
        results = db.query(models.BloodRequest).filter(
            (models.BloodRequest.requested_by == current_user.id) | 
            (models.BloodRequest.urgency_level == "Emergency")
        ).all()
        return [enrich_request_with_matches(db, request_obj) for request_obj in results]

    results = db.query(models.BloodRequest).order_by(models.BloodRequest.created_at.desc()).all()
    return [enrich_request_with_matches(db, request_obj) for request_obj in results]

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
    return enrich_request_with_matches(db, db_request)

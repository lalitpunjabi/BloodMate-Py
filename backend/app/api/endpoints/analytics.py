from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api import deps
from app.api.endpoints.inventory import sync_expired_units
from app.core.blood_compatibility import get_compatible_donor_groups
from app.db import models

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    sync_expired_units(db)

    # Total donors
    donor_count = db.query(models.DonorProfile).count()
    recipient_count = db.query(models.RecipientProfile).count()
    
    # Blood Inventory Grouped by Blood Type
    inventory_stats = db.query(
        models.BloodUnit.blood_group, 
        func.count(models.BloodUnit.id)
    ).filter(models.BloodUnit.status == "Available").group_by(models.BloodUnit.blood_group).all()
    
    inventory_data = [{"blood_group": stat[0], "count": stat[1]} for stat in inventory_stats]
    
    # Request counts
    pending_requests = db.query(models.BloodRequest).filter(
        models.BloodRequest.status == models.RequestStatusEnum.pending
    ).count()
    emergency_requests = db.query(models.BloodRequest).filter(
        models.BloodRequest.status == models.RequestStatusEnum.pending,
        models.BloodRequest.urgency_level == "Emergency",
    ).count()

    # Gamification Top Users (Leaderboard)
    leaderboard = db.query(models.User.full_name, models.User.points).order_by(
        models.User.points.desc()
    ).limit(5).all()
    leaderboard_data = [{"name": user[0], "points": user[1]} for user in leaderboard]

    expiring_before = datetime.utcnow() + timedelta(days=7)
    expiring_units = db.query(models.BloodUnit).filter(
        models.BloodUnit.status == "Available",
        models.BloodUnit.expiry_date <= expiring_before,
    ).order_by(models.BloodUnit.expiry_date.asc()).all()

    inventory_map = {item["blood_group"]: item["count"] for item in inventory_data}
    standard_groups = [group.value for group in models.BloodGroupEnum]
    critical_groups = [
        {"blood_group": group, "available_units": inventory_map.get(group, 0)}
        for group in standard_groups
        if inventory_map.get(group, 0) < 10
    ]

    now = datetime.utcnow()
    start_of_window = now - timedelta(days=6)
    request_rows = db.query(
        func.date(models.BloodRequest.created_at),
        func.count(models.BloodRequest.id),
    ).filter(models.BloodRequest.created_at >= start_of_window).group_by(
        func.date(models.BloodRequest.created_at)
    ).all()
    donation_rows = db.query(
        func.date(models.BloodUnit.collection_date),
        func.count(models.BloodUnit.id),
    ).filter(models.BloodUnit.collection_date >= start_of_window).group_by(
        func.date(models.BloodUnit.collection_date)
    ).all()

    request_map = defaultdict(int, {str(day): count for day, count in request_rows})
    donation_map = defaultdict(int, {str(day): count for day, count in donation_rows})
    weekly_activity = []
    for day_offset in range(7):
        day = (start_of_window + timedelta(days=day_offset)).date()
        day_key = str(day)
        weekly_activity.append(
            {
                "label": day.strftime("%a"),
                "requests": request_map[day_key],
                "donations": donation_map[day_key],
            }
        )

    pending_request_rows = db.query(models.BloodRequest).filter(
        models.BloodRequest.status == models.RequestStatusEnum.pending
    ).order_by(models.BloodRequest.created_at.desc()).limit(5).all()
    request_matches = []
    for request_obj in pending_request_rows:
        compatible_groups = get_compatible_donor_groups(request_obj.blood_group)
        compatible_available_units = db.query(models.BloodUnit).filter(
            models.BloodUnit.status == "Available",
            models.BloodUnit.blood_group.in_(compatible_groups),
        ).count()
        request_matches.append(
            {
                "id": request_obj.id,
                "patient_name": request_obj.patient_name,
                "blood_group": request_obj.blood_group,
                "urgency_level": request_obj.urgency_level,
                "units_required": request_obj.units_required,
                "compatible_available_units": compatible_available_units,
                "compatible_blood_groups": compatible_groups,
            }
        )
    
    return {
        "donor_count": donor_count,
        "recipient_count": recipient_count,
        "pending_requests": pending_requests,
        "emergency_requests": emergency_requests,
        "inventory_data": inventory_data,
        "leaderboard": leaderboard_data,
        "expiring_units_count": len(expiring_units),
        "expiring_soon": [
            {
                "id": unit.id,
                "blood_group": unit.blood_group,
                "expiry_date": unit.expiry_date,
            }
            for unit in expiring_units[:5]
        ],
        "critical_groups": critical_groups,
        "weekly_activity": weekly_activity,
        "request_matches": request_matches,
    }

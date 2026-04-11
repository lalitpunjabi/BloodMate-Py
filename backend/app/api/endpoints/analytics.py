from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api import deps
from app.db import models

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    # Total donors
    donor_count = db.query(models.DonorProfile).count()
    
    # Blood Inventory Grouped by Blood Type
    inventory_stats = db.query(
        models.BloodUnit.blood_group, 
        func.count(models.BloodUnit.id)
    ).filter(models.BloodUnit.status == "Available").group_by(models.BloodUnit.blood_group).all()
    
    inventory_data = [{"blood_group": stat[0], "count": stat[1]} for stat in inventory_stats]
    
    # Recent Requests
    pending_requests = db.query(models.BloodRequest).filter(
        models.BloodRequest.status == models.RequestStatusEnum.pending
    ).count()
    
    # Gamification Top Users (Leaderboard)
    leaderboard = db.query(models.User.full_name, models.User.points).order_by(
        models.User.points.desc()
    ).limit(5).all()
    leaderboard_data = [{"name": user[0], "points": user[1]} for user in leaderboard]
    
    return {
        "donor_count": donor_count,
        "pending_requests": pending_requests,
        "inventory_data": inventory_data,
        "leaderboard": leaderboard_data
    }

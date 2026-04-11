from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.core.config import settings
from app.db import models
from app.schemas import schemas

router = APIRouter()

@router.post("/signup", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(deps.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Strictly enforce that new signups are regular users unless authenticated otherwise
    # But since this is a public endpoint, force role down to user
    hashed_password = security.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        role=models.RoleEnum.user,
        full_name=user.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    # Generic fail so we do not expose if an email explicitly exists but password was wrong
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")
        
    if user.role != models.RoleEnum.user:
         raise HTTPException(status_code=403, detail="Invalid login portal. Admins must use the admin portal.")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.email, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/admin-login", response_model=schemas.Token)
def admin_login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")
        
    if user.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Access denied. Admin privileges required.")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.email, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.get("/me", response_model=schemas.UserWithProfile)
def read_users_me(current_user: models.User = Depends(deps.get_current_active_user)):
    return current_user

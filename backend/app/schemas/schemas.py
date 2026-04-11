from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.db.models import RoleEnum, BloodGroupEnum, RequestStatusEnum

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: RoleEnum = RoleEnum.user

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    points: int
    streak: int
    created_at: datetime

    class Config:
        from_attributes = True

# Donor Profile Schemas
class DonorProfileBase(BaseModel):
    blood_group: BloodGroupEnum
    phone: Optional[str] = None
    address: Optional[str] = None

class DonorProfileCreate(DonorProfileBase):
    pass

class DonorProfileResponse(DonorProfileBase):
    id: int
    user_id: int
    last_donation_date: Optional[datetime]
    eligibility_status: bool

    class Config:
        from_attributes = True

# Combined User+Donor Response
class UserWithProfile(UserResponse):
    donor_profile: Optional[DonorProfileResponse] = None

# Blood Unit (Inventory) Schemas
class BloodUnitBase(BaseModel):
    blood_group: BloodGroupEnum
    collection_date: datetime
    expiry_date: datetime
    status: str = "Available"

class BloodUnitCreate(BloodUnitBase):
    donor_id: Optional[int] = None

class BloodUnitResponse(BloodUnitBase):
    id: int
    donor_id: Optional[int]

    class Config:
        from_attributes = True

# Blood Request Schemas
class BloodRequestBase(BaseModel):
    patient_name: str
    blood_group: BloodGroupEnum
    units_required: int = Field(gt=0)
    hospital: str
    urgency_level: str = "Normal"

class BloodRequestCreate(BloodRequestBase):
    pass

class BloodRequestResponse(BloodRequestBase):
    id: int
    status: RequestStatusEnum
    requested_by: int
    created_at: datetime

    class Config:
        from_attributes = True

# Campaign
class CampaignBase(BaseModel):
    name: str
    date: datetime
    location: str
    organizer: str

class CampaignCreate(CampaignBase):
    pass

class CampaignResponse(CampaignBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

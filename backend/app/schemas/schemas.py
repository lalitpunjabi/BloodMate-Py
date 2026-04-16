from pydantic import BaseModel, EmailStr, Field
from typing import Optional
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


class UserSummary(BaseModel):
    id: int
    email: EmailStr
    full_name: str

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
    user: Optional[UserSummary] = None

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
    recipient_profile_id: Optional[int] = None

class BloodRequestResponse(BloodRequestBase):
    id: int
    status: RequestStatusEnum
    requested_by: int
    created_at: datetime
    compatible_available_units: Optional[int] = None
    compatible_blood_groups: list[BloodGroupEnum] = []

    class Config:
        from_attributes = True


class RecipientProfileBase(BaseModel):
    full_name: str
    blood_group: BloodGroupEnum
    hospital: str
    phone: Optional[str] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None


class RecipientProfileCreate(RecipientProfileBase):
    pass


class RecipientProfileResponse(RecipientProfileBase):
    id: int
    created_by: int
    created_at: datetime
    created_by_user: Optional[UserSummary] = None

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

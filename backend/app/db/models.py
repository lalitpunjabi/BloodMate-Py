from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from app.db.database import Base

class RoleEnum(str, enum.Enum):
    admin = "admin"
    user = "user"

class BloodGroupEnum(str, enum.Enum):
    A_POS = "A+"
    A_NEG = "A-"
    B_POS = "B+"
    B_NEG = "B-"
    AB_POS = "AB+"
    AB_NEG = "AB-"
    O_POS = "O+"
    O_NEG = "O-"

class RequestStatusEnum(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    fulfilled = "fulfilled"
    cancelled = "cancelled"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SQLEnum(RoleEnum), default=RoleEnum.user)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    points = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    donor_profile = relationship("DonorProfile", back_populates="user", uselist=False)
    blood_requests = relationship("BloodRequest", back_populates="requested_by_user")

class DonorProfile(Base):
    __tablename__ = "donor_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    blood_group = Column(SQLEnum(BloodGroupEnum), nullable=False)
    phone = Column(String(50))
    address = Column(String(255))
    last_donation_date = Column(DateTime, nullable=True)
    eligibility_status = Column(Boolean, default=True)
    
    user = relationship("User", back_populates="donor_profile")
    donations = relationship("BloodUnit", back_populates="donor")

class BloodUnit(Base):
    __tablename__ = "blood_units"
    
    id = Column(Integer, primary_key=True, index=True)
    blood_group = Column(SQLEnum(BloodGroupEnum), index=True, nullable=False)
    donor_id = Column(Integer, ForeignKey("donor_profiles.id"), nullable=True)
    collection_date = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(DateTime, nullable=False)
    status = Column(String(50), default="Available") # Available, Reserved, Used, Expired
    
    donor = relationship("DonorProfile", back_populates="donations")

class BloodRequest(Base):
    __tablename__ = "blood_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String(255), nullable=False)
    blood_group = Column(SQLEnum(BloodGroupEnum), nullable=False)
    units_required = Column(Integer, nullable=False)
    hospital = Column(String(255), nullable=False)
    urgency_level = Column(String(50), default="Normal") # Normal, Emergency
    status = Column(SQLEnum(RequestStatusEnum), default=RequestStatusEnum.pending)
    requested_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    requested_by_user = relationship("User", back_populates="blood_requests")

class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    date = Column(DateTime, nullable=False)
    location = Column(String(255), nullable=False)
    organizer = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

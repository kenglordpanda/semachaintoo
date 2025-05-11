from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from .base import TimestampModel

class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(alias="full_name", description="User's full name")

class UserCreate(UserBase):
    password: str
    organization_name: str  # Changed from Optional[str] to required str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase, TimestampModel):
    id: int
    is_superuser: bool
    organization_id: int  # Changed from Optional[int] to required int

    class Config:
        from_attributes = True
        populate_by_name = True  # Allow values to be populated by field name and alias

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str
from pydantic import BaseModel
from typing import Optional, List
from .base import TimestampModel
from .user import User

class OrganizationBase(BaseModel):
    name: str
    description: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationUpdate(OrganizationBase):
    pass

class OrganizationInDBBase(OrganizationBase, TimestampModel):
    id: int

    class Config:
        from_attributes = True

class Organization(OrganizationInDBBase):
    users: List[User] = []

class OrganizationInDB(OrganizationInDBBase):
    pass 
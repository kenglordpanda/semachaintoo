from sqlalchemy.orm import Session
from app.models.user import User
from app.models.organization import Organization
from app.schemas.user import UserCreate
from app.core.security import get_password_hash
from fastapi import HTTPException

def get_user(db: Session, user_id: int):
    """Get a user by ID"""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user_in: UserCreate):
    """
    Create a new user with a required organization
    """
    # Validate that organization name is provided
    if not user_in.organization_name:
        raise HTTPException(
            status_code=400,
            detail="Organization name is required"
        )
    
    # Create organization
    organization = Organization(name=user_in.organization_name)
    db.add(organization)
    db.flush()  # Flush to get the organization ID
    
    # Create user with organization ID
    db_user = User(
        email=user_in.email,
        name=user_in.name,
        hashed_password=get_password_hash(user_in.password),
        organization_id=organization.id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.user import UserCreate, User
from app.services import user_service

router = APIRouter()

@router.post("/register", response_model=User)
def register_user(
    user_in: UserCreate,
    db: Session = Depends(deps.get_db)
):
    """
    Register a new user.
    """
    user = user_service.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists."
        )
    user = user_service.create_user(db, user_in)
    return user 
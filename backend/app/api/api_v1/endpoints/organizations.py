from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.organization import Organization
from app.models.user import User
from app.schemas.organization import Organization as OrganizationSchema
from app.schemas.organization import OrganizationCreate, OrganizationUpdate

router = APIRouter()

@router.get("/", response_model=List[OrganizationSchema])
def read_organizations(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve organizations.
    """
    organizations = db.query(Organization).offset(skip).limit(limit).all()
    return organizations

@router.post("/", response_model=OrganizationSchema)
def create_organization(
    *,
    db: Session = Depends(deps.get_db),
    organization_in: OrganizationCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new organization.
    """
    organization = Organization(**organization_in.dict())
    db.add(organization)
    db.commit()
    db.refresh(organization)
    return organization

@router.put("/{organization_id}", response_model=OrganizationSchema)
def update_organization(
    *,
    db: Session = Depends(deps.get_db),
    organization_id: int,
    organization_in: OrganizationUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update organization.
    """
    organization = db.query(Organization).filter(Organization.id == organization_id).first()
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    for field, value in organization_in.dict(exclude_unset=True).items():
        setattr(organization, field, value)
    db.add(organization)
    db.commit()
    db.refresh(organization)
    return organization

@router.get("/{organization_id}", response_model=OrganizationSchema)
def read_organization(
    *,
    db: Session = Depends(deps.get_db),
    organization_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get organization by ID.
    """
    organization = db.query(Organization).filter(Organization.id == organization_id).first()
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    return organization 
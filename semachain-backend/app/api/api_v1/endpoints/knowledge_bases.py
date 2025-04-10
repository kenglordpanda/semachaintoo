from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.knowledge_base import KnowledgeBase
from app.models.user import User
from app.schemas.knowledge_base import KnowledgeBase as KnowledgeBaseSchema
from app.schemas.knowledge_base import KnowledgeBaseCreate, KnowledgeBaseUpdate

router = APIRouter()

@router.get("/", response_model=List[KnowledgeBaseSchema])
def read_knowledge_bases(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve knowledge bases.
    """
    knowledge_bases = db.query(KnowledgeBase).offset(skip).limit(limit).all()
    return knowledge_bases

@router.post("/", response_model=KnowledgeBaseSchema)
def create_knowledge_base(
    *,
    db: Session = Depends(deps.get_db),
    knowledge_base_in: KnowledgeBaseCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new knowledge base.
    """
    knowledge_base = KnowledgeBase(
        **knowledge_base_in.dict(),
        owner_id=current_user.id,
        organization_id=current_user.organization_id,
    )
    db.add(knowledge_base)
    db.commit()
    db.refresh(knowledge_base)
    return knowledge_base

@router.put("/{knowledge_base_id}", response_model=KnowledgeBaseSchema)
def update_knowledge_base(
    *,
    db: Session = Depends(deps.get_db),
    knowledge_base_id: int,
    knowledge_base_in: KnowledgeBaseUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update knowledge base.
    """
    knowledge_base = db.query(KnowledgeBase).filter(KnowledgeBase.id == knowledge_base_id).first()
    if not knowledge_base:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    if knowledge_base.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    for field, value in knowledge_base_in.dict(exclude_unset=True).items():
        setattr(knowledge_base, field, value)
    db.add(knowledge_base)
    db.commit()
    db.refresh(knowledge_base)
    return knowledge_base

@router.get("/{knowledge_base_id}", response_model=KnowledgeBaseSchema)
def read_knowledge_base(
    *,
    db: Session = Depends(deps.get_db),
    knowledge_base_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get knowledge base by ID.
    """
    knowledge_base = db.query(KnowledgeBase).filter(KnowledgeBase.id == knowledge_base_id).first()
    if not knowledge_base:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    return knowledge_base 
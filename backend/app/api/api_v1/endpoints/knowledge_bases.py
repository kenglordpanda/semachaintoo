from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.knowledge_base import KnowledgeBase
from app.models.user import User
from app.schemas.knowledge_base import KnowledgeBase as KnowledgeBaseSchema
from app.schemas.knowledge_base import KnowledgeBaseCreate, KnowledgeBaseUpdate
from app.schemas.document import DocumentResponse
from app.services.document_service import DocumentService

router = APIRouter()
document_service = DocumentService()

# Helper function to convert document IDs to strings for proper serialization
def prepare_document_for_response(doc):
    # Ensure document has all required fields
    if not hasattr(doc, 'id') or not hasattr(doc, 'user_id'):
        return doc
    
    # Convert ID properties to strings
    doc.id = str(doc.id) if doc.id is not None else None
    doc.user_id = str(doc.user_id) if doc.user_id is not None else None
    
    # Ensure tags is a list
    if not hasattr(doc, 'tags') or doc.tags is None:
        doc.tags = []
        
    return doc

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
    
    # Ensure each document has tags as a list for each knowledge base
    # and convert IDs to strings
    for kb in knowledge_bases:
        for i, doc in enumerate(kb.documents):
            kb.documents[i] = prepare_document_for_response(doc)
                
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
    
    # Convert document IDs to strings for proper serialization
    for i, doc in enumerate(knowledge_base.documents):
        knowledge_base.documents[i] = prepare_document_for_response(doc)
            
    return knowledge_base

@router.get("/{knowledge_base_id}/documents", response_model=List[DocumentResponse])
def get_knowledge_base_documents(
    *,
    db: Session = Depends(deps.get_db),
    knowledge_base_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all documents belonging to a specific knowledge base.
    """
    knowledge_base = db.query(KnowledgeBase).filter(KnowledgeBase.id == knowledge_base_id).first()
    if not knowledge_base:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    
    documents = document_service.get_documents_by_knowledge_base(db, knowledge_base_id)
    
    # Convert document IDs to strings
    for i, doc in enumerate(documents):
        documents[i] = prepare_document_for_response(doc)
            
    return documents
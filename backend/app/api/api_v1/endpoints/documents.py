from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.document import Document, Tag, DocumentTag
from app.models.user import User
from app.schemas.document import Document as DocumentSchema
from app.schemas.document import DocumentCreate, DocumentUpdate

router = APIRouter()

@router.get("/", response_model=List[DocumentSchema])
def read_documents(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve documents.
    """
    documents = db.query(Document).offset(skip).limit(limit).all()
    return documents

@router.post("/", response_model=DocumentSchema)
def create_document(
    *,
    db: Session = Depends(deps.get_db),
    document_in: DocumentCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new document.
    """
    document = Document(**document_in.dict(exclude={"tags"}))
    db.add(document)
    db.commit()
    db.refresh(document)

    # Handle tags
    if document_in.tags:
        for tag_name in document_in.tags:
            tag = db.query(Tag).filter(Tag.name == tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.add(tag)
                db.commit()
                db.refresh(tag)
            document_tag = DocumentTag(document_id=document.id, tag_id=tag.id)
            db.add(document_tag)
        db.commit()
        db.refresh(document)

    return document

@router.put("/{document_id}", response_model=DocumentSchema)
def update_document(
    *,
    db: Session = Depends(deps.get_db),
    document_id: int,
    document_in: DocumentUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update document.
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Update document fields
    for field, value in document_in.dict(exclude={"tags"}, exclude_unset=True).items():
        setattr(document, field, value)
    
    # Handle tags
    if document_in.tags is not None:
        # Remove existing tags
        db.query(DocumentTag).filter(DocumentTag.document_id == document.id).delete()
        
        # Add new tags
        for tag_name in document_in.tags:
            tag = db.query(Tag).filter(Tag.name == tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.add(tag)
                db.commit()
                db.refresh(tag)
            document_tag = DocumentTag(document_id=document.id, tag_id=tag.id)
            db.add(document_tag)
    
    db.add(document)
    db.commit()
    db.refresh(document)
    return document

@router.get("/{document_id}", response_model=DocumentSchema)
def read_document(
    *,
    db: Session = Depends(deps.get_db),
    document_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get document by ID.
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document 
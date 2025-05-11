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
    # Create the base document, storing tags directly in the JSON column
    document_data = document_in.dict()
    
    # Validate that tags are provided and not empty
    tags = document_data.get("tags")
    if not tags:
        raise HTTPException(
            status_code=400,
            detail="At least one tag is required for the document"
        )
    
    # Create document instance with all fields including the tags JSON column
    document = Document(
        title=document_data["title"],
        content=document_data["content"],
        knowledge_base_id=document_data.get("knowledge_base_id"),
        user_id=current_user.id,
        tags=tags  # Store tags directly in the JSON column
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)

    # Create Tag entities for advanced tag features
    for tag_name in tags:
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
    update_data = document_in.dict(exclude_unset=True)
    
    # Handle tags specially
    if "tags" in update_data:
        # Validate that tags are provided and not empty
        tags = update_data.get("tags")
        if not tags:
            raise HTTPException(
                status_code=400,
                detail="At least one tag is required for the document"
            )
        
        # Update the JSON column directly
        document.tags = tags
        
        # Update Tag entities
        # Remove existing tag relations
        db.query(DocumentTag).filter(DocumentTag.document_id == document.id).delete()
        
        # Add new tag relations
        for tag_name in tags:
            tag = db.query(Tag).filter(Tag.name == tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.add(tag)
                db.commit()
                db.refresh(tag)
            document_tag = DocumentTag(document_id=document.id, tag_id=tag.id)
            db.add(document_tag)
        
        # Remove tags from update data as we've handled it separately
        del update_data["tags"]
    
    # Update other fields
    for field, value in update_data.items():
        setattr(document, field, value)
    
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
    
    # Ensure tags is always a list
    if document.tags is None:
        document.tags = []
        
    return document
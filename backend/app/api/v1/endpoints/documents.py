from fastapi import APIRouter, HTTPException, Depends, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel # Ensure BaseModel is imported
from app.services.document_service import DocumentService
from app.services.scoring_service import ScoringService
from app.services.simple_similarity_service import simple_similarity_service
from app.api import deps
from app.models.user import User
from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse as DocumentSchemaResponse, Document as DocumentSchema

router = APIRouter()
document_service = DocumentService()
scoring_service = ScoringService()

class SearchResponse(BaseModel):
    document_id: int
    content: str
    distance: float
    scores: Optional[Dict[str, float]] = None

# Add a new Pydantic model for the similar documents request
class SimilarDocumentsRequest(BaseModel):
    content: str
    n_results: int = 5

@router.post("/{document_id}/similar", response_model=List[Dict[str, Any]])
async def find_similar_documents(
    document_id: str,
    n_results: int = 5,
    db: Session = Depends(deps.get_db),
    current_user: Dict = Depends(deps.get_current_user)
):
    """Find similar documents based on content."""
    try:
        document = simple_similarity_service.get_document(db, int(document_id))
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        similar_docs = simple_similarity_service.find_similar_documents(
            db=db,
            content=document['content'],
            top_k=n_results
        )
        return similar_docs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{doc1_id}/similarity/{doc2_id}", response_model=float)
async def get_document_similarity(
    doc1_id: str,
    doc2_id: str,
    db: Session = Depends(deps.get_db),
    current_user: Dict = Depends(deps.get_current_user)
):
    """Get similarity score between two documents."""
    try:
        similarity = simple_similarity_service.get_document_similarity_score(
            db=db,
            doc1_id=int(doc1_id),
            doc2_id=int(doc2_id)
        )
        return similarity
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=DocumentSchemaResponse)
async def create_document_endpoint(
    document_in: DocumentCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Create a new document, associate with knowledge base, and store its vector embedding."""
    try:
        created_document = document_service.create_document(
            db=db,
            title=document_in.title,
            content=document_in.content,
            user_id=current_user.id,
            knowledge_base_id=document_in.knowledge_base_id,
            tags=document_in.tags if hasattr(document_in, 'tags') else []
        )
        return created_document
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred while creating the document.")

@router.put("/{document_id}", response_model=DocumentSchemaResponse)
async def update_document_endpoint(
    document_id: int,
    document_in: DocumentUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Update a document and recalculate its scores."""
    try:
        updated_document = document_service.update_document(
            db=db,
            document_id=document_id,
            content=document_in.content,
            title=document_in.title if document_in.title is not None else None,
            knowledge_base_id=document_in.knowledge_base_id if document_in.knowledge_base_id is not None else None,
            tags=document_in.tags if hasattr(document_in, 'tags') and document_in.tags is not None else None
        )
        if not updated_document:
            raise HTTPException(status_code=404, detail="Document not found or update failed")
        return updated_document
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred while updating the document.")

@router.delete("/{document_id}")
async def delete_document(document_id: int, db: Session = Depends(deps.get_db)):
    """Delete a document"""
    try:
        # With no vector DB, we can rely on standard database operations
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        
        db.delete(doc)
        db.commit()
        return {"message": "Document deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/similar", response_model=List[Dict[str, Any]])
async def find_similar_documents_by_content(
    request: SimilarDocumentsRequest,
    db: Session = Depends(deps.get_db),
    current_user: Dict = Depends(deps.get_current_user)
):
    """Find similar documents based on content."""
    try:
        similar_docs = simple_similarity_service.find_similar_documents(
            db=db,
            content=request.content,
            top_k=request.n_results
        )
        return similar_docs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search", response_model=List[DocumentSchemaResponse])
async def search_documents_endpoint(
    query: str,
    top_k: int = 5,
    db: Session = Depends(deps.get_db)
):
    """Search for similar documents with scoring."""
    try:
        # Use find_similar_documents instead of the non-existent search_similar method
        results = simple_similarity_service.find_similar_documents(db, query, top_k)
        response_results = []
        for res_data in results:
            doc_id = res_data.get('document_id')
            if not doc_id: continue
            
            # The scores are already included in the results
            response_results.append(DocumentSchemaResponse(
                id=str(doc_id),
                title=res_data.get('title', 'N/A'),
                content=res_data['content'],
                knowledge_base_id=res_data.get('knowledge_base_id', None),
                created_at=datetime.now(),
                updated_at=datetime.now(),
                tags=[],
                user_id=str(res_data.get('user_id', 'N/A'))
            ))
        return response_results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during search: {str(e)}")

@router.get("/{document_id}", response_model=DocumentSchemaResponse)
async def get_document_endpoint(
    document_id: int,
    db: Session = Depends(deps.get_db)
):
    """Get a document by ID with its scores."""
    try:
        doc_data = simple_similarity_service.get_document(db, document_id)
        if not doc_data:
            raise HTTPException(status_code=404, detail="Document not found")
        response = DocumentSchemaResponse(
            id=str(doc_data.get('id', doc_data.get('document_id'))),
            title=doc_data.get('title', "Title not found"),
            content=doc_data['content'],
            knowledge_base_id=doc_data.get('knowledge_base_id'),
            created_at=doc_data.get('created_at', datetime.utcnow()),
            updated_at=doc_data.get('updated_at', datetime.utcnow()),
            tags=doc_data.get('tags', []),
            user_id=str(doc_data.get('user_id', 'N/A'))
        )
        return response
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred while fetching the document.")

@router.get("/", response_model=List[DocumentSchemaResponse])
async def list_documents(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
):
    """Retrieve all documents."""
    from app.models.document import Document as DocumentModel
    documents = db.query(DocumentModel).filter(DocumentModel.user_id == current_user.id).offset(skip).limit(limit).all()
    return documents
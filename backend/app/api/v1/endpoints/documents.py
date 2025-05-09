from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel
from app.services.vector_service import VectorService
from app.services.scoring_service import ScoringService

router = APIRouter()
vector_service = VectorService()
scoring_service = ScoringService()

class DocumentCreate(BaseModel):
    content: str

class DocumentUpdate(BaseModel):
    content: str

class DocumentResponse(BaseModel):
    document_id: int
    content: str
    scores: Optional[Dict[str, float]] = None
    views: int = 0
    likes: int = 0
    comments: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class SearchResponse(BaseModel):
    document_id: int
    content: str
    distance: float
    scores: Optional[Dict[str, float]] = None

@router.post("/{document_id}/similar", response_model=List[Dict[str, Any]])
async def find_similar_documents(
    document_id: str,
    n_results: int = 5,
    current_user: Dict = Depends(get_current_user)
):
    """Find similar documents based on content."""
    try:
        # Get the document content from your database
        # This is a placeholder - you'll need to implement the actual document retrieval
        document = await get_document_from_db(document_id)
        
        similar_docs = vector_db.find_similar_documents(
            content=document.content,
            n_results=n_results
        )
        return similar_docs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{doc1_id}/similarity/{doc2_id}", response_model=float)
async def get_document_similarity(
    doc1_id: str,
    doc2_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get similarity score between two documents."""
    try:
        similarity = vector_db.get_document_similarity_score(doc1_id, doc2_id)
        return similarity
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=DocumentResponse)
async def create_document(document: DocumentCreate):
    """Create a new document and store its vector embedding"""
    try:
        document_id = vector_service.add_document(1, document.content)
        scores = scoring_service.calculate_overall_score(
            content=document.content,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        return DocumentResponse(
            document_id=document_id,
            content=document.content,
            scores=scores,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(document_id: int, document: DocumentUpdate):
    """Update a document and recalculate its scores"""
    try:
        # Get existing document
        existing_doc = vector_service.get_document(document_id)
        if not existing_doc:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Update document in vector store
        vector_service.delete_document(document_id)
        new_document_id = vector_service.add_document(document_id, document.content)
        
        # Calculate new scores
        scores = scoring_service.calculate_overall_score(
            content=document.content,
            created_at=existing_doc.get('created_at', datetime.utcnow()),
            updated_at=datetime.utcnow()
        )
        
        return DocumentResponse(
            document_id=new_document_id,
            content=document.content,
            scores=scores,
            views=existing_doc.get('views', 0),
            likes=existing_doc.get('likes', 0),
            comments=existing_doc.get('comments', 0),
            created_at=existing_doc.get('created_at'),
            updated_at=datetime.utcnow()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{document_id}")
async def delete_document(document_id: int):
    """Delete a document"""
    try:
        success = vector_service.delete_document(document_id)
        if not success:
            raise HTTPException(status_code=404, detail="Document not found")
        return {"message": "Document deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/similar", response_model=List[Dict[str, Any]])
async def find_similar_documents_by_content(
    content: str,
    n_results: int = 5,
    current_user: Dict = Depends(get_current_user)
):
    """Find similar documents based on content."""
    try:
        similar_docs = vector_db.find_similar_documents(
            content=content,
            n_results=n_results
        )
        return similar_docs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search", response_model=List[SearchResponse])
async def search_documents(query: str, top_k: int = 5):
    """Search for similar documents with scoring"""
    try:
        # Get similar documents from vector store
        results = vector_service.search_similar(query, top_k)
        
        # Add scores to each document
        scored_results = []
        for doc in results:
            scores = scoring_service.calculate_overall_score(
                content=doc['content'],
                query=query
            )
            scored_results.append({
                **doc,
                'scores': scores
            })
        
        # Rank documents by overall score
        ranked_results = scoring_service.rank_documents(scored_results, query)
        
        return ranked_results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: int):
    """Get a document by ID with its scores"""
    try:
        document = vector_service.get_document(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Calculate scores
        scores = scoring_service.calculate_overall_score(
            content=document['content'],
            created_at=document.get('created_at'),
            updated_at=document.get('updated_at')
        )
        
        return DocumentResponse(
            **document,
            scores=scores
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
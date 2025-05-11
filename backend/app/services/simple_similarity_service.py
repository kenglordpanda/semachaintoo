from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.document import Document
from app.services.scoring_service import ScoringService

class SimpleSimilarityService:
    """A simplified document similarity service that uses the scoring service instead of a vector database."""
    
    def __init__(self):
        self.scoring_service = ScoringService()
    
    def find_similar_documents(self, db: Session, content: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Find similar documents based on content using the scoring service."""
        # Fetch all documents from the database
        documents = db.query(Document).all()
        
        # Convert documents to dictionary format
        document_dicts = []
        for doc in documents:
            document_dicts.append({
                'document_id': doc.id,
                'title': doc.title,
                'content': doc.content,
                'created_at': doc.created_at,
                'updated_at': doc.updated_at,
                'views': doc.views or 0,
                'likes': doc.likes or 0,
                'comments': doc.comments or 0
            })
        
        # Use the scoring service to rank documents by relevance to the query content
        ranked_docs = self.scoring_service.rank_documents(document_dicts, content)
        
        # Transform the results to match the expected format
        result_docs = []
        for doc in ranked_docs[:top_k]:
            # Calculate a distance score (0-1, lower is better) from the relevance score
            relevance_score = doc['scores']['relevance_score']
            # Convert relevance (higher is better) to distance (lower is better)
            distance = 1.0 - relevance_score
            
            result_docs.append({
                'document_id': doc['document_id'],
                'title': doc['title'],
                'content': doc['content'],
                'distance': distance,
                'scores': doc['scores']
            })
        
        return result_docs
    
    def get_document(self, db: Session, document_id: int) -> Optional[Dict[str, Any]]:
        """Get a document by ID."""
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            return None
        
        return {
            'document_id': doc.id,
            'title': doc.title,
            'content': doc.content,
            'knowledge_base_id': doc.knowledge_base_id,
            'created_at': doc.created_at,
            'updated_at': doc.updated_at,
            'tags': doc.tags or []
        }
    
    def get_document_similarity_score(self, db: Session, doc1_id: int, doc2_id: int) -> float:
        """Calculate similarity score between two documents."""
        doc1 = self.get_document(db, doc1_id)
        doc2 = self.get_document(db, doc2_id)
        
        if not doc1 or not doc2:
            return 0.0
        
        # Use the scoring service's relevance score as a similarity measure
        similarity = self.scoring_service.calculate_relevance_score(doc1['content'], doc2['content'])
        return similarity

# Create singleton instance
simple_similarity_service = SimpleSimilarityService()
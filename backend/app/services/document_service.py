from typing import List, Dict, Any, Optional
from datetime import datetime
from app.services.vector_service import VectorService
from app.models.document import Document, DocumentAttachment
from sqlalchemy.orm import Session
from sqlalchemy import desc
import re
from slugify import slugify
from fastapi import HTTPException

class DocumentService:
    def __init__(self):
        self.vector_service = VectorService()

    def create_document(self, db: Session, content: str, user_id: int, title: str, knowledge_base_id: Optional[int] = None, tags: List[str] = None, **kwargs) -> Document:
        """Create a new document with enhanced organization features"""
        # Validate tags are provided and not empty
        if not tags:
            raise ValueError("At least one tag is required for the document")
            
        # Generate slug from title
        slug = slugify(title)
        base_slug = slug
        counter = 1
        
        # Ensure unique slug
        while db.query(Document).filter(Document.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        # Calculate document properties
        word_count = len(content.split())
        estimated_read_time = max(1, word_count // 200)  # Assuming 200 words per minute
        
        # Create document
        document = Document(
            content=content,
            user_id=user_id,
            title=title,
            slug=slug,
            word_count=word_count,
            estimated_read_time=estimated_read_time,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            knowledge_base_id=knowledge_base_id,  # Associate with knowledge base
            tags=tags,  # Store tags in the JSON column
            **kwargs
        )
        
        # First add to database to get document ID
        db.add(document)
        db.commit()
        db.refresh(document)
        
        # Now add to vector store with the actual document ID
        vector_id = self.vector_service.add_document(document.id, content)
        document.vector_id = vector_id
        
        # Update the document with the vector ID
        db.add(document)
        db.commit()
        db.refresh(document)
        
        return document

    def update_document(self, db: Session, document_id: int, content: str, tags: List[str] = None, **kwargs) -> Document:
        """Update a document with version control"""
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise ValueError("Document not found")
        
        # Update content and properties
        document.content = content
        document.word_count = len(content.split())
        document.estimated_read_time = max(1, document.word_count // 200)
        document.updated_at = datetime.utcnow()
        document.version += 1
        
        # Update tags if provided
        if tags is not None:
            # Validate tags are not empty
            if not tags:
                raise ValueError("At least one tag is required for the document")
            document.tags = tags
        
        # Update other properties if provided
        for key, value in kwargs.items():
            if hasattr(document, key):
                setattr(document, key, value)
        
        # Update vector store
        self.vector_service.update_document(document.vector_id, content)
        
        db.commit()
        db.refresh(document)
        
        return document

    def get_document_tree(self, db: Session, document_id: int) -> Dict[str, Any]:
        """Get document hierarchy"""
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise ValueError("Document not found")
            
        def build_tree(doc):
            return {
                'id': doc.id,
                'title': doc.title,
                'slug': doc.slug,
                'children': [build_tree(child) for child in doc.child_documents]
            }
            
        return build_tree(document)

    def get_document_versions(self, db: Session, document_id: int) -> List[Dict[str, Any]]:
        """Get document version history"""
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise ValueError("Document not found")
            
        # In a real implementation, you would store versions in a separate table
        # This is a simplified version
        return [{
            'version': document.version,
            'updated_at': document.updated_at,
            'updated_by': document.user_id
        }]

    def add_attachment(self, db: Session, document_id: int, filename: str, file_type: str, 
                      file_size: int, user_id: int) -> DocumentAttachment:
        """Add an attachment to a document"""
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise ValueError("Document not found")
            
        attachment = DocumentAttachment(
            document_id=document_id,
            filename=filename,
            file_type=file_type,
            file_size=file_size,
            uploaded_by=user_id
        )
        
        document.has_attachments = True
        
        db.add(attachment)
        db.commit()
        db.refresh(attachment)
        
        return attachment

    def get_recent_documents(self, db: Session, user_id: int, limit: int = 10) -> List[Document]:
        """Get recently viewed documents"""
        documents = db.query(Document)\
            .filter(Document.user_id == user_id)\
            .order_by(desc(Document.last_viewed_at))\
            .limit(limit)\
            .all()
            
        # Ensure all returned documents have tags as a list
        for doc in documents:
            if doc.tags is None:
                doc.tags = []
                
        return documents

    def get_documents_by_category(self, db: Session, category: str) -> List[Document]:
        """Get documents by category"""
        documents = db.query(Document)\
            .filter(Document.category == category)\
            .order_by(desc(Document.created_at))\
            .all()
            
        # Ensure all returned documents have tags as a list
        for doc in documents:
            if doc.tags is None:
                doc.tags = []
                
        return documents

    def get_document_templates(self, db: Session) -> List[Document]:
        """Get document templates"""
        documents = db.query(Document)\
            .filter(Document.is_template == True)\
            .order_by(Document.title)\
            .all()
            
        # Ensure all returned documents have tags as a list
        for doc in documents:
            if doc.tags is None:
                doc.tags = []
                
        return documents

    def search_documents(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Search documents using vector search"""
        return self.vector_service.search_similar(query, top_k)

    def update_document_status(self, db: Session, document_id: int, status: str) -> Document:
        """Update document status (draft, review, published, archived)"""
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise ValueError("Document not found")
            
        document.status = status
        if status == "published":
            document.published_at = datetime.utcnow()
            
        db.commit()
        db.refresh(document)
        
        return document

    def assign_to_knowledge_base(self, db: Session, document_id: int, knowledge_base_id: int) -> Document:
        """Assign a document to a knowledge base"""
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise ValueError("Document not found")
            
        document.knowledge_base_id = knowledge_base_id
        document.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(document)
        
        return document
        
    def get_documents_by_knowledge_base(self, db: Session, knowledge_base_id: int) -> List[Document]:
        """Get all documents belonging to a specific knowledge base"""
        documents = db.query(Document)\
            .filter(Document.knowledge_base_id == knowledge_base_id)\
            .order_by(desc(Document.created_at))\
            .all()
            
        # Ensure all returned documents have tags as a list
        for doc in documents:
            if doc.tags is None:
                doc.tags = []
                
        return documents
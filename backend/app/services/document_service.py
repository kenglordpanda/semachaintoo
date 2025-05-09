from typing import List, Dict, Any, Optional
from datetime import datetime
from app.services.vector_service import VectorService
from app.models.document import Document, DocumentAttachment
from sqlalchemy.orm import Session
from sqlalchemy import desc
import re
from slugify import slugify

class DocumentService:
    def __init__(self):
        self.vector_service = VectorService()

    def create_document(self, db: Session, content: str, user_id: int, title: str, **kwargs) -> Document:
        """Create a new document with enhanced organization features"""
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
            **kwargs
        )
        
        # Add to vector store for search
        vector_id = self.vector_service.add_document(document.id, content)
        document.vector_id = vector_id
        
        db.add(document)
        db.commit()
        db.refresh(document)
        
        return document

    def update_document(self, db: Session, document_id: int, content: str, **kwargs) -> Document:
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
        return db.query(Document)\
            .filter(Document.user_id == user_id)\
            .order_by(desc(Document.last_viewed_at))\
            .limit(limit)\
            .all()

    def get_documents_by_category(self, db: Session, category: str) -> List[Document]:
        """Get documents by category"""
        return db.query(Document)\
            .filter(Document.category == category)\
            .order_by(desc(Document.created_at))\
            .all()

    def get_document_templates(self, db: Session) -> List[Document]:
        """Get document templates"""
        return db.query(Document)\
            .filter(Document.is_template == True)\
            .order_by(Document.title)\
            .all()

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
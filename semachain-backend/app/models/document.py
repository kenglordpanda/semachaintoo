from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    knowledge_base_id = Column(Integer, ForeignKey("knowledge_bases.id"))
    
    # Relationships
    knowledge_base = relationship("KnowledgeBase", back_populates="documents")
    tags = relationship("Tag", secondary="document_tags", back_populates="documents")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    documents = relationship("Document", secondary="document_tags", back_populates="tags")

class DocumentTag(Base):
    __tablename__ = "document_tags"

    document_id = Column(Integer, ForeignKey("documents.id"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), primary_key=True) 
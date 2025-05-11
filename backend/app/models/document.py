from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, JSON, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    vector_id = Column(String(255), unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Document Organization
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True)  # URL-friendly version of title
    version = Column(Integer, default=1)  # For version control
    parent_id = Column(Integer, ForeignKey("documents.id"), nullable=True)  # For hierarchical documents
    is_template = Column(Boolean, default=False)  # For document templates
    status = Column(String(50), default="draft")  # draft, review, published, archived
    
    # Metadata
    tags = Column(JSON, default=list)  # List of tag strings - for simple string tag storage
    category = Column(String(100))  # Document category
    priority = Column(Integer, default=0)  # For sorting/importance
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime, nullable=True)
    
    # Access Control
    is_private = Column(Boolean, default=False)
    allowed_users = Column(JSON)  # List of user IDs with access
    allowed_roles = Column(JSON)  # List of roles with access
    
    # Engagement metrics
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    last_viewed_at = Column(DateTime, nullable=True)
    
    # Document Properties
    estimated_read_time = Column(Integer)  # in minutes
    word_count = Column(Integer, default=0)
    has_attachments = Column(Boolean, default=False)
    has_comments = Column(Boolean, default=False)
    
    # Foreign Keys
    knowledge_base_id = Column(Integer, ForeignKey("knowledge_bases.id"))
    
    # Relationships
    user = relationship("User", back_populates="documents")
    comments_list = relationship("Comment", back_populates="document", cascade="all, delete-orphan")
    # Note: We're keeping the tags_list relationship for future advanced tag features
    # but the primary tag storage will be the JSON tags column
    tags_list = relationship("Tag", secondary="document_tags", back_populates="documents")
    knowledge_base = relationship("KnowledgeBase", back_populates="documents")
    parent = relationship("Document", remote_side=[id], backref="child_documents")
    attachments = relationship("DocumentAttachment", back_populates="document", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Document {self.id}: {self.title}>"

class DocumentAttachment(Base):
    __tablename__ = "document_attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50))
    file_size = Column(Integer)  # in bytes
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    document = relationship("Document", back_populates="attachments")
    user = relationship("User")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String(255))
    color = Column(String(7))  # Hex color code
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    documents = relationship("Document", secondary="document_tags", back_populates="tags_list")

class DocumentTag(Base):
    __tablename__ = "document_tags"

    document_id = Column(Integer, ForeignKey("documents.id"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), primary_key=True)

# Add Comment model
class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    document = relationship("Document", back_populates="comments_list")
    user = relationship("User")
    # Self-referential relationship for nested comments
    parent = relationship("Comment", remote_side=[id], backref="replies")
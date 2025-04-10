from pydantic import BaseModel
from typing import Optional, List
from .base import TimestampModel
from .user import User
from .organization import Organization
from .document import Document

class KnowledgeBaseBase(BaseModel):
    title: str
    description: Optional[str] = None

class KnowledgeBaseCreate(KnowledgeBaseBase):
    pass

class KnowledgeBaseUpdate(KnowledgeBaseBase):
    pass

class KnowledgeBaseInDBBase(KnowledgeBaseBase, TimestampModel):
    id: int
    owner_id: int
    organization_id: int

    class Config:
        from_attributes = True

class KnowledgeBase(KnowledgeBaseInDBBase):
    owner: User
    organization: Organization
    documents: List[Document] = []

class KnowledgeBaseInDB(KnowledgeBaseInDBBase):
    pass 
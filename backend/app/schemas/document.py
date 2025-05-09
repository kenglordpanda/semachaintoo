from pydantic import BaseModel
from typing import Optional, List
from .base import TimestampModel
from .knowledge_base import KnowledgeBase
from datetime import datetime

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int
    created_at: str

    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    title: str
    content: str
    tags: Optional[List[str]] = []

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(DocumentBase):
    title: Optional[str] = None
    content: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DocumentInDBBase(DocumentBase, TimestampModel):
    id: int
    knowledge_base_id: int

    class Config:
        from_attributes = True

class Document(DocumentInDBBase):
    knowledge_base: KnowledgeBase
    tags: List[Tag] = []

class DocumentInDB(DocumentInDBBase):
    pass 
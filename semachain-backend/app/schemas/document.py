from pydantic import BaseModel
from typing import Optional, List
from .base import TimestampModel
from .knowledge_base import KnowledgeBase

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

class DocumentCreate(DocumentBase):
    tags: Optional[List[str]] = None

class DocumentUpdate(DocumentBase):
    tags: Optional[List[str]] = None

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
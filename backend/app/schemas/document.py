from pydantic import BaseModel, field_serializer
from typing import List, Dict, Any, Optional
from .base import TimestampModel
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
    tags: List[str]  # Changed from Optional[List[str]] to required List[str]

class DocumentCreate(DocumentBase):
    knowledge_base_id: Optional[int] = None

class DocumentUpdate(DocumentBase):
    title: Optional[str] = None
    content: Optional[str] = None
    knowledge_base_id: Optional[int] = None
    tags: List[str]  # Ensure tags remain required even in updates

class DocumentResponse(DocumentBase):
    id: str
    user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @field_serializer('id')
    def serialize_id_to_str(self, v: int | str) -> str:
        return str(v)

    @field_serializer('user_id')
    def serialize_user_id_to_str(self, v: Optional[int | str]) -> Optional[str]:
        if v is None:
            return None
        return str(v)

    class Config:
        from_attributes = True

class DocumentInDBBase(DocumentBase, TimestampModel):
    id: int
    knowledge_base_id: Optional[int] = None

    class Config:
        from_attributes = True

# Simple document class without circular references
class Document(DocumentInDBBase):
    # Now required with no default value
    tags: List[str]
    knowledge_base_info: Optional[Dict[str, Any]] = None
    
    # Add serializers to ensure consistent type handling
    @field_serializer('id')
    def serialize_id(self, v: int) -> int:
        return v  # Keep as int for DB operations
        
    class Config:
        from_attributes = True

class DocumentInDB(DocumentInDBBase):
    pass
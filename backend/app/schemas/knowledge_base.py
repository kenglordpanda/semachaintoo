from pydantic import BaseModel, field_serializer
from typing import Optional, List, Dict, Any
from .base import TimestampModel
from .user import User
from .organization import Organization
from .document import DocumentResponse

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

# Simple KnowledgeBase class without circular references
class KnowledgeBase(KnowledgeBaseInDBBase):
    owner: User
    organization: Organization
    documents: Optional[List[DocumentResponse]] = []
    
    @field_serializer('documents')
    def serialize_documents(self, documents: Optional[List[Any]]) -> Optional[List[Dict[str, Any]]]:
        if not documents:
            return []
        
        result = []
        for doc in documents:
            # Create a dictionary from the document
            if hasattr(doc, '__dict__'):
                doc_dict = {k: v for k, v in doc.__dict__.items() if not k.startswith('_')}
            else:
                doc_dict = dict(doc)
                
            # Ensure ID fields are strings
            if 'id' in doc_dict:
                doc_dict['id'] = str(doc_dict['id'])
            if 'user_id' in doc_dict:
                doc_dict['user_id'] = str(doc_dict['user_id']) if doc_dict['user_id'] is not None else None
                
            # Ensure tags is always a list
            if 'tags' not in doc_dict or doc_dict['tags'] is None:
                doc_dict['tags'] = []
                
            result.append(doc_dict)
        
        return result

class KnowledgeBaseInDB(KnowledgeBaseInDBBase):
    pass
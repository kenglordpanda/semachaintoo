from typing import List, Optional
import numpy as np
from pymilvus import (
    connections,
    Collection,
    CollectionSchema,
    FieldSchema,
    DataType,
    utility
)
from sentence_transformers import SentenceTransformer

class VectorService:
    def __init__(self):
        self.model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        self.collection_name = "documents"
        self.dimension = 384  # Dimension for all-MiniLM-L6-v2
        self._connect()
        self._ensure_collection()

    def _connect(self):
        """Connect to Milvus server"""
        connections.connect(
            alias="default",
            host="milvus",
            port="19530"
        )

    def _ensure_collection(self):
        """Ensure the collection exists with proper schema"""
        if not utility.has_collection(self.collection_name):
            fields = [
                FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
                FieldSchema(name="document_id", dtype=DataType.INT64),
                FieldSchema(name="content", dtype=DataType.VARCHAR, max_length=65535),
                FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=self.dimension)
            ]
            schema = CollectionSchema(fields=fields, description="Document collection")
            self.collection = Collection(name=self.collection_name, schema=schema)
            
            # Create index for vector field
            index_params = {
                "metric_type": "L2",
                "index_type": "IVF_FLAT",
                "params": {"nlist": 1024}
            }
            self.collection.create_index(field_name="embedding", index_params=index_params)
        else:
            self.collection = Collection(self.collection_name)

    def create_embedding(self, text: str) -> List[float]:
        """Create embedding for a text using the sentence transformer model"""
        embedding = self.model.encode(text)
        return embedding.tolist()

    def add_document(self, document_id: int, content: str) -> int:
        """Add a document to the collection"""
        embedding = self.create_embedding(content)
        data = [
            [document_id],
            [content],
            [embedding]
        ]
        mr = self.collection.insert(data)
        return mr.primary_keys[0]

    def search_similar(self, query: str, top_k: int = 5) -> List[dict]:
        """Search for similar documents"""
        self.collection.load()
        query_embedding = self.create_embedding(query)
        
        search_params = {
            "metric_type": "L2",
            "params": {"nprobe": 10}
        }
        
        results = self.collection.search(
            data=[query_embedding],
            anns_field="embedding",
            param=search_params,
            limit=top_k,
            output_fields=["document_id", "content"]
        )
        
        similar_docs = []
        for hits in results:
            for hit in hits:
                similar_docs.append({
                    "document_id": hit.entity.get("document_id"),
                    "content": hit.entity.get("content"),
                    "distance": hit.distance
                })
        
        return similar_docs

    def delete_document(self, document_id: int) -> bool:
        """Delete a document from the collection"""
        expr = f'document_id == {document_id}'
        self.collection.delete(expr)
        return True

    def get_document(self, document_id: int) -> Optional[dict]:
        """Get a document by ID"""
        expr = f'document_id == {document_id}'
        results = self.collection.query(expr, output_fields=["document_id", "content"])
        return results[0] if results else None 
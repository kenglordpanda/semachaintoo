from typing import List, Optional, Dict, Any
import numpy as np
from pymilvus import (
    connections,
    Collection,
    CollectionSchema,
    FieldSchema,
    DataType,
    utility
)
from ..core.config import settings
from ..utils.text_processing import text_processor

class VectorService:
    def __init__(self):
        self.collection_name = settings.MILVUS_COLLECTION_NAME
        self.dimension = 384  # Keep same dimension for compatibility
        self._connect()
        self._ensure_collection()

    def _connect(self):
        """Connect to Milvus server"""
        connections.connect(
            alias="default",
            host=settings.MILVUS_HOST,
            port=settings.MILVUS_PORT
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
        """Create embedding for a text using TF-IDF vectorizer from text_processor"""
        embedding = text_processor.get_embeddings([text])[0]
        
        # Ensure embedding has correct dimension
        if len(embedding) < self.dimension:
            # Pad with zeros if needed
            embedding = embedding + [0.0] * (self.dimension - len(embedding))
        elif len(embedding) > self.dimension:
            # Truncate if needed
            embedding = embedding[:self.dimension]
            
        return embedding

    def add_document(self, document_id: int, content: str, metadata: Dict[str, Any] = None) -> int:
        """Add a document to the collection"""
        embedding = self.create_embedding(content)
        data = [
            [document_id],
            [content],
            [embedding]
        ]
        mr = self.collection.insert(data)
        return mr.primary_keys[0]

    def update_document(self, document_id: int, content: str, metadata: Dict[str, Any] = None) -> int:
        """Update a document in the collection"""
        # Delete the existing document
        self.delete_document(document_id)
        
        # Add the updated document
        return self.add_document(document_id, content, metadata)

    def search_similar(self, query: str, top_k: int = 5) -> List[dict]:
        """Search for similar documents"""
        try:
            print(f"Searching for similar documents with query length: {len(query)}")
            
            self.collection.load()
            print("Collection loaded successfully")
            
            query_embedding = self.create_embedding(query)
            print(f"Created embedding with dimension: {len(query_embedding)}")
            
            search_params = {
                "metric_type": "L2",
                "params": {"nprobe": 20}  # Increased from 10 to 20 for better recall
            }
            
            results = self.collection.search(
                data=[query_embedding],
                anns_field="embedding",
                param=search_params,
                limit=top_k + 5,  # Fetch more results than needed to ensure we don't miss similar docs
                output_fields=["document_id", "content"]
            )
            print(f"Search completed. Results: {len(results[0]) if results else 0}")
            
            similar_docs = []
            for hits in results:
                for hit in hits:
                    # Add more fields to the response for better debugging
                    similar_docs.append({
                        "document_id": hit.entity.get("document_id"),
                        "title": self._extract_title(hit.entity.get("content", "")),
                        "content": hit.entity.get("content"),
                        "distance": hit.distance
                    })
            
            print(f"Processed {len(similar_docs)} similar documents")
            
            # Sort by distance (lower is more similar)
            similar_docs.sort(key=lambda x: x["distance"])
            
            # Use text_processor to rerank results if needed
            if similar_docs and len(similar_docs) > 1:
                reranked_docs = text_processor.rerank_results(query, similar_docs, top_k=top_k + 5)
                print(f"Reranked {len(reranked_docs)} documents")
                # Return only the top_k results
                return reranked_docs[:top_k]
            
            # Return only the top_k results
            print(f"Returning {len(similar_docs[:top_k])} documents")
            return similar_docs[:top_k]
        except Exception as e:
            print(f"Error in search_similar: {str(e)}")
            # Return empty list instead of raising, to avoid breaking the UI
            return []

    def _extract_title(self, content: str) -> str:
        """Extract title from content for better display in results"""
        if not content:
            return "Untitled"
            
        """Delete a document from the collection"""
        expr = f'document_id == {document_id}'
        self.collection.delete(expr)
        return True

    def get_document(self, document_id: int) -> Optional[dict]:
        """Get a document by ID"""
        expr = f'document_id == {document_id}'
        results = self.collection.query(expr, output_fields=["document_id", "content"])
        return results[0] if results else None
    
    def get_document_similarity_score(self, doc1_id: int, doc2_id: int) -> float:
        """Calculate similarity score between two documents using cosine similarity"""
        # Get documents
        doc1 = self.get_document(doc1_id)
        doc2 = self.get_document(doc2_id)
        
        if not doc1 or not doc2:
            return 0.0
            
        # Get embeddings
        doc1_embedding = self.create_embedding(doc1["content"])
        doc2_embedding = self.create_embedding(doc2["content"])
        
        # Calculate cosine similarity
        similarity = np.dot(doc1_embedding, doc2_embedding) / (
            np.linalg.norm(doc1_embedding) * np.linalg.norm(doc2_embedding)
        )
        
        return float(similarity)

# Create a singleton instance
vector_service = VectorService()
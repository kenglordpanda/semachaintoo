from typing import List, Dict, Any
import weaviate
from sentence_transformers import SentenceTransformer
import numpy as np
from ..core.config import settings
from ..utils.text_processing import text_processor

class VectorDB:
    def __init__(self):
        self.client = weaviate.Client(
            url=settings.WEAVIATE_URL,
            auth_client_secret=weaviate.AuthApiKey(api_key=settings.WEAVIATE_API_KEY) if settings.WEAVIATE_API_KEY else None
        )
        self._ensure_schema()

    def _ensure_schema(self):
        """Ensure the document schema exists in Weaviate."""
        schema = {
            "class": settings.WEAVIATE_COLLECTION_NAME,
            "vectorizer": "none",  # We'll provide our own vectors
            "properties": [
                {
                    "name": "content",
                    "dataType": ["text"],
                },
                {
                    "name": "title",
                    "dataType": ["string"],
                },
                {
                    "name": "userId",
                    "dataType": ["string"],
                },
                {
                    "name": "createdAt",
                    "dataType": ["date"],
                },
                {
                    "name": "updatedAt",
                    "dataType": ["date"],
                },
                {
                    "name": "chunkIndex",
                    "dataType": ["int"],
                }
            ]
        }
        
        try:
            self.client.schema.create_class(schema)
        except weaviate.exceptions.UnexpectedStatusCodeException:
            # Schema already exists
            pass

    def add_document(self, document_id: str, content: str, metadata: Dict[str, Any] = None):
        """Add a document to the vector database with semantic chunking."""
        # Split content into semantic chunks
        chunks = text_processor.chunk_text(content)
        embeddings = text_processor.get_embeddings(chunks)
        
        # Store each chunk with its metadata
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            chunk_id = f"{document_id}_chunk_{i}"
            properties = {
                "content": chunk,
                "chunkIndex": i,
                **(metadata or {})
            }
            
            self.client.data_object.create(
                class_name=settings.WEAVIATE_COLLECTION_NAME,
                properties=properties,
                vector=embedding,
                uuid=chunk_id
            )

    def update_document(self, document_id: str, content: str, metadata: Dict[str, Any] = None):
        """Update a document and its chunks in the vector database."""
        # Delete existing chunks
        self.delete_document(document_id)
        
        # Add new chunks
        self.add_document(document_id, content, metadata)

    def delete_document(self, document_id: str):
        """Delete a document and all its chunks from the vector database."""
        # Delete all chunks for this document
        self.client.batch.delete_objects(
            class_name=settings.WEAVIATE_COLLECTION_NAME,
            where={
                "path": ["content"],
                "operator": "Like",
                "valueString": f"{document_id}_chunk_*"
            }
        )

    def find_similar_documents(self, content: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """Find similar documents using hybrid search and reranking."""
        # Get query embedding
        query_embedding = text_processor.get_embeddings([content])[0]
        
        # Perform hybrid search (vector + keyword)
        result = (
            self.client.query
            .get(settings.WEAVIATE_COLLECTION_NAME, [
                "content", "title", "userId", "createdAt", "updatedAt", "chunkIndex"
            ])
            .with_near_vector({
                "vector": query_embedding
            })
            .with_hybrid(
                query=content,
                alpha=0.5  # Balance between vector and keyword search
            )
            .with_limit(n_results * 2)  # Get more results for reranking
            .do()
        )
        
        documents = result["data"]["Get"][settings.WEAVIATE_COLLECTION_NAME]
        
        # Group chunks by document
        doc_chunks = {}
        for doc in documents:
            doc_id = doc["_additional"]["id"].split("_chunk_")[0]
            if doc_id not in doc_chunks:
                doc_chunks[doc_id] = {
                    'id': doc_id,
                    'content': doc["content"],
                    'metadata': {
                        'title': doc["title"],
                        'userId': doc["userId"],
                        'createdAt': doc["createdAt"],
                        'updatedAt': doc["updatedAt"]
                    },
                    'similarity': 1 - doc["_additional"]["certainty"]
                }
        
        # Convert to list and rerank
        docs_list = list(doc_chunks.values())
        reranked_docs = text_processor.rerank_results(content, docs_list, top_k=n_results)
        
        return reranked_docs

    def get_document_similarity_score(self, doc1_id: str, doc2_id: str) -> float:
        """Calculate similarity score between two documents using their chunks."""
        # Get all chunks for both documents
        doc1_chunks = self.client.query.get(
            settings.WEAVIATE_COLLECTION_NAME,
            ["content"]
        ).with_where({
            "path": ["content"],
            "operator": "Like",
            "valueString": f"{doc1_id}_chunk_*"
        }).do()
        
        doc2_chunks = self.client.query.get(
            settings.WEAVIATE_COLLECTION_NAME,
            ["content"]
        ).with_where({
            "path": ["content"],
            "operator": "Like",
            "valueString": f"{doc2_id}_chunk_*"
        }).do()
        
        if not doc1_chunks["data"]["Get"][settings.WEAVIATE_COLLECTION_NAME] or \
           not doc2_chunks["data"]["Get"][settings.WEAVIATE_COLLECTION_NAME]:
            return 0.0
        
        # Calculate max similarity between any pair of chunks
        max_similarity = 0.0
        doc1_contents = [chunk["content"] for chunk in doc1_chunks["data"]["Get"][settings.WEAVIATE_COLLECTION_NAME]]
        doc2_contents = [chunk["content"] for chunk in doc2_chunks["data"]["Get"][settings.WEAVIATE_COLLECTION_NAME]]
        
        # Get embeddings for all chunks
        doc1_embeddings = text_processor.get_embeddings(doc1_contents)
        doc2_embeddings = text_processor.get_embeddings(doc2_contents)
        
        # Calculate cosine similarity between all pairs of chunks
        for emb1 in doc1_embeddings:
            for emb2 in doc2_embeddings:
                similarity = np.dot(emb1, emb2) / (
                    np.linalg.norm(emb1) * np.linalg.norm(emb2)
                )
                max_similarity = max(max_similarity, similarity)
        
        return float(max_similarity)

vector_db = VectorDB() 
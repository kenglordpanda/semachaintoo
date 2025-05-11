from typing import List, Dict, Any
import spacy
import numpy as np
import os
import logging
from sklearn.feature_extraction.text import TfidfVectorizer
import pickle

logger = logging.getLogger(__name__)

class TextProcessor:
    def __init__(self):
        # Load spaCy model for text processing
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except Exception as e:
            logger.warning(f"Failed to load spaCy model: {str(e)}")
            # Fallback to a simpler NLP pipeline
            self.nlp = spacy.blank("en")
        
        # Create TF-IDF vectorizer for embeddings instead of Hugging Face models
        self.vectorizer = TfidfVectorizer(
            max_features=384,  # Match previous embedding dimension
            stop_words='english',
            ngram_range=(1, 2)
        )
        
        # Try to load pre-trained vectorizer if available
        models_dir = os.environ.get("MODELS_DIR", "/app/models")
        vectorizer_path = os.path.join(models_dir, "tfidf_vectorizer.pkl")
        
        if os.path.exists(vectorizer_path):
            try:
                logger.info(f"Loading TF-IDF vectorizer from {vectorizer_path}")
                with open(vectorizer_path, 'rb') as f:
                    self.vectorizer = pickle.load(f)
            except Exception as e:
                logger.warning(f"Failed to load vectorizer from {vectorizer_path}: {e}")
                # Keep the default vectorizer initialized above
        else:
            logger.info("Using new TF-IDF vectorizer")
            # The vectorizer will be fit on the first batch of documents
            self._vectorizer_fitted = False
    
    def chunk_text(self, text: str, max_chunk_size: int = 512) -> List[str]:
        """Split text into semantic chunks using spaCy."""
        doc = self.nlp(text)
        chunks = []
        current_chunk = []
        current_size = 0
        
        for sent in doc.sents:
            sent_text = sent.text.strip()
            sent_size = len(sent_text.split())
            
            if current_size + sent_size > max_chunk_size and current_chunk:
                chunks.append(" ".join(current_chunk))
                current_chunk = [sent_text]
                current_size = sent_size
            else:
                current_chunk.append(sent_text)
                current_size += sent_size
        
        if current_chunk:
            chunks.append(" ".join(current_chunk))
            
        return chunks

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts using TF-IDF instead of transformer models."""
        # Fit vectorizer if it's the first use
        if not hasattr(self, '_vectorizer_fitted') or not self._vectorizer_fitted:
            try:
                self.vectorizer.fit(texts)
                self._vectorizer_fitted = True
                
                # Try to save the fitted vectorizer
                models_dir = os.environ.get("MODELS_DIR", "/app/models")
                if not os.path.exists(models_dir):
                    os.makedirs(models_dir, exist_ok=True)
                    
                vectorizer_path = os.path.join(models_dir, "tfidf_vectorizer.pkl")
                with open(vectorizer_path, 'wb') as f:
                    pickle.dump(self.vectorizer, f)
                logger.info(f"Saved TF-IDF vectorizer to {vectorizer_path}")
            except Exception as e:
                logger.error(f"Error fitting vectorizer: {e}")
        
        # Transform texts to TF-IDF vectors
        try:
            tfidf_matrix = self.vectorizer.transform(texts)
            # Convert sparse matrix to dense and then to list
            return tfidf_matrix.toarray().tolist()
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            # Return zero vectors as fallback
            return [[0.0] * 384 for _ in range(len(texts))]

    def rerank_results(self, query: str, documents: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
        """Rerank documents using simple BM25-style scoring instead of transformer models."""
        if not documents:
            return []
        
        # Extract content
        contents = [doc['content'] for doc in documents]
        
        # Get query embedding
        query_embedding = self.get_embeddings([query])[0]
        
        # Get document embeddings
        doc_embeddings = self.get_embeddings(contents)
        
        # Calculate cosine similarity
        scores = []
        for doc_embedding in doc_embeddings:
            # Simple dot product for similarity (since TF-IDF vectors are already normalized)
            similarity = sum(q * d for q, d in zip(query_embedding, doc_embedding))
            scores.append(similarity)
        
        # Combine scores with original documents
        scored_docs = list(zip(documents, scores))
        
        # Sort by score and take top k
        scored_docs.sort(key=lambda x: x[1], reverse=True)
        top_docs = scored_docs[:top_k]
        
        # Return reranked documents with scores
        return [{
            **doc,
            'rerank_score': float(score)
        } for doc, score in top_docs]

text_processor = TextProcessor()
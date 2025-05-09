from typing import List, Dict, Any
import spacy
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch
import numpy as np
from sentence_transformers import SentenceTransformer

class TextProcessor:
    def __init__(self):
        # Load models
        self.nlp = spacy.load("en_core_web_sm")
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.reranker_model = AutoModelForSequenceClassification.from_pretrained('cross-encoder/ms-marco-MiniLM-L-6-v2')
        self.reranker_tokenizer = AutoTokenizer.from_pretrained('cross-encoder/ms-marco-MiniLM-L-6-v2')
        
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
        """Generate embeddings for multiple texts."""
        return self.embedding_model.encode(texts).tolist()

    def rerank_results(self, query: str, documents: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
        """Rerank documents using cross-encoder model."""
        if not documents:
            return []
            
        # Prepare pairs for reranking
        pairs = [(query, doc['content']) for doc in documents]
        
        # Tokenize and get scores
        features = self.reranker_tokenizer(
            pairs,
            padding=True,
            truncation=True,
            return_tensors="pt"
        )
        
        with torch.no_grad():
            scores = self.reranker_model(**features).logits.squeeze(-1)
            
        # Convert scores to probabilities
        scores = torch.sigmoid(scores).numpy()
        
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
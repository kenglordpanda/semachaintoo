from typing import Dict, List, Optional
import numpy as np
from datetime import datetime
from textblob import TextBlob
import re
from collections import Counter
import spacy
from nltk.tokenize import sent_tokenize
from nltk.corpus import stopwords
import nltk

class ScoringService:
    def __init__(self):
        # Download required NLTK data
        try:
            nltk.data.find('tokenizers/punkt')
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('punkt')
            nltk.download('stopwords')
        
        # Load spaCy model for NLP features
        self.nlp = spacy.load('en_core_web_sm')
        
        # Updated weights for knowledge base
        self.weights = {
            'knowledge_quality': 0.35,    # Quality of knowledge content
            'completeness': 0.25,         # How complete the information is
            'relevance': 0.20,            # Relevance to query
            'freshness': 0.15,            # How up-to-date the information is
            'engagement': 0.05            # User engagement (reduced weight)
        }

    def calculate_knowledge_quality_score(self, content: str) -> float:
        """Calculate knowledge quality score based on various factors"""
        # Structure score (presence of headings, lists, etc.)
        structure_score = self._calculate_structure_score(content)
        
        # Fact density score (ratio of factual statements)
        fact_density_score = self._calculate_fact_density(content)
        
        # Clarity score (sentence complexity and readability)
        clarity_score = self._calculate_clarity_score(content)
        
        # Reference score (presence of citations, links, etc.)
        reference_score = self._calculate_reference_score(content)
        
        # Combine scores
        quality_score = (
            0.3 * structure_score +
            0.3 * fact_density_score +
            0.2 * clarity_score +
            0.2 * reference_score
        )
        
        return quality_score

    def _calculate_structure_score(self, content: str) -> float:
        """Calculate score based on document structure"""
        # Check for common knowledge base structural elements
        has_headings = bool(re.search(r'^#+\s|^[A-Z][^\n]+\n[-=]+', content, re.MULTILINE))
        has_lists = bool(re.search(r'^\s*[-*]\s|^\s*\d+\.\s', content, re.MULTILINE))
        has_sections = bool(re.search(r'\n\n', content))
        
        # Calculate structure score
        structure_elements = sum([has_headings, has_lists, has_sections])
        return structure_elements / 3.0

    def _calculate_fact_density(self, content: str) -> float:
        """Calculate the density of factual statements"""
        doc = self.nlp(content)
        sentences = list(doc.sents)
        
        if not sentences:
            return 0.0
            
        # Count sentences with factual indicators
        factual_indicators = [
            'is', 'are', 'was', 'were', 'has', 'have', 'had',
            'contains', 'includes', 'consists', 'comprises',
            'defined as', 'refers to', 'means', 'indicates'
        ]
        
        factual_sentences = sum(
            1 for sent in sentences
            if any(indicator in sent.text.lower() for indicator in factual_indicators)
        )
        
        return factual_sentences / len(sentences)

    def _calculate_clarity_score(self, content: str) -> float:
        """Calculate clarity score based on sentence complexity"""
        sentences = sent_tokenize(content)
        if not sentences:
            return 0.0
            
        # Calculate average sentence length
        avg_length = sum(len(sent.split()) for sent in sentences) / len(sentences)
        length_score = 1.0 - min(abs(avg_length - 15) / 15, 1.0)  # Optimal length around 15 words
        
        # Calculate vocabulary diversity
        words = re.findall(r'\w+', content.lower())
        if not words:
            diversity_score = 0
        else:
            word_freq = Counter(words)
            diversity_score = len(word_freq) / len(words)
        
        return 0.6 * length_score + 0.4 * diversity_score

    def _calculate_reference_score(self, content: str) -> float:
        """Calculate score based on presence of references and citations"""
        # Check for common reference patterns
        has_links = bool(re.search(r'\[.*?\]\(.*?\)|https?://\S+', content))
        has_citations = bool(re.search(r'\[\d+\]|\(\d{4}\)', content))
        has_references = bool(re.search(r'References:|Bibliography:|Sources:', content, re.IGNORECASE))
        
        # Calculate reference score
        reference_elements = sum([has_links, has_citations, has_references])
        return reference_elements / 3.0

    def calculate_completeness_score(self, content: str) -> float:
        """Calculate how complete the knowledge entry is"""
        # Check for essential knowledge base elements
        has_definition = bool(re.search(r'is\s+(?:a|an|the)\s+.*?(?:that|which|where)', content, re.IGNORECASE))
        has_examples = bool(re.search(r'for\s+example|e\.g\.|such\s+as', content, re.IGNORECASE))
        has_context = bool(re.search(r'in\s+context|when|where|why', content, re.IGNORECASE))
        
        # Calculate completeness score
        completeness_elements = sum([has_definition, has_examples, has_context])
        return completeness_elements / 3.0

    def calculate_relevance_score(self, content: str, query: Optional[str] = None) -> float:
        """Calculate relevance score based on content and query"""
        if not query:
            return 0.5
            
        # Process content and query
        content_doc = self.nlp(content.lower())
        query_doc = self.nlp(query.lower())
        
        # Extract key terms (nouns and important words)
        content_terms = set(token.text for token in content_doc if token.pos_ in ['NOUN', 'PROPN'])
        query_terms = set(token.text for token in query_doc if token.pos_ in ['NOUN', 'PROPN'])
        
        if not query_terms:
            return 0.5
            
        # Calculate term overlap
        overlap = len(content_terms.intersection(query_terms))
        total = len(content_terms.union(query_terms))
        term_score = overlap / total if total > 0 else 0
        
        # Calculate semantic similarity using spaCy
        similarity_score = content_doc.similarity(query_doc)
        
        return 0.6 * term_score + 0.4 * similarity_score

    def calculate_freshness_score(self, created_at: datetime, updated_at: datetime) -> float:
        """Calculate freshness score based on document age and updates"""
        now = datetime.utcnow()
        
        # Calculate age score (newer is better)
        age_days = (now - created_at).days
        age_score = max(0, 1 - (age_days / 730))  # Decay over 2 years for knowledge base
        
        # Calculate update score
        update_days = (now - updated_at).days
        update_score = max(0, 1 - (update_days / 90))  # Decay over 3 months
        
        # Combine scores with more weight on updates
        freshness_score = 0.4 * age_score + 0.6 * update_score
        
        return freshness_score

    def calculate_engagement_score(self, views: int = 0, likes: int = 0, comments: int = 0) -> float:
        """Calculate engagement score based on user interactions"""
        # Normalize each metric with higher thresholds for knowledge base
        views_score = min(views / 5000, 1.0)  # Cap at 5000 views
        likes_score = min(likes / 500, 1.0)   # Cap at 500 likes
        comments_score = min(comments / 100, 1.0)  # Cap at 100 comments
        
        # Combine scores with more weight on comments (indicates discussion/improvement)
        engagement_score = (
            0.3 * views_score +
            0.3 * likes_score +
            0.4 * comments_score
        )
        
        return engagement_score

    def calculate_overall_score(
        self,
        content: str,
        query: Optional[str] = None,
        views: int = 0,
        likes: int = 0,
        comments: int = 0,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ) -> Dict[str, float]:
        """Calculate overall document score combining all factors"""
        # Calculate individual scores
        knowledge_quality = self.calculate_knowledge_quality_score(content)
        completeness = self.calculate_completeness_score(content)
        relevance = self.calculate_relevance_score(content, query)
        engagement = self.calculate_engagement_score(views, likes, comments)
        
        # Handle freshness score
        if created_at and updated_at:
            freshness = self.calculate_freshness_score(created_at, updated_at)
        else:
            freshness = 1.0
        
        # Calculate weighted overall score
        overall_score = (
            self.weights['knowledge_quality'] * knowledge_quality +
            self.weights['completeness'] * completeness +
            self.weights['relevance'] * relevance +
            self.weights['freshness'] * freshness +
            self.weights['engagement'] * engagement
        )
        
        return {
            'overall_score': overall_score,
            'knowledge_quality_score': knowledge_quality,
            'completeness_score': completeness,
            'relevance_score': relevance,
            'freshness_score': freshness,
            'engagement_score': engagement
        }

    def rank_documents(
        self,
        documents: List[Dict],
        query: Optional[str] = None
    ) -> List[Dict]:
        """Rank a list of documents based on their scores"""
        scored_documents = []
        
        for doc in documents:
            scores = self.calculate_overall_score(
                content=doc['content'],
                query=query,
                views=doc.get('views', 0),
                likes=doc.get('likes', 0),
                comments=doc.get('comments', 0),
                created_at=doc.get('created_at'),
                updated_at=doc.get('updated_at')
            )
            
            scored_doc = {**doc, 'scores': scores}
            scored_documents.append(scored_doc)
        
        # Sort documents by overall score in descending order
        ranked_documents = sorted(
            scored_documents,
            key=lambda x: x['scores']['overall_score'],
            reverse=True
        )
        
        return ranked_documents 
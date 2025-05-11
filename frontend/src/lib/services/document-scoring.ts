import { Document } from '@/lib/api/documents';

/**
 * Frontend implementation of the scoring service
 * Adapted from the backend ScoringService for client-side use
 */
export class DocumentScoringService {
  // Weights for scoring documents - increased relevance weight
  private weights = {
    knowledgeQuality: 0.20,
    completeness: 0.10,
    relevance: 0.60, // Increased from 0.40 to 0.60
    freshness: 0.10,
    engagement: 0.00
  };

  /**
   * Calculate relevance score between document content and current context
   * @param content Document content to score
   * @param context Current context (e.g., text on screen, viewed content)
   * @returns Score between 0 and 1
   */
  calculateRelevanceScore(content: string, context?: string): number {
    if (!context || !content) return 0.5;
    
    // Extract key terms from content and context
    const contentTerms = this.extractKeyTerms(content.toLowerCase());
    const contextTerms = this.extractKeyTerms(context.toLowerCase());
    
    // Calculate term overlap with more lenient matching
    let matchCount = 0;
    
    // Count matches allowing partial term matching
    for (const contentTerm of contentTerms) {
      for (const contextTerm of contextTerms) {
        // Full match
        if (contentTerm === contextTerm) {
          matchCount += 1.5; // Increased weight for exact matches
          break;
        }
        // Partial match (one term contains the other)
        else if (contentTerm.length > 3 && contextTerm.length > 3) { // Reduced from 4 to 3
          if (contentTerm.includes(contextTerm) || contextTerm.includes(contentTerm)) {
            matchCount += 0.75; // Increased from 0.5 to 0.75
            break;
          }
        }
      }
    }
    
    const totalTerms = Math.max(contentTerms.length, contextTerms.length);
    if (totalTerms === 0) return 0.5;
    
    // Calculate enhanced similarity score (0-1)
    const termScore = Math.min(1, matchCount / (totalTerms * 0.5));
    
    // Add a higher base score to ensure more results appear
    return 0.4 + (termScore * 0.6); // Increased base score from 0.3 to 0.4
  }
  
  /**
   * Extract key terms from text for comparison
   */
  private extractKeyTerms(text: string): string[] {
    // Simple implementation - split by spaces and filter for meaningful words
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
      'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'of', 'this', 'that', 'these', 'those', 'it', 'they',
      'their', 'them', 'he', 'she', 'his', 'her', 'him'
    ]);
    
    return text
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 50); // Limit to 50 terms for performance
  }
  
  /**
   * Calculate freshness score based on document age
   */
  calculateFreshnessScore(updatedAt: string): number {
    const now = new Date();
    const updateDate = new Date(updatedAt);
    const ageInDays = (now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Higher score for more recent documents
    // Decays over 90 days (3 months)
    return Math.max(0, 1 - (ageInDays / 90));
  }
  
  /**
   * Calculate a simple document quality score based on content
   */
  calculateQualityScore(content: string): number {
    if (!content) return 0;
    
    // Simple quality indicators
    const wordCount = content.split(/\s+/).length;
    const hasStructure = /\n\n/.test(content); // Has paragraphs
    const hasFormatting = /<[^>]+>/.test(content); // Has HTML formatting
    
    // Calculate a rough quality score
    let score = 0;
    
    // Word count affects quality (up to a reasonable length)
    score += Math.min(wordCount / 500, 1) * 0.5;
    
    // Structure affects quality
    if (hasStructure) score += 0.25;
    
    // Formatting affects quality
    if (hasFormatting) score += 0.25;
    
    return score;
  }
  
  /**
   * Rank documents to determine which to show in popups
   * @param documents List of documents to rank
   * @param context Current context for relevance calculation
   * @returns Scored and ranked documents
   */
  rankDocumentsForPopup(documents: Document[], context?: string): { document: Document, score: number }[] {
    if (!documents || documents.length === 0) return [];
    
    const scoredDocuments = documents.map(doc => {
      // Calculate individual scores
      const relevanceScore = this.calculateRelevanceScore(doc.content || '', context);
      const freshnessScore = this.calculateFreshnessScore(doc.updated_at);
      const qualityScore = this.calculateQualityScore(doc.content || '');
      
      // Calculate weighted overall score
      const overallScore = 
        this.weights.relevance * relevanceScore +
        this.weights.freshness * freshnessScore +
        this.weights.knowledgeQuality * qualityScore;
      
      // Log scores for debugging (remove in production)
      console.log(`Document ${doc.id} scores:`, {
        title: doc.title,
        overall: overallScore.toFixed(2),
        relevance: relevanceScore.toFixed(2),
        freshness: freshnessScore.toFixed(2),
        quality: qualityScore.toFixed(2),
        context: context ? context.substring(0, 50) + '...' : 'none'
      });
      
      return {
        document: doc,
        score: overallScore,
        relevanceScore,
        freshnessScore,
        qualityScore
      };
    });
    
    // Sort by overall score
    return scoredDocuments
      .sort((a, b) => b.score - a.score)
      .map(({ document, score }) => ({ document, score }));
  }
}

// Export singleton instance for use across the application
const documentScoring = new DocumentScoringService();
export default documentScoring;
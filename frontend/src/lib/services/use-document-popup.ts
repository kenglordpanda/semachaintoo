import { useState, useEffect, useRef, useCallback } from 'react';
import { Document } from '@/lib/api/documents';
import documentScoring from './document-scoring';

interface UseDocumentPopupOptions {
  documents: Document[];
  inactivityThreshold?: number; // Time in ms before showing popup
  minScore?: number; // Minimum score to show document
  contextExtractor?: () => string; // Function to extract current context
  debugMode?: boolean; // Enable debug logging
}

interface PopupState {
  isOpen: boolean;
  document: Document | null;
  position: { x: number, y: number };
  score: number;
}

/**
 * Hook to manage document popups based on user inactivity
 */
export function useDocumentPopup({
  documents,
  inactivityThreshold = 5000, // Default 5 seconds
  minScore = 0.5, // Default minimum score
  contextExtractor = () => document.title, // Default context
  debugMode = false, // Debug mode off by default
}: UseDocumentPopupOptions) {
  const [popupState, setPopupState] = useState<PopupState>({
    isOpen: false,
    document: null,
    position: { x: 0, y: 0 },
    score: 0
  });
  
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const isTypingRef = useRef(false);
  const contextRef = useRef('');
  
  // Close the popup
  const closePopup = useCallback(() => {
    setPopupState(prev => ({ ...prev, isOpen: false }));
  }, []);
  
  // Check if we should trigger a popup
  const checkForRelevantDocument = useCallback(() => {
    // Don't show popup if user is typing
    if (isTypingRef.current) {
      if (debugMode) console.log('Popup suppressed: User is typing');
      return;
    }
    
    // Get current context
    const context = contextExtractor();
    contextRef.current = context;
    
    if (debugMode) {
      console.log('Checking for relevant documents');
      console.log('Context:', context ? context.substring(0, 100) + '...' : 'none');
      console.log('Documents count:', documents.length);
      console.log('Min score required:', minScore);
    }
    
    // Score and rank documents
    const rankedDocuments = documentScoring.rankDocumentsForPopup(documents, context);
    
    // Find best document above minimum score
    const bestMatch = rankedDocuments.find(item => item.score >= minScore);
    
    if (bestMatch) {
      if (debugMode) {
        console.log('Found relevant document:', bestMatch.document.title);
        console.log('Score:', bestMatch.score);
      }
      
      setPopupState({
        isOpen: true,
        document: bestMatch.document,
        position: lastMousePosition.current,
        score: bestMatch.score
      });
    } else if (debugMode && rankedDocuments.length > 0) {
      console.log('Best document score too low:', 
        rankedDocuments[0].score.toFixed(2), 
        '(needed', minScore, ')', 
        rankedDocuments[0].document.title);
    }
  }, [documents, minScore, contextExtractor, debugMode]);
  
  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    inactivityTimerRef.current = setTimeout(() => {
      checkForRelevantDocument();
    }, inactivityThreshold);
  }, [inactivityThreshold, checkForRelevantDocument]);
  
  // Check for documents when the hook is first initialized
  useEffect(() => {
    // Wait a moment for documents to be loaded
    const initialCheckTimer = setTimeout(() => {
      if (documents.length > 0 && !isTypingRef.current) {
        if (debugMode) console.log('Running initial document relevance check');
        checkForRelevantDocument();
      }
    }, 2000);
    
    return () => clearTimeout(initialCheckTimer);
  }, [documents, checkForRelevantDocument, debugMode]);
  
  // Setup event listeners for user activity
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
      resetInactivityTimer();
    };
    
    // Track keyboard input to know if user is typing
    const handleKeyDown = () => {
      isTypingRef.current = true;
      // Close popup if it's open
      setPopupState(prev => ({ ...prev, isOpen: false }));
      
      // Reset typing flag after short delay
      setTimeout(() => {
        isTypingRef.current = false;
        // Check for documents immediately after typing stops
        checkForRelevantDocument();
      }, 1000); // Consider typing stopped after 1 second of inactivity (reduced from 2s)
      
      resetInactivityTimer();
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    
    // Initialize the inactivity timer
    resetInactivityTimer();
    
    // Set an interval to periodically check for document relevance when context changes
    const contextCheckInterval = setInterval(() => {
      const newContext = contextExtractor();
      if (newContext !== contextRef.current && !isTypingRef.current) {
        if (debugMode) console.log('Context changed, checking for relevant documents');
        checkForRelevantDocument();
      }
    }, 3000); // Check every 3 seconds
    
    // Clean up event listeners
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      
      clearInterval(contextCheckInterval);
    };
  }, [resetInactivityTimer, checkForRelevantDocument, contextExtractor, debugMode]);
  
  // Return values needed by components that use this hook
  return {
    isPopupOpen: popupState.isOpen,
    popupDocument: popupState.document,
    popupPosition: popupState.position,
    popupScore: popupState.score,
    closePopup,
    forceCheck: checkForRelevantDocument // Expose function to manually trigger checks
  };
}
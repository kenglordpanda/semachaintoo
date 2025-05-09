import { useState, useCallback } from 'react';
import { documentService, Document, SearchResponse } from '@/app/services/documents';

export const useDocuments = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createDocument = useCallback(async (content: string) => {
        try {
            setLoading(true);
            setError(null);
            const document = await documentService.createDocument(content);
            return document;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create document');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateDocument = useCallback(async (documentId: number, content: string) => {
        try {
            setLoading(true);
            setError(null);
            const document = await documentService.updateDocument(documentId, content);
            return document;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update document');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getDocument = useCallback(async (documentId: number) => {
        try {
            setLoading(true);
            setError(null);
            const document = await documentService.getDocument(documentId);
            return document;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get document');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteDocument = useCallback(async (documentId: number) => {
        try {
            setLoading(true);
            setError(null);
            await documentService.deleteDocument(documentId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete document');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const searchDocuments = useCallback(async (query: string, topK: number = 5) => {
        try {
            setLoading(true);
            setError(null);
            const results = await documentService.searchDocuments(query, topK);
            return results;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search documents');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getSimilarDocuments = useCallback(async (documentId: number, nResults: number = 5) => {
        try {
            setLoading(true);
            setError(null);
            const results = await documentService.getSimilarDocuments(documentId, nResults);
            return results;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get similar documents');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        createDocument,
        updateDocument,
        getDocument,
        deleteDocument,
        searchDocuments,
        getSimilarDocuments,
    };
}; 
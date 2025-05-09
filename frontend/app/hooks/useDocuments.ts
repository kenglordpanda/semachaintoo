import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  documentService,
  Document,
  CreateDocumentData,
  UpdateDocumentData,
} from "@/app/services/documents";

export function useDocuments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const getDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const documents = await documentService.getDocuments();
      return documents;
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to fetch documents");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getDocument = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const document = await documentService.getDocument(id);
      return document;
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to fetch document");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createDocument = useCallback(async (data: CreateDocumentData) => {
    try {
      setLoading(true);
      setError(null);
      const document = await documentService.createDocument(data);
      toast.success("Document created successfully");
      router.push(`/documents/${document.id}`);
      return document;
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to create document");
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const updateDocument = useCallback(async (data: UpdateDocumentData) => {
    try {
      setLoading(true);
      setError(null);
      const document = await documentService.updateDocument(data);
      toast.success("Document updated successfully");
      router.push(`/documents/${document.id}`);
      return document;
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to update document");
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await documentService.deleteDocument(id);
      toast.success("Document deleted successfully");
      router.push("/documents");
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to delete document");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const searchDocuments = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const documents = await documentService.searchDocuments(query);
      return documents;
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to search documents");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getDocumentsByCategory = useCallback(async (category: string) => {
    try {
      setLoading(true);
      setError(null);
      const documents = await documentService.getDocumentsByCategory(category);
      return documents;
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to fetch documents");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getDocumentsByStatus = useCallback(async (status: string) => {
    try {
      setLoading(true);
      setError(null);
      const documents = await documentService.getDocumentsByStatus(status);
      return documents;
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to fetch documents");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const incrementViews = useCallback(async (id: string) => {
    try {
      await documentService.incrementViews(id);
    } catch (err) {
      console.error("Failed to increment views:", err);
    }
  }, []);

  const toggleLike = useCallback(async (id: string) => {
    try {
      await documentService.toggleLike(id);
      toast.success("Document liked");
    } catch (err) {
      toast.error("Failed to like document");
    }
  }, []);

  return {
    loading,
    error,
    getDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    searchDocuments,
    getDocumentsByCategory,
    getDocumentsByStatus,
    incrementViews,
    toggleLike,
  };
} 
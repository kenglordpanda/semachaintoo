import api from "@/lib/api";

export interface Document {
    id: string;
    title: string;
    description: string;
    content: string;
    category: string;
    status: "published" | "draft" | "review";
    lastUpdated: string;
    author: {
        name: string;
        email: string;
    };
    views: number;
    likes: number;
}

export interface CreateDocumentData {
    title: string;
    description: string;
    content: string;
    category: string;
    status: "published" | "draft" | "review";
}

export interface UpdateDocumentData extends CreateDocumentData {
    id: string;
}

export const documentService = {
    async getDocuments(): Promise<Document[]> {
        const response = await api.get("/api/v1/documents");
        return response.data;
    },

    async getDocument(id: string): Promise<Document> {
        const response = await api.get(`/api/v1/documents/${id}`);
        return response.data;
    },

    async createDocument(data: CreateDocumentData): Promise<Document> {
        const response = await api.post("/api/v1/documents", data);
        return response.data;
    },

    async updateDocument(data: UpdateDocumentData): Promise<Document> {
        const response = await api.put(`/api/v1/documents/${data.id}`, data);
        return response.data;
    },

    async deleteDocument(id: string): Promise<void> {
        await api.delete(`/api/v1/documents/${id}`);
    },

    async searchDocuments(query: string): Promise<Document[]> {
        const response = await api.get("/api/v1/documents/search", {
            params: { query },
        });
        return response.data;
    },

    async getDocumentsByCategory(category: string): Promise<Document[]> {
        const response = await api.get("/api/v1/documents", {
            params: { category },
        });
        return response.data;
    },

    async getDocumentsByStatus(status: string): Promise<Document[]> {
        const response = await api.get("/api/v1/documents", {
            params: { status },
        });
        return response.data;
    },

    async incrementViews(id: string): Promise<void> {
        await api.post(`/api/v1/documents/${id}/views`);
    },

    async toggleLike(id: string): Promise<void> {
        await api.post(`/api/v1/documents/${id}/likes`);
    },
}; 
import { useState, useEffect } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface DocumentListProps {
    onDocumentClick?: (documentId: number) => void;
    onCreateDocument?: () => void;
}

export function DocumentList({ onDocumentClick, onCreateDocument }: DocumentListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('');
    const [documents, setDocuments] = useState<any[]>([]);
    const { searchDocuments, loading, error } = useDocuments();

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const results = await searchDocuments(searchQuery);
                setDocuments(results);
            } catch (err) {
                toast.error('Failed to load documents');
                console.error('Document search error:', err);
            }
        };

        const debounceTimer = setTimeout(fetchDocuments, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery, searchDocuments]);

    const filteredDocuments = documents.filter((doc) => {
        if (category && doc.category !== category) return false;
        if (status && doc.status !== status) return false;
        return true;
    });

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Documents</h1>
                {onCreateDocument && (
                    <Button onClick={onCreateDocument} variant="default">
                        Create Document
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-4">
                <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                />
                <Select
                    value={category}
                    onValueChange={setCategory}
                    placeholder="Category"
                    options={[
                        { value: '', label: 'All Categories' },
                        { value: 'technical', label: 'Technical' },
                        { value: 'process', label: 'Process' },
                        { value: 'policy', label: 'Policy' },
                    ]}
                />
                <Select
                    value={status}
                    onValueChange={setStatus}
                    placeholder="Status"
                    options={[
                        { value: '', label: 'All Status' },
                        { value: 'draft', label: 'Draft' },
                        { value: 'review', label: 'Review' },
                        { value: 'published', label: 'Published' },
                        { value: 'archived', label: 'Archived' },
                    ]}
                />
            </div>

            {loading ? (
                <div>Loading documents...</div>
            ) : error ? (
                <div className="text-red-500">Error loading documents</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocuments.map((doc) => (
                        <Card
                            key={doc.id}
                            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => onDocumentClick?.(doc.id)}
                        >
                            <div className="flex flex-col gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold mb-2">{doc.title}</h2>
                                    <p className="text-sm text-gray-500 line-clamp-2">
                                        {doc.content_summary}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{doc.status}</Badge>
                                    {doc.category && (
                                        <Badge variant="secondary">{doc.category}</Badge>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>
                                        {formatDistanceToNow(new Date(doc.created_at), {
                                            addSuffix: true,
                                        })}
                                    </span>
                                    <span>{doc.word_count} words</span>
                                </div>

                                {doc.tags && doc.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {doc.tags.map((tag: any) => (
                                            <Badge key={tag.id} variant="secondary">
                                                {tag.name}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {!loading && !error && filteredDocuments.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                    No documents found
                </div>
            )}
        </div>
    );
} 
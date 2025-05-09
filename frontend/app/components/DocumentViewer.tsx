import { useState, useEffect } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface DocumentViewerProps {
    documentId: number;
    onEdit?: () => void;
}

export function DocumentViewer({ documentId, onEdit }: DocumentViewerProps) {
    const [document, setDocument] = useState<any>(null);
    const { getDocument, loading, error } = useDocuments();

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const doc = await getDocument(documentId);
                setDocument(doc);
            } catch (err) {
                toast.error('Failed to load document');
                console.error('Document fetch error:', err);
            }
        };

        fetchDocument();
    }, [documentId, getDocument]);

    if (loading) {
        return <div>Loading document...</div>;
    }

    if (error || !document) {
        return <div className="text-red-500">Error loading document</div>;
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{document.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <Avatar
                                src={document.user?.avatar}
                                alt={document.user?.name}
                                className="w-6 h-6"
                            />
                            <span>{document.user?.name}</span>
                        </div>
                        <span>•</span>
                        <span>
                            {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
                        </span>
                        <span>•</span>
                        <span>{document.word_count} words</span>
                        <span>•</span>
                        <span>{document.estimated_read_time} min read</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="outline">{document.status}</Badge>
                    {onEdit && (
                        <Button onClick={onEdit} variant="outline">
                            Edit
                        </Button>
                    )}
                </div>
            </div>

            {document.category && (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Category:</span>
                    <Badge variant="secondary">{document.category}</Badge>
                </div>
            )}

            {document.tags && document.tags.length > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Tags:</span>
                    <div className="flex gap-2">
                        {document.tags.map((tag: any) => (
                            <Badge key={tag.id} variant="secondary">
                                {tag.name}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <Card className="p-6">
                <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: document.content }}
                />
            </Card>

            {document.attachments && document.attachments.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-4">Attachments</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {document.attachments.map((attachment: any) => (
                            <Card key={attachment.id} className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                        <span className="text-2xl">
                                            {attachment.file_type === 'image' ? '🖼️' : '📎'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium">{attachment.filename}</p>
                                        <p className="text-sm text-gray-500">
                                            {Math.round(attachment.file_size / 1024)} KB
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {document.comments && document.comments.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-4">Comments</h2>
                    <div className="space-y-4">
                        {document.comments.map((comment: any) => (
                            <Card key={comment.id} className="p-4">
                                <div className="flex items-start gap-4">
                                    <Avatar
                                        src={comment.user?.avatar}
                                        alt={comment.user?.name}
                                        className="w-8 h-8"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{comment.user?.name}</span>
                                            <span className="text-sm text-gray-500">
                                                {formatDistanceToNow(new Date(comment.created_at), {
                                                    addSuffix: true,
                                                })}
                                            </span>
                                        </div>
                                        <p className="mt-2">{comment.content}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 
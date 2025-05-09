import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface Attachment {
    id: number;
    filename: string;
    file_type: string;
    file_size: number;
    uploaded_at: string;
    uploaded_by: {
        id: number;
        name: string;
    };
}

interface DocumentAttachmentsProps {
    documentId: number;
    attachments: Attachment[];
    onUploadAttachment: (file: File) => Promise<void>;
    onDeleteAttachment: (attachmentId: number) => Promise<void>;
}

export function DocumentAttachments({
    documentId,
    attachments,
    onUploadAttachment,
    onDeleteAttachment,
}: DocumentAttachmentsProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            await onUploadAttachment(file);
            toast.success('File uploaded successfully');
        } catch (err) {
            toast.error('Failed to upload file');
            console.error('File upload error:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (attachmentId: number) => {
        setIsDeleting(attachmentId);
        try {
            await onDeleteAttachment(attachmentId);
            toast.success('File deleted successfully');
        } catch (err) {
            toast.error('Failed to delete file');
            console.error('File deletion error:', err);
        } finally {
            setIsDeleting(null);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType: string) => {
        const type = fileType.toLowerCase();
        if (type.startsWith('image/')) return '🖼️';
        if (type.includes('pdf')) return '📄';
        if (type.includes('word')) return '📝';
        if (type.includes('excel') || type.includes('sheet')) return '📊';
        if (type.includes('powerpoint') || type.includes('presentation')) return '📑';
        if (type.includes('zip') || type.includes('archive')) return '🗜️';
        return '📎';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Attachments</h2>
                <div>
                    <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        disabled={isUploading}
                    />
                    <Button
                        onClick={() => document.getElementById('file-upload')?.click()}
                        disabled={isUploading}
                        variant="outline"
                    >
                        {isUploading ? 'Uploading...' : 'Upload File'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attachments.map((attachment) => (
                    <Card key={attachment.id} className="p-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-2xl">
                                    {getFileIcon(attachment.file_type)}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate" title={attachment.filename}>
                                    {attachment.filename}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {formatFileSize(attachment.file_size)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Uploaded by {attachment.uploaded_by.name}
                                </p>
                            </div>
                            <Button
                                onClick={() => handleDelete(attachment.id)}
                                disabled={isDeleting === attachment.id}
                                variant="ghost"
                                size="sm"
                            >
                                {isDeleting === attachment.id ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {attachments.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                    No attachments yet. Upload a file to get started!
                </div>
            )}
        </div>
    );
} 
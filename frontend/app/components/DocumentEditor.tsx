import { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useDocuments } from '@/hooks/useDocuments';
import { toast } from 'sonner';

interface DocumentEditorProps {
    documentId?: number;
    initialContent?: string;
    initialTitle?: string;
    initialCategory?: string;
    initialStatus?: string;
    onSave?: () => void;
}

export function DocumentEditor({
    documentId,
    initialContent = '',
    initialTitle = '',
    initialCategory = '',
    initialStatus = 'draft',
    onSave
}: DocumentEditorProps) {
    const [title, setTitle] = useState(initialTitle);
    const [category, setCategory] = useState(initialCategory);
    const [status, setStatus] = useState(initialStatus);
    const [isSaving, setIsSaving] = useState(false);
    const { createDocument, updateDocument, loading, error } = useDocuments();

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Link.configure({
                openOnClick: false,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableCell,
            TableHeader,
            Placeholder.configure({
                placeholder: 'Start writing your document...',
            }),
        ],
        content: initialContent,
    });

    const handleSave = useCallback(async () => {
        if (!editor || !title) return;

        setIsSaving(true);
        try {
            const content = editor.getHTML();
            if (documentId) {
                await updateDocument(documentId, content, {
                    title,
                    category,
                    status,
                });
                toast.success('Document updated successfully');
            } else {
                await createDocument(content, {
                    title,
                    category,
                    status,
                });
                toast.success('Document created successfully');
            }
            onSave?.();
        } catch (err) {
            toast.error('Failed to save document');
            console.error('Save error:', err);
        } finally {
            setIsSaving(false);
        }
    }, [editor, title, category, status, documentId, createDocument, updateDocument, onSave]);

    const handleImageUpload = useCallback(async (file: File) => {
        if (!editor) return;

        try {
            // Here you would typically upload the image to your server
            // and get back a URL. For now, we'll use a placeholder.
            const imageUrl = URL.createObjectURL(file);
            editor.chain().focus().setImage({ src: imageUrl }).run();
        } catch (err) {
            toast.error('Failed to upload image');
            console.error('Image upload error:', err);
        }
    }, [editor]);

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Document title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-2xl font-bold"
                />
                <Select
                    value={status}
                    onValueChange={setStatus}
                    options={[
                        { value: 'draft', label: 'Draft' },
                        { value: 'review', label: 'Review' },
                        { value: 'published', label: 'Published' },
                        { value: 'archived', label: 'Archived' },
                    ]}
                />
            </div>

            <div className="flex items-center gap-4">
                <Input
                    placeholder="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                />
                <Badge variant="outline">{status}</Badge>
            </div>

            <div className="border rounded-lg p-4">
                <div className="flex gap-2 mb-4">
                    <Button
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        variant={editor?.isActive('bold') ? 'default' : 'outline'}
                    >
                        Bold
                    </Button>
                    <Button
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        variant={editor?.isActive('italic') ? 'default' : 'outline'}
                    >
                        Italic
                    </Button>
                    <Button
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                        variant={editor?.isActive('heading') ? 'default' : 'outline'}
                    >
                        H2
                    </Button>
                    <Button
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        variant={editor?.isActive('bulletList') ? 'default' : 'outline'}
                    >
                        Bullet List
                    </Button>
                    <Button
                        onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}
                        variant="outline"
                    >
                        Table
                    </Button>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                        }}
                        className="hidden"
                        id="image-upload"
                    />
                    <Button
                        onClick={() => document.getElementById('image-upload')?.click()}
                        variant="outline"
                    >
                        Image
                    </Button>
                </div>
                <EditorContent editor={editor} className="prose max-w-none" />
            </div>

            <div className="flex justify-end gap-4">
                <Button
                    onClick={handleSave}
                    disabled={isSaving || loading || !title}
                    variant="default"
                >
                    {isSaving ? 'Saving...' : 'Save Document'}
                </Button>
            </div>

            {error && (
                <div className="text-red-500 text-sm">
                    {error}
                </div>
            )}
        </div>
    );
} 
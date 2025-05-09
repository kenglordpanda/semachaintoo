import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Comment {
    id: number;
    content: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        avatar?: string;
    };
}

interface DocumentCommentsProps {
    documentId: number;
    comments: Comment[];
    onAddComment: (content: string) => Promise<void>;
}

export function DocumentComments({
    documentId,
    comments,
    onAddComment,
}: DocumentCommentsProps) {
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            await onAddComment(newComment);
            setNewComment('');
            toast.success('Comment added successfully');
        } catch (err) {
            toast.error('Failed to add comment');
            console.error('Comment submission error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Comments</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px]"
                />
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                        variant="default"
                    >
                        {isSubmitting ? 'Posting...' : 'Post Comment'}
                    </Button>
                </div>
            </form>

            <div className="space-y-4">
                {comments.map((comment) => (
                    <Card key={comment.id} className="p-4">
                        <div className="flex items-start gap-4">
                            <Avatar
                                src={comment.user.avatar}
                                alt={comment.user.name}
                                className="w-8 h-8"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{comment.user.name}</span>
                                    <span className="text-sm text-gray-500">
                                        {formatDistanceToNow(new Date(comment.created_at), {
                                            addSuffix: true,
                                        })}
                                    </span>
                                </div>
                                <p className="mt-2 whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        </div>
                    </Card>
                ))}

                {comments.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        No comments yet. Be the first to comment!
                    </div>
                )}
            </div>
        </div>
    );
} 
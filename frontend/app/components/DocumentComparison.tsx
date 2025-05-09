import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { diffWords } from 'diff';
import { toast } from 'sonner';

interface Version {
    id: number;
    version: number;
    content: string;
    created_at: string;
    created_by: {
        id: number;
        name: string;
    };
}

interface DocumentComparisonProps {
    version1: Version;
    version2: Version;
    onClose: () => void;
}

export function DocumentComparison({
    version1,
    version2,
    onClose,
}: DocumentComparisonProps) {
    const [differences, setDifferences] = useState<any[]>([]);

    useEffect(() => {
        try {
            const diff = diffWords(version1.content, version2.content);
            setDifferences(diff);
        } catch (err) {
            toast.error('Failed to compare versions');
            console.error('Version comparison error:', err);
        }
    }, [version1.content, version2.content]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Version Comparison</h2>
                <Button onClick={onClose} variant="outline">
                    Close
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-4 mb-4">
                        <h3 className="font-medium">Version {version1.version}</h3>
                        <Badge variant="outline">
                            {formatDistanceToNow(new Date(version1.created_at), {
                                addSuffix: true,
                            })}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                        By {version1.created_by.name}
                    </p>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-4 mb-4">
                        <h3 className="font-medium">Version {version2.version}</h3>
                        <Badge variant="outline">
                            {formatDistanceToNow(new Date(version2.created_at), {
                                addSuffix: true,
                            })}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                        By {version2.created_by.name}
                    </p>
                </Card>
            </div>

            <Card className="p-6">
                <div className="prose max-w-none">
                    {differences.map((part, index) => (
                        <span
                            key={index}
                            className={
                                part.added
                                    ? 'bg-green-100 text-green-800'
                                    : part.removed
                                    ? 'bg-red-100 text-red-800 line-through'
                                    : ''
                            }
                        >
                            {part.value}
                        </span>
                    ))}
                </div>
            </Card>

            <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-100 rounded"></div>
                    <span>Added content</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-100 rounded"></div>
                    <span>Removed content</span>
                </div>
            </div>
        </div>
    );
} 
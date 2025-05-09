import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
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
    changes: {
        added: number;
        removed: number;
    };
}

interface DocumentVersionHistoryProps {
    documentId: number;
    versions: Version[];
    onRestoreVersion: (versionId: number) => Promise<void>;
    onCompareVersions: (version1: number, version2: number) => void;
}

export function DocumentVersionHistory({
    documentId,
    versions,
    onRestoreVersion,
    onCompareVersions,
}: DocumentVersionHistoryProps) {
    const [selectedVersions, setSelectedVersions] = useState<number[]>([]);
    const [isRestoring, setIsRestoring] = useState<number | null>(null);

    const handleVersionSelect = (versionId: number) => {
        setSelectedVersions((prev) => {
            if (prev.includes(versionId)) {
                return prev.filter((id) => id !== versionId);
            }
            if (prev.length < 2) {
                return [...prev, versionId];
            }
            return [prev[1], versionId];
        });
    };

    const handleCompare = () => {
        if (selectedVersions.length !== 2) return;
        onCompareVersions(selectedVersions[0], selectedVersions[1]);
    };

    const handleRestore = async (versionId: number) => {
        setIsRestoring(versionId);
        try {
            await onRestoreVersion(versionId);
            toast.success('Version restored successfully');
        } catch (err) {
            toast.error('Failed to restore version');
            console.error('Version restore error:', err);
        } finally {
            setIsRestoring(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Version History</h2>
                {selectedVersions.length === 2 && (
                    <Button onClick={handleCompare} variant="outline">
                        Compare Selected Versions
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                {versions.map((version) => (
                    <Card
                        key={version.id}
                        className={`p-4 ${
                            selectedVersions.includes(version.id)
                                ? 'border-primary'
                                : ''
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-4">
                                    <h3 className="font-medium">
                                        Version {version.version}
                                    </h3>
                                    <Badge variant="outline">
                                        {formatDistanceToNow(new Date(version.created_at), {
                                            addSuffix: true,
                                        })}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    By {version.created_by.name}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                    <span className="text-green-600">
                                        +{version.changes.added} lines added
                                    </span>
                                    <span className="text-red-600">
                                        -{version.changes.removed} lines removed
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => handleVersionSelect(version.id)}
                                    variant={selectedVersions.includes(version.id) ? 'default' : 'outline'}
                                    size="sm"
                                >
                                    {selectedVersions.includes(version.id) ? 'Selected' : 'Select'}
                                </Button>
                                <Button
                                    onClick={() => handleRestore(version.id)}
                                    disabled={isRestoring === version.id}
                                    variant="ghost"
                                    size="sm"
                                >
                                    {isRestoring === version.id ? 'Restoring...' : 'Restore'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {versions.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                    No version history available
                </div>
            )}
        </div>
    );
} 
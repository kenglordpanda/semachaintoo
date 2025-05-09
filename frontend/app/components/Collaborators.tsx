'use client';

import { User } from 'lucide-react';

interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursorPosition?: { x: number; y: number };
}

interface CollaboratorsProps {
  users: Collaborator[];
}

export default function Collaborators({ users }: CollaboratorsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Active Collaborators</h3>
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: user.color }}
            />
            <span className="text-sm text-gray-900">{user.name}</span>
            {user.cursorPosition && (
              <span className="text-xs text-gray-500">
                (editing)
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 
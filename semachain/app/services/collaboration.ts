import { useEffect, useRef, useState } from 'react';

interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  cursorPosition?: { x: number; y: number };
}

interface CollaborationMessage {
  type: 'cursor' | 'content' | 'presence';
  userId: string;
  documentId: string;
  data: any;
}

export function useCollaboration(documentId: string, userId: string, userName: string) {
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const userColor = useRef(`hsl(${Math.random() * 360}, 70%, 50%)`);

  useEffect(() => {
    // In a real app, this would connect to your WebSocket server
    // For now, we'll simulate the connection
    const connect = () => {
      setIsConnected(true);
      
      // Simulate other users joining
      setUsers([
        {
          id: userId,
          name: userName,
          color: userColor.current,
        },
        {
          id: 'user2',
          name: 'Alice',
          color: '#FF6B6B',
        },
        {
          id: 'user3',
          name: 'Bob',
          color: '#4ECDC4',
        },
      ]);
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [documentId, userId, userName]);

  const sendCursorPosition = (position: { x: number; y: number }) => {
    if (!ws.current) return;

    const message: CollaborationMessage = {
      type: 'cursor',
      userId,
      documentId,
      data: position,
    };

    ws.current.send(JSON.stringify(message));
  };

  const sendContentUpdate = (content: string) => {
    if (!ws.current) return;

    const message: CollaborationMessage = {
      type: 'content',
      userId,
      documentId,
      data: content,
    };

    ws.current.send(JSON.stringify(message));
  };

  return {
    users,
    isConnected,
    sendCursorPosition,
    sendContentUpdate,
  };
} 
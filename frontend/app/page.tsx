'use client';

import { useState } from 'react';
import Link from 'next/link';
import CreateKnowledgeBase from '@/app/components/CreateKnowledgeBase';
import { Button } from "@/components/ui/button";

// This would typically come from an API
interface KnowledgeBase {
  id: string;
  title: string;
  description: string;
  documentCount: number;
}

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([
    {
      id: '1',
      title: 'Project Documentation',
      description: 'Technical documentation and guides for the main project.',
      documentCount: 15,
    },
    {
      id: '2',
      title: 'Research Notes',
      description: 'Collection of research papers and personal notes.',
      documentCount: 8,
    },
  ]);

  const handleCreateKnowledgeBase = (title: string, description: string) => {
    const newKnowledgeBase: KnowledgeBase = {
      id: Date.now().toString(),
      title,
      description,
      documentCount: 0,
    };
    setKnowledgeBases([...knowledgeBases, newKnowledgeBase]);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Welcome to SemaChain
        </h1>
        <p className="text-xl mb-8 text-center">
          A modern document management system
        </p>
        <div className="flex justify-center">
          <Link href="/documents">
            <Button>View Documents</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

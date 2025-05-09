"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDocuments } from "@/app/hooks/useDocuments";
import type { Document } from "@/app/services/documents";

interface Props {
  params: {
    id: string;
  };
}

export default function DocumentPage({ params }: Props) {
  const [document, setDocument] = useState<Document | null>(null);
  const { loading, error, getDocument, incrementViews, toggleLike } = useDocuments();

  useEffect(() => {
    const fetchDocument = async () => {
      const doc = await getDocument(params.id);
      if (!doc) {
        notFound();
      }
      setDocument(doc);
      incrementViews(params.id);
    };
    fetchDocument();
  }, [params.id, getDocument, incrementViews]);

  if (error) {
    throw error;
  }

  if (loading || !document) {
    return (
      <main className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="h-9 w-64 bg-muted rounded-md animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-muted rounded-md animate-pulse" />
            <div className="h-10 w-24 bg-muted rounded-md animate-pulse" />
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          <div className="h-6 w-20 bg-muted rounded-md animate-pulse" />
          <div className="h-6 w-24 bg-muted rounded-md animate-pulse" />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-4 w-full bg-muted rounded-md mb-2 animate-pulse" />
            <div className="h-4 w-3/4 bg-muted rounded-md animate-pulse" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded-md animate-pulse" />
              <div className="h-4 w-full bg-muted rounded-md animate-pulse" />
              <div className="h-4 w-3/4 bg-muted rounded-md animate-pulse" />
              <div className="h-4 w-full bg-muted rounded-md animate-pulse" />
              <div className="h-4 w-5/6 bg-muted rounded-md animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{document.title}</h1>
        <div className="flex gap-2">
          <Link href={`/documents/${document.id}/edit`}>
            <Button>Edit Document</Button>
          </Link>
          <Link href="/documents">
            <Button variant="outline">Back to Documents</Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        <Badge variant="secondary">{document.category}</Badge>
        <Badge
          variant={
            document.status === "published"
              ? "default"
              : document.status === "draft"
              ? "secondary"
              : "outline"
          }
        >
          {document.status}
        </Badge>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{document.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{document.content}</p>
        </CardContent>
      </Card>

      <div className="mt-8 text-sm text-muted-foreground">
        <p>Author: {document.author.name}</p>
        <p>Last updated: {document.lastUpdated}</p>
        <div className="flex gap-4">
          <p>{document.views} views</p>
          <button
            onClick={() => toggleLike(document.id)}
            className="hover:text-primary"
          >
            {document.likes} likes
          </button>
        </div>
      </div>
    </main>
  );
} 
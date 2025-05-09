'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "@/components/Search";
import { Filter } from "@/components/Filter";
import { useDocuments } from "@/app/hooks/useDocuments";
import type { Document } from "@/app/services/documents";
import { FileQuestion } from "lucide-react";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const { loading, error, getDocuments, searchDocuments, getDocumentsByCategory, getDocumentsByStatus } = useDocuments();

  useEffect(() => {
    const fetchDocuments = async () => {
      const docs = await getDocuments();
      setDocuments(docs);
    };
    fetchDocuments();
  }, [getDocuments]);

  useEffect(() => {
    const fetchFilteredDocuments = async () => {
      if (searchQuery) {
        const docs = await searchDocuments(searchQuery);
        setDocuments(docs);
        return;
      }

      if (activeFilter === "all") {
        const docs = await getDocuments();
        setDocuments(docs);
        return;
      }

      if (["published", "draft", "review"].includes(activeFilter)) {
        const docs = await getDocumentsByStatus(activeFilter);
        setDocuments(docs);
        return;
      }

      const docs = await getDocumentsByCategory(activeFilter);
      setDocuments(docs);
    };
    fetchFilteredDocuments();
  }, [searchQuery, activeFilter, getDocuments, searchDocuments, getDocumentsByCategory, getDocumentsByStatus]);

  if (error) {
    throw error;
  }

  return (
    <main className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Documents</h1>
        <Link href="/documents/new">
          <Button>Create New Document</Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-8">
        <Search
          onSearch={setSearchQuery}
          placeholder="Search documents..."
        />
        <Filter
          onFilter={setActiveFilter}
          activeFilter={activeFilter}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-full">
              <CardHeader>
                <div className="h-6 bg-muted rounded-md mb-2 animate-pulse" />
                <div className="h-4 bg-muted rounded-md w-3/4 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="h-5 w-20 bg-muted rounded-md animate-pulse" />
                  <div className="h-5 w-24 bg-muted rounded-md animate-pulse" />
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-4 w-32 bg-muted rounded-md animate-pulse" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Documents Found</h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery || activeFilter !== "all"
              ? "No documents match your search criteria."
              : "There are no documents available at the moment."}
          </p>
          <Link href="/documents/new">
            <Button>Create New Document</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Link key={doc.id} href={`/documents/${doc.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{doc.title}</CardTitle>
                  <CardDescription>{doc.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{doc.category}</Badge>
                    <Badge
                      variant={
                        doc.status === "published"
                          ? "default"
                          : doc.status === "draft"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {doc.status}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  Last updated: {doc.lastUpdated}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
} 
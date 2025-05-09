import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileX } from "lucide-react";

export default function DocumentEditNotFound() {
  return (
    <main className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <FileX className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Document Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The document you are trying to edit does not exist or has been deleted.
        </p>
        <div className="flex gap-4">
          <Link href="/documents">
            <Button>Back to Documents</Button>
          </Link>
          <Link href="/documents/new">
            <Button variant="outline">Create New Document</Button>
          </Link>
        </div>
      </div>
    </main>
  );
} 
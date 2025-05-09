import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function DocumentsNotFound() {
  return (
    <main className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Documents Found</h2>
        <p className="text-muted-foreground mb-6">
          There are no documents available at the moment.
        </p>
        <Link href="/documents/new">
          <Button>Create New Document</Button>
        </Link>
      </div>
    </main>
  );
} 
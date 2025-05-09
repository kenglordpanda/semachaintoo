import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function DocumentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">
          {error.message || "An error occurred while loading the documents."}
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </main>
  );
} 
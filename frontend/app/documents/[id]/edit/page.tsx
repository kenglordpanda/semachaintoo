import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Document {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  status: "published" | "draft" | "review";
  lastUpdated: string;
  author: {
    name: string;
    email: string;
  };
  views: number;
  likes: number;
}

// Mock data for a single document
const document: Document = {
  id: "1",
  title: "Getting Started Guide",
  description: "A comprehensive guide to help you get started with our platform.",
  content: "This is the main content of the document. It would typically be much longer and contain formatted text.",
  category: "guide",
  status: "published",
  lastUpdated: "2024-03-15",
  author: {
    name: "John Doe",
    email: "john@example.com",
  },
  views: 123,
  likes: 45,
};

interface Props {
  params: {
    id: string;
  };
}

export default function DocumentEditPage({ params }: Props) {
  // In a real app, we would fetch the document here
  // For now, we'll simulate a not-found state if the ID doesn't match
  if (params.id !== "1") {
    notFound();
  }

  return (
    <main className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Document</h1>
        <div className="flex gap-2">
          <Button type="submit" form="edit-form">Save Changes</Button>
          <Link href={`/documents/${params.id}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </div>

      <form id="edit-form" className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                name="title"
                defaultValue={document.title}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                defaultValue={document.description}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <Select name="category" defaultValue={document.category}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guide">Guide</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="reference">Reference</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select name="status" defaultValue={document.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">In Review</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="content"
              name="content"
              defaultValue={document.content}
              required
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>
      </form>
    </main>
  );
} 
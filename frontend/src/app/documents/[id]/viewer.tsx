"use client";

interface DocumentViewerProps {
  content: string;
}

export default function DocumentViewer({ content }: DocumentViewerProps) {
  return (
    <div 
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
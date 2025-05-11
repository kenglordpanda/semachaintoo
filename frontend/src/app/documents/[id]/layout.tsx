import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Document Details',
  description: 'View document details and content',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function DocumentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
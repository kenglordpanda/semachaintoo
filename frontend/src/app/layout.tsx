import type { Metadata } from "next";
import "./globals.css";
import AuthProviderWrapper from "./auth-provider-wrapper"; // Added import

export const metadata: Metadata = {
  title: "SemaChain",
  description: "Semantic Knowledge Management Platform",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AuthProviderWrapper>{children}</AuthProviderWrapper> {/* Wrapped children */}
      </body>
    </html>
  );
}

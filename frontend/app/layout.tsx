import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "./styles/editor.css"
import ClientLayout from './layout-client'
import { Toaster } from "@/components/ui/toaster"
import { Navigation } from "@/components/Navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SemaChain",
  description: "A modern document management system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <ClientLayout>{children}</ClientLayout>
        <Toaster />
      </body>
    </html>
  )
}

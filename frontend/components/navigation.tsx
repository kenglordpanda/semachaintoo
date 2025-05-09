import Link from 'next/link'
import { Button } from './ui/button'

export function Navigation() {
  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost">Home</Button>
          </Link>
          <Link href="/documents">
            <Button variant="ghost">Documents</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
} 
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text-color)]">
      {/* Header */}
      <header className="bg-[var(--background)] dark:bg-[var(--gray-50)] shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" legacyBehavior>
                <a className="text-2xl font-bold text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors">
                  SemaChain
                </a>
              </Link>
            </div>
            {/* Login/Register buttons moved to the main content for landing page specific layout */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col justify-center items-center text-center p-6 sm:p-8 relative">
        {/* Buttons container positioned to the top right */}
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8 flex items-center space-x-3 sm:space-x-4">
          <Link href="/login" legacyBehavior>
            <a className="btn btn-primary">
              Login
            </a>
          </Link>
          <Link href="/register" legacyBehavior>
            <a className="btn btn-secondary">
              Register
            </a>
          </Link>
        </div>

        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-[var(--foreground)]">
            Welcome to <span className="text-[var(--primary)]">SemaChain</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--secondary)] mb-10">
            Streamline your knowledge, enhance collaboration, and unlock insights with our intelligent management platform.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center bg-[var(--gray-50)] dark:bg-[var(--gray-100)] border-t border-[var(--gray-200)] dark:border-[var(--gray-700)]">
        <p className="text-[var(--gray-600)] dark:text-[var(--secondary)]">
          SemaChain © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

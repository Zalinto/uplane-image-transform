import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="w-full max-w-md space-y-8">
        <div className="relative">
          <div className="absolute left-1/2 top-1/2 -z-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-200/50 blur-3xl dark:bg-gray-800/50"></div>
          
          <h1 className="text-9xl font-black tracking-tighter text-foreground">
            404
          </h1>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Page Not Found
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400">
            The page you are looking for does not exist.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-all hover:bg-foreground/90 hover:ring-2 hover:ring-foreground hover:ring-offset-2 hover:ring-offset-background active:scale-95"
          >
            <span>Go Home</span>
            <svg 
              className="h-4 w-4 transition-transform group-hover:translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

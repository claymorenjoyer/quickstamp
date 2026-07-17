"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-[#faf8f5]">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center">
            <div className="text-7xl mb-4">⚠</div>
            <h1 className="text-3xl font-extrabold text-stone-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-stone-500">Please try again.</p>
            <button
              onClick={reset}
              className="mt-6 rounded-lg bg-amber-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-900 transition-colors shadow-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

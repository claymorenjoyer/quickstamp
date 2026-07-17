export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm animate-pulse">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`h-4 rounded bg-stone-200 ${
            i === 0 ? "w-2/3" : i === lines - 1 ? "w-1/3" : "w-1/2"
          } ${i > 0 ? "mt-2" : ""}`}
        />
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm animate-pulse">
      <div className="h-3 w-16 rounded bg-stone-200" />
      <div className="mt-2 h-7 w-12 rounded bg-stone-200" />
      <div className="mt-1 h-3 w-20 rounded bg-stone-200" />
    </div>
  );
}

export function SkeletonLine() {
  return (
    <div className="flex items-center justify-between px-5 py-4 animate-pulse">
      <div>
        <div className="h-4 w-24 rounded bg-stone-200" />
        <div className="mt-1 h-3 w-32 rounded bg-stone-200" />
      </div>
      <div className="h-5 w-16 rounded-full bg-stone-200" />
    </div>
  );
}

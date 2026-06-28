export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[2/3] rounded-xl bg-surface-2" />
        </div>
      ))}
    </div>
  );
}

export function RowSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="mb-4 h-7 w-48 rounded-lg bg-surface-2" />
      <div className="no-scrollbar -mx-4 flex gap-4 overflow-hidden px-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="w-36 shrink-0 animate-pulse sm:w-40 md:w-44">
            <div className="aspect-[2/3] rounded-xl bg-surface-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

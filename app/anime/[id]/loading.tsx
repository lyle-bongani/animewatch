export default function Loading() {
  return (
    <div>
      <div className="h-56 w-full animate-pulse bg-surface-2 sm:h-72" />
      <div className="mx-auto max-w-7xl px-4">
        <div className="-mt-28 flex flex-col gap-6 sm:flex-row sm:gap-8">
          <div className="mx-auto aspect-[2/3] w-44 shrink-0 animate-pulse rounded-xl bg-surface-2 sm:mx-0" />
          <div className="flex-1 space-y-4 pt-4 sm:pt-28">
            <div className="h-9 w-2/3 animate-pulse rounded bg-surface-2" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-surface-2" />
            <div className="h-24 w-full animate-pulse rounded bg-surface-2" />
          </div>
        </div>
      </div>
    </div>
  );
}

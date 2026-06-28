export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 h-4 w-64 animate-pulse rounded bg-surface-2" />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="aspect-video w-full animate-pulse rounded-xl bg-surface-2" />
          <div className="mt-4 h-6 w-1/2 animate-pulse rounded bg-surface-2" />
        </div>
        <div className="h-[70vh] animate-pulse rounded-xl bg-surface-2" />
      </div>
    </div>
  );
}

import { GridSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 h-8 w-64 animate-pulse rounded bg-surface-2" />
      <GridSkeleton count={18} />
    </div>
  );
}

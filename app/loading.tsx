import { RowSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div>
      <div className="h-[68vh] min-h-[420px] w-full animate-pulse bg-surface-2" />
      <div className="mt-10 flex flex-col gap-12">
        <RowSkeleton />
        <RowSkeleton />
      </div>
    </div>
  );
}

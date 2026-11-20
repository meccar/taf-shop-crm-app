import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 6, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="border-b border-line bg-canvas px-4 py-3">
        <div className="flex items-center gap-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-3.5 flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-surface-subtle">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 px-4 py-3.5">
            {Array.from({ length: columns }).map((__, colIndex) => (
              <Skeleton
                key={colIndex}
                className={colIndex === 0 ? "h-4 w-44" : "h-4 flex-1"}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

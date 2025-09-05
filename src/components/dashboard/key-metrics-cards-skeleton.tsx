import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

interface KeyMetricsCardsSkeletonProps {
  isDateChanging?: boolean;
}

export function KeyMetricsCardsSkeleton({ isDateChanging = false }: KeyMetricsCardsSkeletonProps) {
  return (
    <div className="relative">
      {isDateChanging && (
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center py-2">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Loading new data...
          </div>
        </div>
      )}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 ${isDateChanging ? 'pt-8' : ''}`}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 bg-gradient-to-br from-slate-50 to-gray-50/40">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20" />
              {i === 2 || i === 4 || i === 6 ? ( // Today's, This Week's, This Month's cards have percentage indicators
                <div className="flex items-center gap-1 mt-1">
                  <Skeleton className="h-3 w-3 rounded" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

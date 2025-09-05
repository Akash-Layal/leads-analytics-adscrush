import { AnalyticsPageClient } from "@/components/pages/analytics-page-client";
import { getAllTableCountsAction, getAllTableStatsAction, getTotalCountAction } from "@/lib/actions-analytics";

export default async function DashboardPage() {
  // Get counts for all tables dynamically using server actions
  const tableCountsResult = await getAllTableCountsAction();
  const totalCountResult = await getTotalCountAction();
  const tableStatsResult = await getAllTableStatsAction();

  // Handle potential errors
  if (!tableCountsResult.success || !totalCountResult.success || !tableStatsResult.success) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <AnalyticsPageClient 
      initialTableCounts={tableCountsResult.counts}
      initialTotalCount={totalCountResult.total}
      initialTableStats={tableStatsResult.stats}
    />
  );
}

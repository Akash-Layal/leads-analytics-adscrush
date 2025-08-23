import { AppSidebar } from "@/components/app-sidebar";
import { getAllTableCounts, getTotalCount, getTableStats } from "@/lib/table-counts";
import { AnalyticsPageClient } from "@/components/analytics-page-client";

export default async function DashboardPage() {
  // Get counts for all tables dynamically using server actions
  const tableCounts = await getAllTableCounts();
  const totalCount = await getTotalCount();
  const tableStats = await getTableStats();

  return (
    <AnalyticsPageClient 
      initialTableCounts={tableCounts}
      initialTotalCount={totalCount}
      initialTableStats={tableStats}
    />
  );
}

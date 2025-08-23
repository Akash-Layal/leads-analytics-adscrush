import { Activity } from "lucide-react";
import { getDashboardDataAction, type DashboardActionResult } from "@/lib/actions-dashboard";
import { 
  KeyMetricsCards,
  PerformanceMetrics,
  ClientStatusOverview,
  TopPerformingTables,
  DashboardRefreshButton
} from "@/components/dashboard";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Loading component for Suspense
function DashboardSkeleton() {
  return (
    <div className="flex-1 p-8">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border rounded-lg p-6">
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="border rounded-lg p-6">
              <Skeleton className="h-6 w-32 mb-2" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main dashboard content component
async function DashboardContent() {
  const result: DashboardActionResult = await getDashboardDataAction();
  
  if (!result.success) {
    return (
      <div className="flex-1 p-8">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Failed to load dashboard data</h2>
          <p className="text-gray-500">{result.error}</p>
        </div>
      </div>
    );
  }

  const { data } = result;
  const { clients, tableCounts, todayTableCounts, yesterdayTableCounts, last7DaysTableCounts, dailyStats, totalRecords, aggregatedStats } = data;

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Dashboard</h1>
            <p className="text-gray-600">Overview of all clients, tables, and system performance</p>
          </div>
        </div>
        <DashboardRefreshButton />
      </div>

      {/* Key Metrics Cards */}
      <KeyMetricsCards
        totalClients={clients.length}
        totalRecords={totalRecords}
        totalTables={data.totalTables}
        todaysLeads={aggregatedStats.today}
      />

      {/* Performance Dashboard */}
      <PerformanceMetrics
        totalRecords={totalRecords}
        totalTables={data.totalTables}
        aggregatedStats={aggregatedStats}
        totalClients={clients.length}
      />

      {/* Client Status Overview */}
      <ClientStatusOverview clients={clients} />

      {/* Top Performing Tables */}
      <TopPerformingTables tableCounts={tableCounts} todayTableCounts={todayTableCounts} yesterdayTableCounts={yesterdayTableCounts} last7DaysTableCounts={last7DaysTableCounts} />
    </div>
  );
}

// Main dashboard page component
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

import { DashboardRefreshButton, KeyMetricsCards, TopPerformingTablesClient } from "@/components/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { parseDateParamsToIST } from "@/lib/helpers/date";
import { getDashboardDataSafe } from "@/lib/services/dashboard-data.service";
import { Activity } from "lucide-react";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined; date?: string }>;
};

// Main dashboard page component
export default async function DashboardPage({ searchParams }: PageProps) {
  const date = (await searchParams).date;
  const { date_from, date_to } = parseDateParamsToIST(date);

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent searchParams={{ date_from, date_to }} />
    </Suspense>
  );
}

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
async function DashboardContent({ searchParams }: { searchParams: { date_from?: string; date_to?: string } }) {
  const { date_from, date_to } = searchParams;

  // Get all dashboard data in a single optimized call
  const result = await getDashboardDataSafe(date_from, date_to);

  if (!result.success || !result.data) {
    console.error("Error loading dashboard data:", result.error);
    
    // Return error state
    return (
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">System Dashboard</h1>
              <p className="text-red-600">Error loading dashboard data. Please try refreshing the page.</p>
            </div>
          </div>
          <DashboardRefreshButton />
        </div>
        
        <div className="text-center py-12">
          <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Activity className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Dashboard</h3>
          <p className="text-sm text-gray-500 mb-4">There was an error loading the dashboard data.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const {
    totalClientsCount,
    totalTablesCount,
    totalTableRecordsCount,
    todaysLeadsCount,
    yesterdayLeadsCount,
    thisWeekLeadsCount,
    lastWeekLeadsCount,
    thisMonthLeadsCount,
    lastMonthLeadsCount,
    tableCounts,
    totalLeads,
    averageGrowth
  } = result.data;

  console.log("Date range:", date_from, date_to);
  // console.log("Table counts:", tableCounts);
  // console.log("Total leads:", totalLeads);
  // console.log("Average growth:", averageGrowth);

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
              <p className="text-gray-600">Overview of all clients, tables, and performance metrics</p>
            </div>
          </div>

          <DashboardRefreshButton />
        </div>

        {/* Key Metrics Cards */}
        <KeyMetricsCards
          totalClients={totalClientsCount}
          totalTables={totalTablesCount}
          totalRecords={totalTableRecordsCount}
          todaysLeads={todaysLeadsCount}
          yesterdayLeads={yesterdayLeadsCount}
          thisWeekLeads={thisWeekLeadsCount}
          lastWeekLeads={lastWeekLeadsCount}
          thisMonthLeads={thisMonthLeadsCount}
          lastMonthLeads={lastMonthLeadsCount}
        />

        {/* Placeholder for other components - uncomment when ready */}

        {/* <PerformanceMetrics
        totalRecords={totalTableRecordsCount}
        totalTables={10}
        aggregatedStats={{
          today: todaysLeadsCount,
          yesterday: yesterdayLeadsCount,
          thisMonth: thisMonthLeadsCount,
          lastMonth: lastMonthLeadsCount,
        }}
        totalClients={totalClientsCount}
      /> */}

        <Suspense fallback={<TopPerformingTablesSkeleton />}>
          <TopPerformingTablesClient initialTableCounts={tableCounts} initialTotalLeads={totalLeads} initialAverageGrowth={averageGrowth} />
        </Suspense>
        {/* 
      <ClientStatusOverview clients={[]} />
      */}
      </div>
    );
}

// Skeleton for TopPerformingTables
function TopPerformingTablesSkeleton() {
  return (
    <div className="w-full border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 rounded-lg p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-8" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-2 w-48" />
            </div>
            <div className="text-right">
              <Skeleton className="h-10 w-20 mb-2" />
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="w-8 h-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

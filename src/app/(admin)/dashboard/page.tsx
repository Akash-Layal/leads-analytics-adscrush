import { DashboardClient } from "@/components/dashboard";
import { CacheRefreshButton } from "@/components/shared/cache-refresh-button";
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
          <CacheRefreshButton />
        </div>
        
        <div className="text-center py-12">
          <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Activity className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Dashboard</h3>
          <p className="text-sm text-gray-500 mb-4">There was an error loading the dashboard data. Please try refreshing the page.</p>
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

          <CacheRefreshButton />
        </div>

        {/* Dashboard Content */}
        <DashboardClient
          initialData={{
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
            averageGrowth,
          }}
        />
      </div>
    );
}


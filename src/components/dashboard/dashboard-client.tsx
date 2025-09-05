'use client';

import React from 'react';
import { KeyMetricsCards } from './key-metrics-cards';
import { KeyMetricsCardsSkeleton } from './key-metrics-cards-skeleton';
import { TopPerformingTables } from './top-performing-tables-simplified';
import { useDashboardData, type DashboardData } from '@/hooks/use-dashboard-data';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardClientProps {
  initialData: DashboardData;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const { data, isLoading, error, refresh, isRefreshing, isDateChanging } = useDashboardData({
    initialData,
    autoRefresh: true,
  });

  const [searchQuery, setSearchQuery] = React.useState("");
  const [isCacheRefreshing, setIsCacheRefreshing] = React.useState(false);

  const currentData = data || initialData;

  // Handle date range changes
  const handleDateRangeChange = React.useCallback((from?: Date, to?: Date) => {
    // The date range change will be handled by the URL search params
    // which will trigger the useDashboardData hook to refetch data
    console.log('Date range changed:', { from, to });
  }, []);

  // Listen for cache refresh events
  React.useEffect(() => {
    const handleCacheRefreshStart = () => {
      setIsCacheRefreshing(true);
    };

    const handleCacheRefreshComplete = () => {
      setIsCacheRefreshing(false);
    };

    const handleCacheRefreshError = () => {
      setIsCacheRefreshing(false);
    };

    window.addEventListener('cache-refresh-start', handleCacheRefreshStart);
    window.addEventListener('cache-refreshed', handleCacheRefreshComplete);
    window.addEventListener('cache-refresh-error', handleCacheRefreshError);

    return () => {
      window.removeEventListener('cache-refresh-start', handleCacheRefreshStart);
      window.removeEventListener('cache-refreshed', handleCacheRefreshComplete);
      window.removeEventListener('cache-refresh-error', handleCacheRefreshError);
    };
  }, []);

  // Show error state
  if (error && !data) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load dashboard data: {error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isRefreshing}
              className="ml-4"
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Retry
            </Button>
          </AlertDescription>
        </Alert>
        
        {/* Additional help for database errors */}
        {error.includes('TableMapping') && (
          <Alert variant="default" className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Database Issue:</strong> The TableMapping table is missing. Please check your database schema or run migrations.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="relative">
        {(isLoading && !data) || isCacheRefreshing ? (
          <KeyMetricsCardsSkeleton isDateChanging={isDateChanging} isCacheRefreshing={isCacheRefreshing} />
        ) : (
          <KeyMetricsCards
            totalClients={currentData.totalClientsCount}
            totalRecords={currentData.totalTableRecordsCount}
            totalTables={currentData.totalTablesCount}
            todaysLeads={currentData.todaysLeadsCount}
            yesterdayLeads={currentData.yesterdayLeadsCount}
            thisWeekLeads={currentData.thisWeekLeadsCount}
            lastWeekLeads={currentData.lastWeekLeadsCount}
            thisMonthLeads={currentData.thisMonthLeadsCount}
            lastMonthLeads={currentData.lastMonthLeadsCount}
          />
        )}
      </div>

      {/* Top Performing Tables */}
      <TopPerformingTables
        tableCounts={currentData.tableCounts}
        totalLeads={currentData.totalLeads}
        averageGrowth={currentData.averageGrowth}
        isLoading={isRefreshing || isDateChanging || isCacheRefreshing}
        isCacheRefreshing={isCacheRefreshing}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onDateRangeChange={handleDateRangeChange}
      />

      {/* Show subtle error message if there's an error but we have cached data */}
      {error && data && (
        <Alert variant="default" className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Using cached data. Latest refresh failed: {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

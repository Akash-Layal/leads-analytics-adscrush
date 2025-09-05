'use client';

import { useState } from "react";
import { CacheRefreshButton } from "@/components/shared";
import { getAllTableCountsAction, getAllTableStatsAction, getTotalCountAction } from "@/lib/actions-analytics";
import { getTableDisplayName } from "@/lib/table-utils";

interface TableCount {
  tableName: string;
  customTableName?: string | null;
  count: number;
}

interface TableStat {
  tableName: string;
  customTableName?: string | null;
  count: number;
  sizeMB: number;
}

interface AnalyticsPageClientProps {
  initialTableCounts: TableCount[];
  initialTotalCount: number;
  initialTableStats: TableStat[];
}

export function AnalyticsPageClient({ 
  initialTableCounts, 
  initialTotalCount, 
  initialTableStats 
}: AnalyticsPageClientProps) {
  const [tableCounts, setTableCounts] = useState<TableCount[]>(initialTableCounts);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount);
  const [tableStats, setTableStats] = useState<TableStat[]>(initialTableStats);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const [tableCountsResult, totalCountResult, tableStatsResult] = await Promise.all([
        getAllTableCountsAction(),
        getTotalCountAction(),
        getAllTableStatsAction()
      ]);

      if (tableCountsResult.success) {
        setTableCounts(tableCountsResult.counts);
      }
      if (totalCountResult.success) {
        setTotalCount(totalCountResult.total);
      }
      if (tableStatsResult.success) {
        setTableStats(tableStatsResult.stats);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <main className="flex-1 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <CacheRefreshButton onRefresh={handleRefresh} />
      </div>

      {/* Total Count Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Total Records</h2>
        <p className="text-4xl font-bold text-blue-600">
          {isRefreshing ? '...' : totalCount.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600 mt-2">Across {tableCounts.length} tables</p>
      </div>

      {/* Table Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Table Counts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Table Records</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {isRefreshing ? (
              <div className="text-center py-8 text-gray-500">Refreshing...</div>
            ) : (
              tableCounts.map(({ tableName, customTableName, count }) => (
                <div key={tableName} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">{getTableDisplayName(tableName, customTableName || null)}</span>
                  <span className="font-bold text-green-600">{count.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Table Sizes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Table Sizes</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {isRefreshing ? (
              <div className="text-center py-8 text-gray-500">Refreshing...</div>
            ) : (
              tableStats.map(({ tableName, customTableName, sizeMB }) => (
                <div key={tableName} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">{getTableDisplayName(tableName, customTableName || null)}</span>
                  <span className="font-bold text-blue-600">{sizeMB.toFixed(2)} MB</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Average Records per Table</h3>
          <p className="text-3xl font-bold text-purple-600">
            {tableCounts.length > 0 ? Math.round(totalCount / tableCounts.length).toLocaleString() : 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Total Table Size</h3>
          <p className="text-3xl font-bold text-orange-600">
            {tableStats.reduce((total, stat) => total + stat.sizeMB, 0).toFixed(2)} MB
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Active Tables</h3>
          <p className="text-3xl font-bold text-green-600">{tableCounts.length}</p>
        </div>
      </div>
    </main>
  );
}

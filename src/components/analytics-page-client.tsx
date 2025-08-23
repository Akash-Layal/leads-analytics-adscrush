'use client';

import { useState } from 'react';
import { getAllTableCounts, getTotalCount, getTableStats } from '@/lib/table-counts';
import { CacheRefreshButton } from './cache-refresh-button';

interface TableCount {
  tableName: string;
  count: number;
}

interface TableStat {
  tableName: string;
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
  const [tableCounts, setTableCounts] = useState(initialTableCounts);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [tableStats, setTableStats] = useState(initialTableStats);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Fetch fresh data
      const [newTableCounts, newTotalCount, newTableStats] = await Promise.all([
        getAllTableCounts(),
        getTotalCount(),
        getTableStats()
      ]);

      // Update state with fresh data
      setTableCounts(newTableCounts);
      setTotalCount(newTotalCount);
      setTableStats(newTableStats);
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
              tableCounts.map(({ tableName, count }) => (
                <div key={tableName} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">{tableName}</span>
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
              tableStats.map(({ tableName, sizeMB }) => (
                <div key={tableName} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">{tableName}</span>
                  <span className="font-bold text-purple-600">{sizeMB} MB</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Total Tables</h3>
          <p className="text-2xl font-bold text-indigo-600">
            {isRefreshing ? '...' : tableCounts.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Total Size</h3>
          <p className="text-2xl font-bold text-orange-600">
            {isRefreshing ? '...' : tableStats.reduce((total, { sizeMB }) => total + sizeMB, 0).toFixed(2)} MB
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Avg Records/Table</h3>
          <p className="text-2xl font-bold text-teal-600">
            {isRefreshing ? '...' : (tableCounts.length > 0 ? Math.round(totalCount / tableCounts.length).toLocaleString() : 0)}
          </p>
        </div>
      </div>
    </main>
  );
}

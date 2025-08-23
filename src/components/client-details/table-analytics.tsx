"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Calendar } from "lucide-react";

type TableCount = {
  tableName: string;
  count: number;
};

type TableDailyStats = {
  tableName: string;
  today: number;
  yesterday: number;
  thisMonth: number;
  lastMonth: number;
  totalRecords: number;
  hasData: boolean;
};

interface TableAnalyticsProps {
  tableCounts: TableCount[];
  dailyStats: TableDailyStats[];
  selectedTable: string | null;
}

export function TableAnalytics({ tableCounts, dailyStats, selectedTable }: TableAnalyticsProps) {
  const getSelectedTableStats = () => {
    if (!selectedTable) return null;
    return dailyStats.find(s => s.tableName === selectedTable);
  };

  const getAggregatedStats = () => {
    return {
      today: dailyStats.reduce((sum, table) => sum + table.today, 0),
      yesterday: dailyStats.reduce((sum, table) => sum + table.yesterday, 0),
      thisMonth: dailyStats.reduce((sum, table) => sum + table.thisMonth, 0),
      lastMonth: dailyStats.reduce((sum, table) => sum + table.lastMonth, 0),
      totalRecords: dailyStats.reduce((sum, table) => sum + table.totalRecords, 0),
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Table Counts Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Table Record Counts
          </CardTitle>
          <CardDescription>
            Number of records in each assigned table
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tableCounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No data available
            </div>
          ) : (
            <div className="space-y-4">
              {tableCounts.map((table) => (
                <div key={table.tableName} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-sm">{table.tableName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{table.count.toLocaleString()}</span>
                    <span className="text-xs text-gray-500">records</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Stats
          </CardTitle>
          <CardDescription>
            Record counts over the last 30 days for {selectedTable ? 'a specific table' : 'all tables'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dailyStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No daily stats available
            </div>
          ) : !selectedTable ? (
            <div className="space-y-4">
              {(() => {
                const stats = getAggregatedStats();
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Today (All Tables)</span>
                      <span className="text-2xl font-bold">{stats.today.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Yesterday (All Tables)</span>
                      <span className="text-2xl font-bold">{stats.yesterday.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">This Month (All Tables)</span>
                      <span className="text-2xl font-bold">{stats.thisMonth.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Last Month (All Tables)</span>
                      <span className="text-2xl font-bold">{stats.lastMonth.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Total Records (All Tables)</span>
                      <span className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="space-y-4">
              {(() => {
                const stats = getSelectedTableStats();
                if (!stats) return null;
                
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Today</span>
                      <span className="text-2xl font-bold">{stats.today.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Yesterday</span>
                      <span className="text-2xl font-bold">{stats.yesterday.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">This Month</span>
                      <span className="text-2xl font-bold">{stats.thisMonth.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Last Month</span>
                      <span className="text-2xl font-bold">{stats.lastMonth.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Total Records</span>
                      <span className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

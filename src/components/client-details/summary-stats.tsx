"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

type TableDailyStats = {
  tableName: string;
  today: number;
  yesterday: number;
  thisMonth: number;
  lastMonth: number;
  totalRecords: number;
  hasData: boolean;
};

interface SummaryStatsProps {
  dailyStats: TableDailyStats[];
  selectedTable: string | null;
}

export function SummaryStats({ dailyStats, selectedTable }: SummaryStatsProps) {
  if (dailyStats.length === 0) {
    return null;
  }

  // Filter data based on selectedTable
  let filteredStats = dailyStats;
  let title = "Summary Stats (All Tables)";
  let description = "Aggregated statistics across all assigned tables";

  if (selectedTable) {
    // Show data for specific table
    filteredStats = dailyStats.filter(s => s.tableName === selectedTable);
    title = `Summary Stats (${selectedTable})`;
    description = `Statistics for the selected table`;
  }

  const totalToday = filteredStats.reduce((sum, table) => sum + table.today, 0);
  const totalYesterday = filteredStats.reduce((sum, table) => sum + table.yesterday, 0);
  const totalThisMonth = filteredStats.reduce((sum, table) => sum + table.thisMonth, 0);
  const totalLastMonth = filteredStats.reduce((sum, table) => sum + table.lastMonth, 0);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totalToday.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Today</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {totalYesterday.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Yesterday</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalThisMonth.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">This Month</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {totalLastMonth.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Last Month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

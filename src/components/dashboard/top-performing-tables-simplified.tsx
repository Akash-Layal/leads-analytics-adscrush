"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Download, Loader2, Search, Target, TrendingDown, TrendingUp, Trophy, Zap } from "lucide-react";
import React from "react";
import { CalendarDateRangePicker } from "../shared/date-range-picker";
import Image from "next/image";
import { Button } from "../ui/button";

// ---- Types ----
type TableCount = {
  tableName: string;
  displayName: string;
  imageUrl: string | null;
  count: number;
  previousCount?: number;
  target?: number;
};

interface TopPerformingTablesProps {
  tableCounts: TableCount[];
  totalLeads?: number;
  averageGrowth?: number;
  isLoading?: boolean;
  isDateChanging?: boolean;
  isCacheRefreshing?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onDateRangeChange?: (from?: Date, to?: Date) => void;
}

// ---- Loading Skeleton Component ----
function TopPerformingTablesSkeleton({ isCacheRefreshing = false }: { isCacheRefreshing?: boolean } = {}) {
  return (
    <Card className="w-full border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/30">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">All Products Performance</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Track all your lead sources and their performance</p>
            </div>
          </div>
        </div>
        {isCacheRefreshing && (
          <div className="mt-4">
            <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Refreshing cache...
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
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
      </CardContent>
    </Card>
  );
}

// ---- Helper Functions ----
function calculateGrowthPercentage(current: number, previous: number): number {
  if (isNaN(current) || isNaN(previous) || current === undefined || previous === undefined) {
    return 0;
  }

  if (previous <= 0) {
    if (current > 0) return 100; // new growth from 0
    return 0; // no change
  }

  // If dropped completely to zero, return -100 (full decline)
  if (current === 0) {
    return -100;
  }

  const growth = ((current - previous) / previous) * 100;

  if (isNaN(growth) || !isFinite(growth)) return 0;

  // Cap extreme upward spikes
  if (growth > 1000) return 1000;

  return growth;
}

function formatNumber(num: number): string {
  if (isNaN(num) || num === undefined || num === null) {
    return "0";
  }
  return num.toLocaleString();
}

function formatGrowthText(growth: number): string {
  if (growth === -100) return "100% decline";
  if (growth > 0) return `+${growth.toFixed(1)}% growth`;
  if (growth < 0) return `${growth.toFixed(1)}% decline`;
  return "0.0%";
}

// ---- Main Component ----
export function TopPerformingTables({
  tableCounts = [],
  totalLeads = 0,
  averageGrowth = 0,
  isLoading = false,
  isDateChanging = false,
  isCacheRefreshing = false,
  searchQuery = "",
  onSearchChange,
  onDateRangeChange,
}: TopPerformingTablesProps) {
  const filteredAndSortedTables = React.useMemo(() => {
    let filtered = tableCounts;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = tableCounts.filter((table) => table.displayName.toLowerCase().includes(query) || table.tableName.toLowerCase().includes(query));
    }
    return filtered.sort((a, b) => b.count - a.count);
  }, [tableCounts, searchQuery]);

  const sortedTables = filteredAndSortedTables;

  if (isLoading) {
    return <TopPerformingTablesSkeleton isCacheRefreshing={isCacheRefreshing} />;
  }

  const topPerformer = sortedTables[0];
  const topPerformerGrowth =
    topPerformer?.previousCount !== undefined && topPerformer?.previousCount !== null ? calculateGrowthPercentage(topPerformer.count, topPerformer.previousCount) : 0;

  const calculatedTotalLeads = totalLeads || sortedTables.reduce((sum, table) => sum + table.count, 0);

  const topPerformerMarketShare = calculatedTotalLeads > 0 ? ((topPerformer?.count || 0) / calculatedTotalLeads) * 100 : 0;


  const exportData = () => {
    // Helper function to escape CSV values
    const escapeCsvValue = (value: string | number | null | undefined): string => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // If the value contains comma, newline, or quote, wrap it in quotes and escape internal quotes
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Prepare CSV headers
    const headers = [
      'Table Name',
      'Product Name', 
      'Leads Count',
      'Percentage',
      'Growth',
      'Previous Count',
      'Target'
    ];

    // Prepare CSV rows
    const rows = sortedTables.map((table) => {
      const growth = calculateGrowthPercentage(table.count, table.previousCount || 0);
      const percentage = calculatedTotalLeads > 0 ? (table.count / calculatedTotalLeads) * 100 : 0;
      
      return [
        escapeCsvValue(table.tableName),
        escapeCsvValue(table.displayName),
        escapeCsvValue(table.count),
        escapeCsvValue(`${percentage.toFixed(1)}%`),
        escapeCsvValue(`${growth.toFixed(1)}%`),
        escapeCsvValue(table.previousCount || 0),
        escapeCsvValue(table.target || 'N/A')
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `top-performing-tables-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full shadow-lg bg-gradient-to-br from-white to-gray-50/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 w-full">
            <div className="p-2 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex items-center gap-3 justify-between w-full">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">All Products Performance</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Track all your lead sources and their performance</p>
              </div>
              <Button size="sm" variant="outline" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Search and Date Filter Controls */}
      <div className="px-6 pb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Search products by name..." value={searchQuery} onChange={(e) => onSearchChange?.(e.target.value)} className="pl-10" />
          </div>
          <CalendarDateRangePicker onDateRangeChange={onDateRangeChange} className="w-full sm:w-auto" />
        </div>
      </div>

      {isDateChanging && (
        <div className="px-6 pb-4">
          <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading new data for selected date range...
          </div>
        </div>
      )}

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Total Leads</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(calculatedTotalLeads)}</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Avg Growth</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {isNaN(averageGrowth) || averageGrowth === undefined || averageGrowth === null ? "0.0" : Number(averageGrowth).toFixed(1)}%
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Active Products</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{sortedTables.length}</div>
          </div>
        </div>

        {/* Top Performer Highlight */}
        {topPerformer && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-full">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex items-center gap-3">
                {topPerformer.imageUrl ? (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    <Image
                      src={topPerformer.imageUrl}
                      alt={topPerformer.displayName}
                      width={200}
                      height={200}
                      className="rounded-lg object-contain aspect-square"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">Top Performer</h3>
                  <p className="text-sm text-gray-600">{topPerformer.displayName}</p>
                </div>
              </div>
              <Badge variant="secondary" className="ml-auto">
                #{1}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{formatNumber(topPerformer.count)}</div>
                <p className="text-sm text-gray-600 mb-4">Total leads generated</p>
                <div className="flex items-center gap-2">
                  {topPerformerGrowth < 0 ? <TrendingDown className="w-4 h-4 text-red-600" /> : <TrendingUp className="w-4 h-4 text-green-600" />}
                  <span className={`text-sm font-medium ${topPerformerGrowth < 0 ? "text-red-600" : topPerformerGrowth > 0 ? "text-green-600" : "text-gray-600"}`}>
                    {formatGrowthText(topPerformerGrowth)}
                  </span>
                </div>
                <Progress value={Math.min((topPerformer.count / calculatedTotalLeads) * 100, 100)} className="mt-2 h-2" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-600 mb-2">
                  {isNaN(topPerformerMarketShare) || topPerformerMarketShare === undefined || topPerformerMarketShare === null ? "0.0" : Number(topPerformerMarketShare).toFixed(1)}
                  %
                </div>
                <p className="text-sm text-gray-600 mb-1">of total leads</p>
                <p className="text-xs text-gray-500">Market share</p>
              </div>
            </div>
          </div>
        )}

        {/* Table List */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-gray-600" />
            <h3 className="font-semibold text-gray-900">All Products ({sortedTables.length})</h3>
          </div>
          <div className="space-y-3">
            {sortedTables.map((table, index) => {
              const growth = table.previousCount !== undefined && table.previousCount !== null ? calculateGrowthPercentage(table.count, table.previousCount) : 0;
              const percentage = calculatedTotalLeads > 0 ? (table.count / calculatedTotalLeads) * 100 : 0;

              return (
                <div key={table.tableName} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700">#{index + 1}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {table.imageUrl ? (
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                          <Image
                            src={table.imageUrl}
                            alt={table.displayName}
                            width={200}
                            height={200}
                            className="rounded-lg object-contain aspect-square"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{table.displayName}</h4>
                        <p className="text-sm text-gray-500">{table.tableName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        {growth < 0 ? <TrendingDown className="w-4 h-4 text-red-600" /> : growth > 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : null}
                        <span className="text-lg font-bold text-gray-900">{formatNumber(table.count)}</span>
                        <Badge
                          variant={growth > 0 ? "default" : growth < 0 ? "destructive" : "secondary"}
                          className={`text-xs ${growth > 0 ? "bg-green-200 text-green-800" : growth < 0 ? "bg-red-200 text-red-800" : "bg-gray-200 text-gray-700"}`}
                        >
                          {formatGrowthText(growth)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {isNaN(percentage) || percentage === undefined || percentage === null ? "0.0" : Number(percentage).toFixed(1)}% of total
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Download, Eye, Search, Target, TrendingUp, Trophy, X, Zap } from "lucide-react";
import React from "react";
import { CalendarDateRangePicker } from "../shared/date-range-picker";
import { getTableCountsWithDateRangeAction } from "@/lib/actions-analytics";
import { convertDateRangeToIST } from "@/lib/helpers/date";


// ---- Types ----
type TableCount = {
  tableName: string;
  displayName: string;
  count: number;
  previousCount?: number; // For growth calculation
  target?: number; // For target comparison
};

interface TopPerformingTablesProps {
  tableCounts: TableCount[];
  totalLeads?: number;
  averageGrowth?: number;
  isLoading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onDateRangeChange?: (from?: Date, to?: Date) => void;
}

// ---- Loading Skeleton Component ----
function TopPerformingTablesSkeleton() {
  return (
    <Card className="w-full border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/30">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Top Performing Products</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Track your best performing lead sources</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CalendarDateRangePicker onDateRangeChange={() => {}} />
            <Button variant="outline" size="sm" disabled className="border-gray-200">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-6">
          {/* Quick Stats Skeleton */}
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

          {/* Top Performer Highlight Skeleton */}
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

          {/* All Tables List Skeleton */}
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
      </CardContent>
    </Card>
  );
}

// ---- Client Wrapper Component ----
export function TopPerformingTablesClient({ 
  initialTableCounts, 
  initialTotalLeads = 0, 
  initialAverageGrowth = 0 
}: { 
  initialTableCounts: TableCount[];
  initialTotalLeads?: number;
  initialAverageGrowth?: number;
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [tableCounts, setTableCounts] = React.useState(initialTableCounts);
  const [totalLeads, setTotalLeads] = React.useState(initialTotalLeads);
  const [averageGrowth, setAverageGrowth] = React.useState(initialAverageGrowth);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Update data when initial props change (from server)
  React.useEffect(() => {
    setTableCounts(initialTableCounts);
    setTotalLeads(initialTotalLeads);
    setAverageGrowth(initialAverageGrowth);
    setIsInitialized(true);
  }, [initialTableCounts, initialTotalLeads, initialAverageGrowth]);

  // Handle date range changes using server action
  // Note: This could also be implemented using React.use for more advanced patterns
  const handleDateRangeChange = React.useCallback(async (from?: Date, to?: Date) => {
    if (!from || !to) {
      // Reset to initial data if no date range
      setTableCounts(initialTableCounts);
      setTotalLeads(initialTotalLeads);
      setAverageGrowth(initialAverageGrowth);
      return;
    }

    setIsLoading(true);
    
    try {
      // Convert dates to IST date strings using the helper function
      const { date_from, date_to } = convertDateRangeToIST({ from, to });
      
      console.log('Date range change - IST dates:', { date_from, date_to });
      
      // Use server action to fetch new data
      const result = await getTableCountsWithDateRangeAction(date_from || "", date_to || "");
      
      if (result.success) {
        setTableCounts(result.tableCounts || []);
        setTotalLeads(result.totalLeads || 0);
        setAverageGrowth(result.averageGrowth || 0);
      } else {
        console.error('Failed to fetch table counts:', result.error);
        // Fallback to initial data on error
        setTableCounts(initialTableCounts);
        setTotalLeads(initialTotalLeads);
        setAverageGrowth(initialAverageGrowth);
      }
    } catch (error) {
      console.error('Error fetching table counts:', error);
      // Fallback to initial data on error
      setTableCounts(initialTableCounts);
      setTotalLeads(initialTotalLeads);
      setAverageGrowth(initialAverageGrowth);
    } finally {
      setIsLoading(false);
    }
  }, [initialTableCounts, initialTotalLeads, initialAverageGrowth]);

  // Show skeleton while initializing or loading
  if (!isInitialized || isLoading) {
    return <TopPerformingTablesSkeleton />;
  }

  return (
    <TopPerformingTables 
      tableCounts={tableCounts}
      totalLeads={totalLeads}
      averageGrowth={averageGrowth}
      isLoading={isLoading}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onDateRangeChange={handleDateRangeChange}
    />
  );
}

// ---- Main Component ----
export function TopPerformingTables({ 
  tableCounts, 
  totalLeads = 0, 
  averageGrowth = 0, 
  isLoading = false,
  searchQuery = "",
  onSearchChange,
  onDateRangeChange
}: TopPerformingTablesProps) {
  // Show skeleton while loading
  if (isLoading) {
    return <TopPerformingTablesSkeleton />;
  }

  // ---- Filter Data by Search Query ----
  const getCurrentData = (): TableCount[] => {
    const data = tableCounts || [];
    
    if (!searchQuery.trim()) {
      return data;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return data.filter(table => 
      table.displayName.toLowerCase().includes(query) ||
      table.tableName.toLowerCase().includes(query)
    );
  };

  const getCurrentTopPerformer = (): TableCount | null => {
    const current = getCurrentData();
    return current.length > 0 ? current[0] : null;
  };

  // ---- Helper functions ----
  const calculateGrowth = (current: number, previous: number = 0): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getGrowthColor = (growth: number): string => {
    if (growth > 0) return "text-green-600";
    if (growth < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (growth < 0) return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
    return <BarChart3 className="w-4 h-4 text-gray-500" />;
  };

  const calculatePercentage = (count: number): number => {
    if (totalLeads === 0) return 0;
    return (count / totalLeads) * 100;
  };

  // ---- Render ----
  const currentData = getCurrentData();

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
      'Display Name', 
      'Leads Count',
      'Percentage',
      'Growth',
      'Previous Count',
      'Target'
    ];

    // Prepare CSV rows
    const rows = currentData.map((table) => {
      const growth = calculateGrowth(table.count, table.previousCount);
      const percentage = calculatePercentage(table.count);
      
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
  const topPerformer = getCurrentTopPerformer();

  return (
    <Card className="w-full border shadow-lg bg-gradient-to-br from-white to-gray-50/30">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Top Performing Products</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Track your best performing lead sources</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CalendarDateRangePicker onDateRangeChange={onDateRangeChange} />
            <Button variant="outline" size="sm" onClick={exportData} className="border-gray-200 hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex items-center gap-2 mt-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by product name..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange?.("")}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
          {searchQuery && (
            <div className="text-sm text-gray-500">
              {getCurrentData().length} of {tableCounts.length} products
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {topPerformer ? (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Total Leads</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{totalLeads.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Avg Growth</span>
                </div>
                <p className={`text-2xl font-bold ${getGrowthColor(averageGrowth)}`}>
                  {averageGrowth > 0 ? "+" : ""}
                  {averageGrowth.toFixed(1)}%
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Active Tables</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{currentData.length}</p>
              </div>
            </div>

            {/* Top Performer Highlight */}
            <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/60 border border-amber-200/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-50 rounded-full">
                  <Trophy className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Top Performer</h3>
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200/50">
                  #1
                </Badge>
                {topPerformer.previousCount && (
                  <Badge variant="outline" className={`${getGrowthColor(calculateGrowth(topPerformer.count, topPerformer.previousCount))}`}>
                    {calculateGrowth(topPerformer.count, topPerformer.previousCount) > 0 ? "+" : ""}
                    {calculateGrowth(topPerformer.count, topPerformer.previousCount).toFixed(1)}%
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{topPerformer.displayName}</p>
                  <p className="text-sm text-gray-600 mt-1">Lead source</p>
                  {topPerformer.target && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress to target</span>
                        <span className="font-medium">
                          {topPerformer.count}/{topPerformer.target}
                        </span>
                      </div>
                      <Progress value={(topPerformer.count / topPerformer.target) * 100} className="h-2" />
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-amber-600">{topPerformer.count.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">leads generated</p>
                  <p className="text-sm text-gray-500">{calculatePercentage(topPerformer.count).toFixed(1)}% of total</p>
                </div>
              </div>
            </div>

            {/* All Tables List */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">All Tables Performance</h3>
              </div>

              <div className="space-y-3">
                {currentData.map((table, index) => {
                  const growth = calculateGrowth(table.count, table.previousCount);
                  const percentage = calculatePercentage(table.count);

                  return (
                    <div key={table.tableName} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                          <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{table.displayName}</p>
                          <p className="text-sm text-gray-500">Table: {table.tableName}</p>
                          {table.target && (
                            <div className="mt-1">
                              <Progress value={(table.count / table.target) * 100} className="h-1 w-24" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            {getGrowthIcon(growth)}
                            <span className="text-lg font-semibold text-gray-900">{table.count.toLocaleString()}</span>
                            <Badge variant="outline" className="text-xs">
                              {percentage.toFixed(1)}%
                            </Badge>
                          </div>
                          {table.previousCount && (
                            <p className={`text-sm ${getGrowthColor(growth)}`}>
                              {growth > 0 ? "+" : ""}
                              {growth.toFixed(1)}% vs previous
                            </p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="p-1">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              {searchQuery ? (
                <Search className="w-8 h-8 text-gray-400" />
              ) : (
                <BarChart3 className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No Products Found" : "No Data Available"}
            </h3>
            <p className="text-sm text-gray-500">
              {searchQuery 
                ? `No products match "${searchQuery}". Try a different search term.`
                : "Select a different date range to view performance data."
              }
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSearchChange?.("")}
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

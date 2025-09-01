"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Users, HardDrive, Activity, TrendingUp, TrendingDown, Star, BarChart3 } from "lucide-react";
import { calculatePerformanceScore, getTrendIndicator } from "@/lib/utils/performance-calculator";

type TableDetail = {
  tableName: string;
  customTableName: string | null;
  totalLeads: number;
  sizeMB: number;
  hasData: boolean;
  estimatedDailyStats: {
    today: number;
    yesterday: number;
    thisMonth: number;
    lastMonth: number;
  };
};

interface TableDetailsProps {
  tableDetails: TableDetail[];
  summary: {
    totalTables: number;
    totalSizeMB: number;
    averageLeadsPerTable: number;
    tablesWithData: number;
    tablesWithoutData: number;
  };
}

export function TableDetails({ tableDetails, summary }: TableDetailsProps) {
  if (tableDetails.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Table Information
          </CardTitle>
          <CardDescription>
            No tables assigned to this client
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Tables</p>
                <p className="text-2xl font-bold">{summary.totalTables}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Leads/Table</p>
                <p className="text-2xl font-bold">{summary.averageLeadsPerTable.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Size</p>
                <p className="text-2xl font-bold">{summary.totalSizeMB.toFixed(1)} MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Tables</p>
                <p className="text-2xl font-bold">{summary.tablesWithData}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold">
                  {(() => {
                    if (tableDetails.length === 0) return 'N/A';
                    
                    const totalScore = tableDetails.reduce((sum, table) => {
                      const performanceMetrics = {
                        totalLeads: table.totalLeads,
                        todayLeads: table.estimatedDailyStats.today,
                        yesterdayLeads: table.estimatedDailyStats.yesterday,
                        thisMonthLeads: table.estimatedDailyStats.thisMonth,
                        lastMonthLeads: table.estimatedDailyStats.lastMonth,
                        sizeMB: table.sizeMB,
                        hasData: table.hasData
                      };
                      
                      const score = calculatePerformanceScore(performanceMetrics);
                      return sum + score.score;
                    }, 0);
                    
                    return Math.round(totalScore / tableDetails.length);
                  })()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold">{summary.tablesWithoutData}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}



        {/* Detailed Table List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Table Details
            </CardTitle>
            <CardDescription>
              Detailed information for each assigned table with custom names
            </CardDescription>
          </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tableDetails.map((table) => (
              <div key={table.tableName} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {table.customTableName || table.tableName}
                      </h3>
                      {table.customTableName && (
                        <p className="text-sm text-gray-500 font-mono">
                          {table.tableName}
                        </p>
                      )}
                    </div>
                    <Badge variant={table.hasData ? "default" : "secondary"}>
                      {table.hasData ? "Active" : "No Data"}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {table.totalLeads.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">Total Leads</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Size</p>
                    <p className="font-medium">{table.sizeMB.toFixed(1)} MB</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Today</p>
                    <p className="font-medium">{table.estimatedDailyStats.today.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Yesterday</p>
                    <p className="font-medium">{table.estimatedDailyStats.yesterday.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">This Month</p>
                    <p className="font-medium">{table.estimatedDailyStats.thisMonth.toLocaleString()}</p>
                  </div>
                </div>

                {/* Enhanced Performance Metrics */}
                <div className="mt-3 pt-3 border-t">
                  <div className="space-y-3">
                    {/* Performance Score */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Performance Score:</span>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const performanceMetrics = {
                            totalLeads: table.totalLeads,
                            todayLeads: table.estimatedDailyStats.today,
                            yesterdayLeads: table.estimatedDailyStats.yesterday,
                            thisMonthLeads: table.estimatedDailyStats.thisMonth,
                            lastMonthLeads: table.estimatedDailyStats.lastMonth,
                            sizeMB: table.sizeMB,
                            hasData: table.hasData
                          };
                          
                          const score = calculatePerformanceScore(performanceMetrics);
                          
                          return (
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className={score.badgeClass}>
                                {score.grade} - {score.label}
                              </Badge>
                              <span className="text-sm font-medium text-gray-700">
                                {score.score}/100
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    
                    {/* Growth Trend */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Growth Trend:</span>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const trend = getTrendIndicator(
                            table.estimatedDailyStats.today,
                            table.estimatedDailyStats.yesterday
                          );
                          
                          return (
                            <div className="flex items-center gap-1">
                              <span className="text-lg">{trend.icon}</span>
                              <span className={`text-sm font-medium ${trend.color}`}>
                                {trend.label}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    
                    {/* Performance Breakdown */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-gray-600" />
                        <span className="text-xs font-medium text-gray-700">Score Breakdown</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {(() => {
                          const performanceMetrics = {
                            totalLeads: table.totalLeads,
                            todayLeads: table.estimatedDailyStats.today,
                            yesterdayLeads: table.estimatedDailyStats.yesterday,
                            thisMonthLeads: table.estimatedDailyStats.thisMonth,
                            lastMonthLeads: table.estimatedDailyStats.lastMonth,
                            sizeMB: table.sizeMB,
                            hasData: table.hasData
                          };
                          
                          const score = calculatePerformanceScore(performanceMetrics);
                          
                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Volume:</span>
                                <span className="font-medium">{score.breakdown.leadVolume}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Growth:</span>
                                <span className="font-medium">{score.breakdown.growthRate}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Freshness:</span>
                                <span className="font-medium">{score.breakdown.dataFreshness}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Consistency:</span>
                                <span className="font-medium">{score.breakdown.consistency}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

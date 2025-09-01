"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Calendar, Clock, Database, Target, TrendingUp } from "lucide-react";

interface PerformanceMetricsProps {
  totalRecords: number;
  totalTables: number;
  aggregatedStats: {
    today: number;
    yesterday: number;
    thisMonth: number;
    lastMonth: number;
  };
  totalClients: number;
}

export function PerformanceMetrics({
  totalRecords,
  totalTables,
  aggregatedStats,
  totalClients
}: PerformanceMetricsProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Performance Overview</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* System Performance Metrics */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
              System Performance Metrics
            </CardTitle>
            <CardDescription>Key performance indicators across all tables and clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Records */}
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-700">{totalRecords.toLocaleString()}</div>
                <p className="text-sm font-medium text-blue-600">Total Leads</p>
                <p className="text-xs text-blue-500 mt-1">Across {totalTables} products</p>
              </div>

              {/* Today's Performance */}
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-green-700">{aggregatedStats.today.toLocaleString()}</div>
                <p className="text-sm font-medium text-green-600">Today&apos;s Leads</p>
                <p className="text-xs text-green-500 mt-1">New leads today</p>
              </div>

              {/* Monthly Growth */}
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-purple-700">{aggregatedStats.thisMonth.toLocaleString()}</div>
                <p className="text-sm font-medium text-purple-600">This Month</p>
                <p className="text-xs text-purple-500 mt-1">Total monthly leads</p>
              </div>

              {/* Client Efficiency */}
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-orange-700">{totalClients}</div>
                <p className="text-sm font-medium text-orange-600">Active Clients</p>
                <p className="text-xs text-orange-500 mt-1">Total clients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Quick Insights
            </CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Yesterday vs Today */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Yesterday</span>
                <span className="text-sm text-gray-500">{aggregatedStats.yesterday.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Today</span>
                <span className="text-sm text-gray-500">{aggregatedStats.today.toLocaleString()}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Change:</span>
                  {(() => {
                    const change = aggregatedStats.yesterday > 0 ? ((aggregatedStats.today - aggregatedStats.yesterday) / aggregatedStats.yesterday) * 100 : 0;
                    const isPositive = change >= 0;
                    return (
                      <span className={`text-xs font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                        {isPositive ? "+" : ""}
                        {change.toFixed(1)}%
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Monthly Comparison */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Last Month</span>
                <span className="text-sm text-gray-500">{aggregatedStats.lastMonth.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">This Month</span>
                <span className="text-sm text-gray-500">{aggregatedStats.thisMonth.toLocaleString()}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Growth:</span>
                  {(() => {
                    const growth = aggregatedStats.lastMonth > 0 ? ((aggregatedStats.thisMonth - aggregatedStats.lastMonth) / aggregatedStats.lastMonth) * 100 : 0;
                    const isPositive = growth >= 0;
                    return (
                      <span className={`text-xs font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                        {isPositive ? "+" : ""}
                        {growth.toFixed(1)}%
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">System Health</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="mt-2 text-xs text-gray-500">All systems operational</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, FileText } from "lucide-react";
import { useState } from "react";

interface TableCount {
  tableName: string;
  count: number;
}

interface TopPerformingTablesProps {
  tableCounts: TableCount[];
  todayTableCounts?: TableCount[]; // Optional today's data
  yesterdayTableCounts?: TableCount[]; // Optional yesterday's data
  last7DaysTableCounts?: TableCount[]; // Optional last 7 days data
}

export function TopPerformingTables({ tableCounts, todayTableCounts, yesterdayTableCounts, last7DaysTableCounts }: TopPerformingTablesProps) {
  const [timeRange, setTimeRange] = useState<"today" | "yesterday" | "last7Days" | "allTime">("today");

  const currentData = timeRange === "today" ? (todayTableCounts || []) : 
                     timeRange === "yesterday" ? (yesterdayTableCounts || []) : 
                     timeRange === "last7Days" ? (last7DaysTableCounts || []) :
                     tableCounts;
  const sortedTables = currentData
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const todayTopPerformer = todayTableCounts?.[0];
  const yesterdayTopPerformer = yesterdayTableCounts?.[0];
  const last7DaysTopPerformer = last7DaysTableCounts?.[0];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Top Performing Tables</h2>
        </div>
        
        <Select value={timeRange} onValueChange={(value: "today" | "yesterday" | "last7Days" | "allTime") => setTimeRange(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="last7Days">Last 7 Days</SelectItem>
            <SelectItem value="allTime">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Today's Top Performer Highlight */}
      {timeRange === "today" && todayTopPerformer && (
        <Card className="mb-6 border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-yellow-800">🥇 Today&apos;s Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
                <div>
                  <span className="font-bold text-lg text-yellow-800">{todayTopPerformer.tableName}</span>
                  <p className="text-sm text-yellow-700">Leading the charts today!</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-yellow-800">{todayTopPerformer.count.toLocaleString()}</span>
                <p className="text-sm text-yellow-700">Leads today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Yesterday's Top Performer Highlight */}
      {timeRange === "yesterday" && yesterdayTopPerformer && (
        <Card className="mb-6 border-2 border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-800">🥇 Yesterday&apos;s Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
                <div>
                  <span className="font-bold text-lg text-blue-800">{yesterdayTopPerformer.tableName}</span>
                  <p className="text-sm text-blue-700">Led the charts yesterday!</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-blue-800">{yesterdayTopPerformer.count.toLocaleString()}</span>
                <p className="text-sm text-blue-700">Leads yesterday</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last 7 Days Top Performer Highlight */}
      {timeRange === "last7Days" && last7DaysTopPerformer && (
        <Card className="mb-6 border-2 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-800">🥇 Last 7 Days Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
                <div>
                  <span className="font-bold text-lg text-green-800">{last7DaysTopPerformer.tableName}</span>
                  <p className="text-sm text-green-700">Leading the charts this week!</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-green-800">{last7DaysTopPerformer.count.toLocaleString()}</span>
                <p className="text-sm text-green-700">Leads this week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Table Performance Rankings
          </CardTitle>
          <CardDescription>Tables with the highest record counts</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedTables.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No data available</div>
          ) : (
            <div className="space-y-4">
              {sortedTables.map((table, index) => (
                <div key={table.tableName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-orange-500" : "bg-blue-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <span className="font-medium text-sm">{table.tableName}</span>
                      <p className="text-xs text-gray-500">
                        {index === 0 ? "🥇 Top Performer" : index === 1 ? "🥈 Second Place" : index === 2 ? "🥉 Third Place" : "Ranked"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{table.count.toLocaleString()}</span>
                    <span className="text-xs text-gray-500">Leads</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

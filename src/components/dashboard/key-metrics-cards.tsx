"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Database, FileText, Users, Calendar, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from "lucide-react";

interface KeyMetricsCardsProps {
  totalClients: number;
  totalRecords: number;
  totalTables: number;
  todaysLeads: number;
  yesterdayLeads: number;
  thisWeekLeads: number;
  lastWeekLeads: number;
  thisMonthLeads: number;
  lastMonthLeads: number;
}

// Helper function to calculate percentage change
function calculatePercentageChange(current: number, previous: number): { percentage: number; isPositive: boolean } {
  if (previous === 0) return { percentage: current > 0 ? 100 : 0, isPositive: current > 0 };
  const change = ((current - previous) / previous) * 100;
  return { percentage: Math.abs(change), isPositive: change >= 0 };
}

export function KeyMetricsCards({
  totalClients,
  totalRecords,
  totalTables,
  todaysLeads,
  yesterdayLeads,
  thisWeekLeads,
  lastWeekLeads,
  thisMonthLeads,
  lastMonthLeads,
}: KeyMetricsCardsProps) {
  // Calculate percentage changes
  const todayVsYesterday = calculatePercentageChange(todaysLeads, yesterdayLeads);
  const thisWeekVsLastWeek = calculatePercentageChange(thisWeekLeads, lastWeekLeads);
  const thisMonthVsLastMonth = calculatePercentageChange(thisMonthLeads, lastMonthLeads);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      {/* Total Clients */}
      <Card className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 border-slate-200/60 hover:border-blue-300/60 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Total Clients</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{totalClients}</div>
          <p className="text-xs text-slate-600">Registered clients</p>
        </CardContent>
      </Card>

      {/* Total Records */}
      <Card className="bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/40 border-slate-200/60 hover:border-green-300/60 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Total Records</CardTitle>
          <Database className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{totalRecords.toLocaleString()}</div>
          <p className="text-xs text-slate-600">Across all clients</p>
        </CardContent>
      </Card>

      {/* Today's Leads */}
      <Card className="bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/40 border-slate-200/60 hover:border-orange-300/60 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Today&apos;s Leads</CardTitle>
          <Clock className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{todaysLeads.toLocaleString()}</div>
          <div className="flex items-center gap-1 mt-1">
            {todayVsYesterday.isPositive ? <ArrowUp className="h-3 w-3 text-green-600" /> : <ArrowDown className="h-3 w-3 text-red-600" />}
            <p className={`text-xs ${todayVsYesterday.isPositive ? "text-green-600" : "text-red-600"}`}>
              {todayVsYesterday.percentage.toFixed(1)}% {todayVsYesterday.isPositive ? "more" : "less"} than yesterday
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Yesterday's Leads */}
      <Card className="bg-gradient-to-br from-slate-50 via-amber-50/30 to-yellow-50/40 border-slate-200/60 hover:border-amber-300/60 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Yesterday&apos;s Leads</CardTitle>
          <Clock className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{yesterdayLeads.toLocaleString()}</div>
          <p className="text-xs text-slate-600">Yesterday leads count</p>
        </CardContent>
      </Card>

      {/* This Week's Leads */}
      <Card className="bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40 border-slate-200/60 hover:border-teal-300/60 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">This Week&apos;s Leads</CardTitle>
          <TrendingUp className="h-4 w-4 text-teal-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{thisWeekLeads.toLocaleString()}</div>
          <div className="flex items-center gap-1 mt-1">
            {thisWeekVsLastWeek.isPositive ? <ArrowUp className="h-3 w-3 text-green-600" /> : <ArrowDown className="h-3 w-3 text-red-600" />}
            <p className={`text-xs ${thisWeekVsLastWeek.isPositive ? "text-green-600" : "text-red-600"}`}>
              {thisWeekVsLastWeek.percentage.toFixed(1)}% {thisWeekVsLastWeek.isPositive ? "more" : "less"} than last week
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Last Week's Leads */}
      <Card className="bg-gradient-to-br from-slate-50 via-cyan-50/30 to-sky-50/40 border-slate-200/60 hover:border-cyan-300/60 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Last Week&apos;s Leads</CardTitle>
          <TrendingUp className="h-4 w-4 text-cyan-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{lastWeekLeads.toLocaleString()}</div>
          <p className="text-xs text-slate-600">Last week total</p>
        </CardContent>
      </Card>

      {/* This Month's Leads */}
      <Card className="bg-gradient-to-br from-slate-50 via-rose-50/30 to-pink-50/40 border-slate-200/60 hover:border-rose-300/60 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">This Month&apos;s Leads</CardTitle>
          <Calendar className="h-4 w-4 text-rose-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{thisMonthLeads.toLocaleString()}</div>
          <div className="flex items-center gap-1 mt-1">
            {thisMonthVsLastMonth.isPositive ? <ArrowUp className="h-3 w-3 text-green-600" /> : <ArrowDown className="h-3 w-3 text-red-600" />}
            <p className={`text-xs ${thisMonthVsLastMonth.isPositive ? "text-green-600" : "text-red-600"}`}>
              {thisMonthVsLastMonth.percentage.toFixed(1)}% {thisMonthVsLastMonth.isPositive ? "more" : "less"} than last month
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Last Month's Leads */}
      <Card className="bg-gradient-to-br from-slate-50 via-pink-50/30 to-fuchsia-50/40 border-slate-200/60 hover:border-pink-300/60 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Last Month&apos;s Leads</CardTitle>
          <Calendar className="h-4 w-4 text-pink-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{lastMonthLeads.toLocaleString()}</div>
          <p className="text-xs text-slate-600">Last month total</p>
        </CardContent>
      </Card>

      {/* Product Mapped */}
      <Card className="bg-gradient-to-br from-slate-50 via-purple-50/30 to-violet-50/40 border-slate-200/60 hover:border-purple-300/60 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Products</CardTitle>
          <FileText className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{totalTables}</div>
          <p className="text-xs text-slate-600">Products mapped</p>
        </CardContent>
      </Card>
    </div>
  );
}

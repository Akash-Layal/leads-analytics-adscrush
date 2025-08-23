"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Database, FileText, Users } from "lucide-react";

interface KeyMetricsCardsProps {
  totalClients: number;
  totalRecords: number;
  totalTables: number;
  todaysLeads: number;
}

export function KeyMetricsCards({
  totalClients,
  totalRecords,
  totalTables,
  todaysLeads
}: KeyMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Clients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalClients}</div>
          <p className="text-xs text-muted-foreground">Registered clients</p>
        </CardContent>
      </Card>

      {/* Total Records */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRecords.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Across all tables</p>
        </CardContent>
      </Card>

      {/* Available Tables */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Tables</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTables}</div>
          <p className="text-xs text-muted-foreground">Read replica tables</p>
        </CardContent>
      </Card>

      {/* Today's Leads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today&apos;s Leads</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todaysLeads.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">New leads today</p>
        </CardContent>
      </Card>
    </div>
  );
}

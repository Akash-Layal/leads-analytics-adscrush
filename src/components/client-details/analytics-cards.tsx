"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Database, FileText, Users } from "lucide-react";

type AssignedTable = {
  xataId: string;
  tableName: string;
  customTableName: string | null;
  tableSchema: string;
  description: string | null;
  isActive: string;
  xataCreatedat: string;
};

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

interface AnalyticsCardsProps {
  client: {
    status: string;
    xataCreatedat: string;
  };
  assignedTables: AssignedTable[];
  tableCounts: TableCount[];
  totalCount: number;
  dailyStats: TableDailyStats[];
  selectedTable: string | null;
}

export function AnalyticsCards({ 
  client, 
  assignedTables, 
  tableCounts, 
  totalCount, 
  dailyStats, 
  selectedTable 
}: AnalyticsCardsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getTodayLeads = () => {
    if (dailyStats.length === 0) return '0';
    
    if (selectedTable) {
      const tableStats = dailyStats.find(s => s.tableName === selectedTable);
      return tableStats?.today.toLocaleString() || '0';
    } else {
      return dailyStats.reduce((sum, table) => sum + table.today, 0).toLocaleString();
    }
  };

  const getTodayLeadsLabel = () => {
    return `New leads today for ${selectedTable || 'all tables'}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCount.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Across {assignedTables.length} tables
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Assigned Tables</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{assignedTables.length}</div>
          <p className="text-xs text-muted-foreground">
            Active table mappings
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Client Status</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Badge className={getStatusColor(client.status)}>
            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">
            Since {formatDate(client.xataCreatedat)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today&apos;s Leads</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getTodayLeads()}</div>
          <p className="text-xs text-muted-foreground">
            {getTodayLeadsLabel()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

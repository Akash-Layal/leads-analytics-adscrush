"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TableSelector } from "./table-selector";
import { AnalyticsCards } from "./analytics-cards";
import { SummaryStats } from "./summary-stats";
import { TableAnalytics } from "./table-analytics";
import { ClientInfo } from "./client-info";

type Client = {
  xataId: string;
  name: string;
  email: string;
  phone: string | null;
  company: string;
  status: string;
  xataCreatedat: string;
  xataUpdatedat: string;
};

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

type ClientWithTables = Client & {
  assignedTables: AssignedTable[];
};

interface ClientDetailsContentProps {
  client: ClientWithTables;
  tableCounts: TableCount[];
  totalCount: number;
  dailyStats: TableDailyStats[];
}

export function ClientDetailsContent({ client, tableCounts, totalCount, dailyStats }: ClientDetailsContentProps) {
  const router = useRouter();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  // Set selected table when daily stats are loaded
  useEffect(() => {
    if (dailyStats.length > 0 && selectedTable === null) {
      // Default to "All Tables" (null) instead of auto-selecting a specific table
      // This allows users to see aggregated data for all tables by default
      setSelectedTable(null);
    }
  }, [dailyStats, selectedTable]);



  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.push("/clients")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-gray-600">{client.company}</p>
        </div>
      </div>

      {/* Table Selection Dropdown */}
      <TableSelector assignedTables={client.assignedTables} selectedTable={selectedTable} onTableChange={setSelectedTable} />

      {/* Analytics Cards */}
      <AnalyticsCards
        client={client}
        assignedTables={client.assignedTables}
        tableCounts={tableCounts}
        totalCount={totalCount}
        dailyStats={dailyStats}
        selectedTable={selectedTable}
      />

      {/* Summary Stats Card */}
      <SummaryStats dailyStats={dailyStats} selectedTable={selectedTable} />

      {/* Table Analytics and Client Info */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <TableAnalytics tableCounts={tableCounts} dailyStats={dailyStats} selectedTable={selectedTable} />
      </div>
      <ClientInfo client={client} />
    </div>
  );
}

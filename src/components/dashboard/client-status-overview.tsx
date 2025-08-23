"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, Zap } from "lucide-react";

interface Client {
  xataId: string;
  name: string;
  email: string;
  phone: string | null;
  company: string;
  status: string;
  xataCreatedat: string;
  xataUpdatedat: string;
}

interface ClientStatusOverviewProps {
  clients: Client[];
}

export function ClientStatusOverview({ clients }: ClientStatusOverviewProps) {
  const getStatusCounts = () => {
    const active = clients.filter((c) => c.status === "active").length;
    const inactive = clients.filter((c) => c.status === "inactive").length;
    const pending = clients.filter((c) => c.status === "pending").length;
    return { active, inactive, pending };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-900">Client Status Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Clients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{statusCounts.active}</div>
            <p className="text-xs text-muted-foreground">
              {clients.length > 0 ? Math.round((statusCounts.active / clients.length) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        {/* Pending Clients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Clients</CardTitle>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{statusCounts.pending}</div>
            <p className="text-xs text-muted-foreground">
              {clients.length > 0 ? Math.round((statusCounts.pending / clients.length) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        {/* Inactive Clients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Clients</CardTitle>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Zap className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{statusCounts.inactive}</div>
            <p className="text-xs text-muted-foreground">
              {clients.length > 0 ? Math.round((statusCounts.inactive / clients.length) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

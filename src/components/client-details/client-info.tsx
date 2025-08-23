"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface ClientInfoProps {
  client: {
    email: string;
    phone: string | null;
    company: string;
    status: string;
    xataCreatedat: string;
    xataUpdatedat: string;
  };
}

export function ClientInfo({ client }: ClientInfoProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Client Information
        </CardTitle>
        <CardDescription>
          Detailed client profile and contact information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <span className="text-sm text-gray-900">{client.email}</span>
          </div>
          {client.phone && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Phone</span>
              <span className="text-sm text-gray-900">{client.phone}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Company</span>
            <span className="text-sm text-gray-900">{client.company}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <Badge className={getStatusColor(client.status)}>
              {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Created</span>
            <span className="text-sm text-gray-900">{formatDate(client.xataCreatedat)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Last Updated</span>
            <span className="text-sm text-gray-900">{formatDate(client.xataUpdatedat)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

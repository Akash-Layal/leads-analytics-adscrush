"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { clearDashboardCacheAction } from "@/lib/actions-dashboard";

export function DashboardRefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      // Clear the cache first
      await clearDashboardCacheAction();
      // Refresh the page to get fresh data
      window.location.reload();
    } catch (error) {
      console.error("Failed to refresh dashboard:", error);
      setIsRefreshing(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="flex items-center gap-2">
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      {isRefreshing ? "Refreshing..." : "Refresh"}
    </Button>
  );
}

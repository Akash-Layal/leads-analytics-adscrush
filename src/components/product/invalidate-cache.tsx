"use client";
import { IconRefresh } from "@tabler/icons-react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { invalidateTableMappingCachesAction } from "@/lib/actions-table-mappings";
import { useRouter } from "next/navigation";

const InvalidateTableMappingCache = () => {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const handleRefreshCache = async () => {
    setRefreshing(true);
    try {
      // Clear all table mapping caches
      await invalidateTableMappingCachesAction();
      router.refresh();
    } catch (error) {
      console.error("Error refreshing cache:", error);
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <Button variant="outline" size="sm" onClick={handleRefreshCache} disabled={refreshing} className="flex items-center gap-2">
      <IconRefresh className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
      {refreshing ? "Refreshing..." : "Refresh Cache"}
    </Button>
  );
};

export default InvalidateTableMappingCache;

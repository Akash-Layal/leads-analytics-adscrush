'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { getDashboardDataAction } from '@/lib/actions-dashboard-data';
import { parseDateParamsToIST } from '@/lib/helpers/date';

export interface DashboardData {
  totalClientsCount: number;
  totalTablesCount: number;
  totalTableRecordsCount: number;
  todaysLeadsCount: number;
  yesterdayLeadsCount: number;
  thisWeekLeadsCount: number;
  lastWeekLeadsCount: number;
  thisMonthLeadsCount: number;
  lastMonthLeadsCount: number;
  tableCounts: Array<{
    tableName: string;
    displayName: string;
    imageUrl: string;
    count: number;
    previousCount: number;
  }>;
  totalLeads: number;
  averageGrowth: number;
}

interface UseDashboardDataOptions {
  initialData?: Partial<DashboardData>;
  autoRefresh?: boolean;
}

interface UseDashboardDataReturn {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
  isDateChanging: boolean;
}

export function useDashboardData(options: UseDashboardDataOptions = {}): UseDashboardDataReturn {
  const { initialData, autoRefresh = true } = options;
  const searchParams = useSearchParams();
  
  const [data, setData] = useState<DashboardData | null>(initialData as DashboardData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDateChanging, setIsDateChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize date range to prevent unnecessary re-fetches
  const dateRange = useMemo(() => {
    const dateParam = searchParams.get('date');
    return parseDateParamsToIST(dateParam || undefined);
  }, [searchParams]);

  // Function to fetch data
  const fetchData = useCallback(async (isRefresh = false, isDateChange = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else if (isDateChange) {
      setIsDateChanging(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const result = await getDashboardDataAction(dateRange.date_from, dateRange.date_to);
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsDateChanging(false);
    }
  }, [dateRange.date_from, dateRange.date_to]);

  // Manual refresh function
  const refresh = useCallback(() => fetchData(true), [fetchData]);

  // Listen for cache refresh events
  useEffect(() => {
    if (!autoRefresh) return;

    const handleCacheRefresh = () => {
      // Small delay to ensure cache is cleared
      setTimeout(() => {
        refresh();
      }, 100);
    };

    window.addEventListener('cache-refreshed', handleCacheRefresh);
    
    return () => {
      window.removeEventListener('cache-refreshed', handleCacheRefresh);
    };
  }, [refresh, autoRefresh]);

  // Auto-refresh when date range changes
  useEffect(() => {
    if (autoRefresh && data) {
      fetchData(false, true); // isDateChange = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.date_from, dateRange.date_to, autoRefresh]); // fetchData intentionally excluded to prevent infinite loop

  return {
    data,
    isLoading,
    error,
    refresh,
    isRefreshing,
    isDateChanging,
  };
}

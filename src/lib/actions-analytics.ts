'use server';

import {
  getAllTableCounts as getAllTableCountsService,
  getTotalCount as getTotalCountService,
  getAllTableStats as getAllTableStatsService
} from '@/lib/services/analytics.service';
import { getTableWiseCountsWithGrowth } from './services/leadService';

export async function getAllTableCountsAction() {
  try {
    return await getAllTableCountsService();
  } catch (error) {
    console.error('Error in getAllTableCountsAction:', error);
    return {
      success: false,
      error: 'Failed to fetch table counts',
      counts: []
    };
  }
}

export async function getTotalCountAction() {
  try {
    return await getTotalCountService();
  } catch (error) {
    console.error('Error in getTotalCountAction:', error);
    return {
      success: false,
      error: 'Failed to fetch total count',
      total: 0
    };
  }
}

export async function getAllTableStatsAction() {
  try {
    return await getAllTableStatsService();
  } catch (error) {
    console.error('Error in getAllTableStatsAction:', error);
    return {
      success: false,
      error: 'Failed to fetch table stats',
      stats: []
    };
  }
}

export async function getTableCountsWithDateRangeAction(date_from: string | Date, date_to: string | Date) {
  try {
    // Fetch table counts with growth data
    const tableCounts = await getTableWiseCountsWithGrowth(date_from?.toString(), date_to?.toString());

    // Calculate total leads and average growth for the selected period
    const totalLeads = tableCounts.reduce((sum, table) => sum + table.count, 0);

    const averageGrowth =
      tableCounts.length > 0
        ? tableCounts.reduce((sum, table) => {
          const growth = table.previousCount && table.previousCount > 0
            ? ((table.count - table.previousCount) / table.previousCount) * 100
            : 0;
          return sum + growth;
        }, 0) / tableCounts.length
        : 0;

    return {
      success: true,
      tableCounts,
      totalLeads,
      averageGrowth,
    };
  } catch (error) {
    console.error("Error fetching table counts:", error);
    return {
      success: false,
      error: "Failed to fetch table counts",
      tableCounts: [],
      totalLeads: 0,
      averageGrowth: 0,
    };
  }
}

'use server';

import { getAllTableCounts, getTotalCount, getAllTableStats } from './services/analytics.service';

export async function getTableCountsAction() {
  try {
    const [tableCountsResult, totalCountResult, tableStatsResult] = await Promise.all([
      getAllTableCounts(),
      getTotalCount(),
      getAllTableStats()
    ]);

    // Check if all operations were successful
    if (!tableCountsResult.success || !totalCountResult.success || !tableStatsResult.success) {
      return {
        success: false,
        error: 'One or more data fetch operations failed'
      };
    }

    const { counts: tableCounts } = tableCountsResult;
    const { total: totalCount } = totalCountResult;
    const { stats: tableStats } = tableStatsResult;

    return {
      success: true,
      data: {
        totalCount,
        tableCounts,
        tableStats,
        summary: {
          totalTables: tableCounts.length,
          totalSize: tableStats.reduce((total: number, { sizeMB }: { sizeMB: number }) => total + sizeMB, 0),
          averageRecordsPerTable: tableCounts.length > 0 ? Math.round(totalCount / tableCounts.length) : 0
        }
      }
    };
  } catch (error) {
    console.error('Error fetching table counts:', error);
    return {
      success: false,
      error: 'Failed to fetch table counts'
    };
  }
}

export async function getTableCountAction(tableName: string) {
  try {
    const { getTableCount } = await import('./services/analytics.service');
    const result = await getTableCount(tableName);
    if (result.success) {
      return { success: true, count: result.count };
    } else {
      return { success: false, error: result.error || 'Failed to get table count' };
    }
  } catch (error) {
    console.error(`Error counting table ${tableName}:`, error);
    return { success: false, error: 'Failed to get table count' };
  }
}

export async function getTableNamesAction() {
  try {
    const { getAllTableNames } = await import('./services/analytics.service');
    const result = await getAllTableNames();
    if (result.success) {
      return { success: true, tableNames: result.tableNames };
    } else {
      return { success: false, error: result.error || 'Failed to get table names' };
    }
  } catch (error) {
    console.error('Error fetching table names:', error);
    return { success: false, error: 'Failed to get table names' };
  }
}

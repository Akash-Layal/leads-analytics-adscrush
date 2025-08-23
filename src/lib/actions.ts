'use server';

import { getAllTableCounts, getTotalCount, getTableStats } from './table-counts';

export async function getTableCountsAction() {
  try {
    const [tableCounts, totalCount, tableStats] = await Promise.all([
      getAllTableCounts(),
      getTotalCount(),
      getTableStats()
    ]);

    return {
      success: true,
      data: {
        totalCount,
        tableCounts,
        tableStats,
        summary: {
          totalTables: tableCounts.length,
          totalSize: tableStats.reduce((total, { sizeMB }) => total + sizeMB, 0),
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
    const { getTableCount } = await import('./table-counts');
    const count = await getTableCount(tableName);
    return { success: true, count };
  } catch (error) {
    console.error(`Error counting table ${tableName}:`, error);
    return { success: false, error: 'Failed to get table count' };
  }
}

export async function getTableNamesAction() {
  try {
    const { getTableNames } = await import('./table-counts');
    const tableNames = await getTableNames();
    return { success: true, tableNames };
  } catch (error) {
    console.error('Error fetching table names:', error);
    return { success: false, error: 'Failed to get table names' };
  }
}

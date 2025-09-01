// Services index - Business logic layer
export * from './client.service';
export * from './table.service';
export * from './dashboard.service';
export * from './analytics.service';
export * from './table-mapping.service';
export * from './cache.service';

// Re-export commonly used services
export {
  getAllClients,
  getClientById,
  getClientTables,
  getClientCount,
  createClient,
  updateClient,
  deleteClient,
  invalidateClientCache,
  warmClientCache
} from './client.service';

export {
  getAllTableMappings,
  getTableMappingById,
  getTableMappingsByClientId,
  getTableMappingCount,
  createTableMapping,
  updateTableMapping,
  deleteTableMapping,
  getActiveTableMappings,
  invalidateTableCache,
  warmTableCache
} from './table.service';

export {
  getDashboardOverview,
  getClientStatusDistribution,
  getTableMappingStatusDistribution,
  getMonthlyGrowth,
  getTopPerformingClients,
  getDashboardMetrics,
  invalidateDashboardCache,
  warmDashboardCache
} from './dashboard.service';

export {
  getAllTableNames,
  getTableCount,
  getTableSize,
  getAllTableCounts,
  getAllTableStats,
  getTotalCount,
  getAnalyticsSummary,
  invalidateAnalyticsCache,
  warmAnalyticsCache
} from './analytics.service';

export {
  getAllTableMappingsWithClients,
  getTableMappingsByStatus,
  getTableMappingsBySchema,
  getTableMappingStats,
  searchTableMappings,
  getTableMappingsByDateRange,
  bulkUpdateTableMappings,
  getTableMappingAuditLog,
  invalidateTableMappingCache,
  warmTableMappingCache
} from './table-mapping.service';

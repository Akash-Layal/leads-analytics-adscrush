// Main library index
export * from './cache';
export * from './services';
export * from './utils';
export * from './table-utils';

// Re-export commonly used utilities
export { 
  globalCache, 
  tableCache, 
  clientCache, 
  dashboardCache, 
  analyticsCache 
} from './cache';

export {
  getAllClients,
  getClientById,
  getClientTables,
  getClientCount,
  createClient,
  updateClient,
  deleteClient
} from './services';

export {
  getAllTableMappings,
  getTableMappingById,
  getTableMappingsByClientId,
  createTableMapping,
  updateTableMapping,
  deleteTableMapping
} from './services';

export {
  getDashboardOverview,
  getDashboardMetrics,
  getClientStatusDistribution,
  getTopPerformingClients
} from './services';

export {
  getAllTableCounts,
  getAllTableStats,
  getTotalCount,
  getAnalyticsSummary
} from './services';

export {
  clearAllCaches,
  getCacheStats,
  getCacheHealth,
  warmAllCaches,
  getCachePerformance,
  getCacheRecommendations
} from './services';

export {
  getTableDisplayName,
  getTableMappingDisplayName,
  formatTableNameForDisplay
} from './table-utils';

// Utility functions for table operations

/**
 * Get the display name for a table mapping
 * If customTableName is provided and not empty, use it; otherwise fallback to tableName
 */
export function getTableDisplayName(tableName: string, customTableName: string | null): string {
  return customTableName && customTableName.trim() ? customTableName.trim() : tableName;
}

/**
 * Get the display name for a table mapping object
 */
export function getTableMappingDisplayName(mapping: {
  tableName: string;
  customTableName: string | null;
}): string {
  return getTableDisplayName(mapping.tableName, mapping.customTableName);
}

/**
 * Format table name for display (truncate if too long)
 */
export function formatTableNameForDisplay(name: string, maxLength: number = 30): string {
  if (name.length <= maxLength) {
    return name;
  }
  return name.substring(0, maxLength - 3) + '...';
}

/**
 * Check if a table mapping has a custom name
 */
export function hasCustomTableName(customTableName: string | null): boolean {
  return !!(customTableName && customTableName.trim());
}

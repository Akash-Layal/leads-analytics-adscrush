'use server';

import { clearAllCaches as clearAllCachesService } from '@/lib/services/cache.service';

export async function clearAllCachesAction() {
  try {
    return await clearAllCachesService();
  } catch (error) {
    console.error('Error in clearAllCachesAction:', error);
    return {
      success: false,
      error: 'Failed to clear caches'
    };
  }
}

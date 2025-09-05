'use server';

import { getDashboardDataSafe } from '@/lib/services/dashboard-data.service';

export async function getDashboardDataAction(date_from?: string, date_to?: string) {
  try {
    const result = await getDashboardDataSafe(date_from, date_to);
    return result;
  } catch (error) {
    console.error('Error in getDashboardDataAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

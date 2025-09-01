export interface PerformanceMetrics {
  totalLeads: number;
  todayLeads: number;
  yesterdayLeads: number;
  sizeMB: number;
  hasData: boolean;
}

export interface PerformanceScore {
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  label: string;
  badgeClass: string;
  breakdown: {
    leadVolume: number;
    growthRate: number;
    dataFreshness: number;
    consistency: number;
  };
}

/**
 * Calculate a performance score (0-100) based on yesterday and today data only
 */
export function calculatePerformanceScore(metrics: PerformanceMetrics): PerformanceScore {
  const {
    totalLeads,
    todayLeads,
    yesterdayLeads,
    sizeMB,
    hasData
  } = metrics;

  if (!hasData || totalLeads === 0) {
    return {
      score: 0,
      grade: 'F',
      label: 'No Data',
      badgeClass: 'bg-gray-100 text-gray-800',
      breakdown: {
        leadVolume: 0,
        growthRate: 0,
        dataFreshness: 0,
        consistency: 0
      }
    };
  }

  // 1. Lead Volume Score (40% weight) - Based on total leads
  const leadVolumeScore = Math.min(100, (totalLeads / 10000) * 100);

  // 2. Growth Rate Score (35% weight) - Compare today vs yesterday
  let growthRateScore = 50; // Neutral baseline
  if (yesterdayLeads > 0) {
    const growthPercent = ((todayLeads - yesterdayLeads) / yesterdayLeads) * 100;
    if (growthPercent > 0) {
      growthRateScore = Math.min(100, 50 + (growthPercent * 2)); // Positive growth
    } else {
      growthRateScore = Math.max(0, 50 + (growthPercent * 2)); // Negative growth
    }
  } else if (todayLeads > 0) {
    // If no yesterday data but today has leads, give a moderate score
    growthRateScore = 60;
  }

  // 3. Data Freshness Score (25% weight) - Based on recent activity (today + yesterday)
  const recentActivity = todayLeads + yesterdayLeads;
  const dataFreshnessScore = Math.min(100, (recentActivity / totalLeads) * 200);

  // Calculate weighted final score
  const finalScore = Math.round(
    (leadVolumeScore * 0.40) +
    (growthRateScore * 0.35) +
    (dataFreshnessScore * 0.25)
  );

  // Determine grade and label
  const { grade, label, badgeClass } = getGradeAndLabel(finalScore);

  return {
    score: finalScore,
    grade,
    label,
    badgeClass,
    breakdown: {
      leadVolume: Math.round(leadVolumeScore),
      growthRate: Math.round(growthRateScore),
      dataFreshness: Math.round(dataFreshnessScore),
      consistency: Math.round(growthRateScore) // Use growth rate as consistency indicator
    }
  };
}

function getGradeAndLabel(score: number): { grade: PerformanceScore['grade']; label: string; badgeClass: string } {
  if (score >= 95) return { grade: 'A+', label: 'Exceptional', badgeClass: 'bg-purple-100 text-purple-800' };
  if (score >= 90) return { grade: 'A', label: 'Excellent', badgeClass: 'bg-green-100 text-green-800' };
  if (score >= 85) return { grade: 'B+', label: 'Very Good', badgeClass: 'bg-blue-100 text-blue-800' };
  if (score >= 80) return { grade: 'B', label: 'Good', badgeClass: 'bg-blue-100 text-blue-800' };
  if (score >= 75) return { grade: 'C+', label: 'Above Average', badgeClass: 'bg-yellow-100 text-yellow-800' };
  if (score >= 70) return { grade: 'C', label: 'Average', badgeClass: 'bg-yellow-100 text-yellow-800' };
  if (score >= 60) return { grade: 'D', label: 'Below Average', badgeClass: 'bg-orange-100 text-orange-800' };
  return { grade: 'F', label: 'Poor', badgeClass: 'bg-red-100 text-red-800' };
}

/**
 * Get trend indicator for lead growth (yesterday vs today)
 */
export function getTrendIndicator(today: number, yesterday: number): {
  icon: '↗️' | '↘️' | '→' | '?';
  color: string;
  label: string;
} {
  if (yesterday === 0) {
    if (today > 0) return { icon: '↗️', color: 'text-green-600', label: 'New activity' };
    return { icon: '?', color: 'text-gray-500', label: 'No baseline' };
  }
  
  const change = today - yesterday;
  const changePercent = (change / yesterday) * 100;
  
  if (changePercent > 10) return { icon: '↗️', color: 'text-green-600', label: `+${changePercent.toFixed(1)}%` };
  if (changePercent < -10) return { icon: '↘️', color: 'text-red-600', label: `${changePercent.toFixed(1)}%` };
  return { icon: '→', color: 'text-gray-600', label: 'Stable' };
}

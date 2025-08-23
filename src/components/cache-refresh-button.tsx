'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { IconRefresh, IconLoader } from '@tabler/icons-react';
import { clearCache } from '@/lib/table-counts';

interface CacheRefreshButtonProps {
  onRefresh?: () => void;
  className?: string;
}

export function CacheRefreshButton({ onRefresh, className }: CacheRefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cooldown, setCooldown] = useState(() => {
    // Initialize cooldown from localStorage if available
    if (typeof window !== 'undefined') {
      const savedCooldown = localStorage.getItem('cache-refresh-cooldown');
      if (savedCooldown) {
        const { timestamp, duration } = JSON.parse(savedCooldown);
        const elapsed = Math.floor((Date.now() - timestamp) / 1000);
        const remaining = Math.max(0, duration - elapsed);
        return remaining > 0 ? remaining : 0;
      }
    }
    return 0;
  });
  const [isDisabled, setIsDisabled] = useState(() => {
    // Initialize disabled state from localStorage
    if (typeof window !== 'undefined') {
      const savedCooldown = localStorage.getItem('cache-refresh-cooldown');
      if (savedCooldown) {
        const { timestamp, duration } = JSON.parse(savedCooldown);
        const elapsed = Math.floor((Date.now() - timestamp) / 1000);
        return elapsed < duration;
      }
    }
    return false;
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (cooldown > 0) {
      setIsDisabled(true);
      interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            setIsDisabled(false);
            // Clear localStorage when cooldown expires
            if (typeof window !== 'undefined') {
              localStorage.removeItem('cache-refresh-cooldown');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [cooldown]);

  // Update localStorage whenever cooldown changes
  useEffect(() => {
    if (cooldown > 0 && typeof window !== 'undefined') {
      const savedCooldown = localStorage.getItem('cache-refresh-cooldown');
      if (savedCooldown) {
        const { timestamp } = JSON.parse(savedCooldown);
        localStorage.setItem('cache-refresh-cooldown', JSON.stringify({
          timestamp,
          duration: cooldown
        }));
      }
    }
  }, [cooldown]);

  // Function to manually reset cooldown (for testing or admin purposes)
  const resetCooldown = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cache-refresh-cooldown');
    }
    setCooldown(0);
    setIsDisabled(false);
  };

  const handleRefresh = async () => {
    if (isDisabled || isRefreshing) return;

    try {
      setIsRefreshing(true);
      await clearCache();
      
      // Set 1 minute cooldown (60 seconds)
      const cooldownDuration = 60;
      setCooldown(cooldownDuration);
      
      // Save cooldown to localStorage
      if (typeof window !== 'undefined') {
        const cooldownData = {
          timestamp: Date.now(),
          duration: cooldownDuration
        };
        localStorage.setItem('cache-refresh-cooldown', JSON.stringify(cooldownData));
        console.log('Cooldown saved to localStorage:', cooldownData);
      }
      
      // Trigger parent refresh callback
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isDisabled || isRefreshing}
      variant={isDisabled ? "secondary" : "default"}
      className={className}
      size="sm"
    >
      {isRefreshing ? (
        <IconLoader className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <IconRefresh className="h-4 w-4 mr-2" />
      )}
      
      {isDisabled ? (
        <div className="flex flex-col items-center">
          <span>Refresh ({formatTime(cooldown)})</span>
          <span className="text-xs text-gray-400">
            Started at {(() => {
              const saved = localStorage.getItem('cache-refresh-cooldown');
              if (saved) {
                const { timestamp } = JSON.parse(saved);
                return new Date(timestamp).toLocaleTimeString();
              }
              return '';
            })()}
          </span>
        </div>
      ) : (
        isRefreshing ? 'Refreshing...' : 'Refresh Cache'
      )}
    </Button>
  );
}

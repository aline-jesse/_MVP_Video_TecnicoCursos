'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface FetchAnalyticsOptions {
  timeRange: string;
}

export function useAnalytics<T>(options: FetchAnalyticsOptions) {
  const { timeRange } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/analytics/dashboard?period=${timeRange}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch analytics');
      }
      
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error(`Erro ao carregar analytics: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading, refreshing, fetchAnalytics };
}

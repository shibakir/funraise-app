import { useEffect, useCallback } from 'react';
import { useRefresh } from '@/lib/context/RefreshContext';

interface UseRefreshableDataOptions {
  key: string;
  onRefresh: () => Promise<void> | void;
  dependencies?: any[];
}

export function useRefreshableData({ key, onRefresh, dependencies = [] }: UseRefreshableDataOptions) {
  const { registerRefreshCallback, unregisterRefreshCallback, refreshKey } = useRefresh();

  const refreshCallback = useCallback(onRefresh, dependencies);

  useEffect(() => {
    registerRefreshCallback(key, refreshCallback);
    
    return () => {
      unregisterRefreshCallback(key);
    };
  }, [key, refreshCallback, registerRefreshCallback, unregisterRefreshCallback]);

  // Return refreshKey for use as key for components
  return { refreshKey };
} 
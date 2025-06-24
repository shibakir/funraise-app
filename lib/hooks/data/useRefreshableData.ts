import { useEffect, useCallback } from 'react';
import { useRefresh } from '@/lib/context/RefreshContext';

/**
 * Configuration options for the refreshable data hook.
 * Defines the callback behavior and dependencies for data refresh operations.
 */
interface UseRefreshableDataOptions {
  /** Unique identifier for this refresh callback */
  key: string;
  /** Callback function to execute when refresh is triggered */
  onRefresh: () => Promise<void> | void;
  /** Dependency array for the refresh callback (similar to useCallback dependencies) */
  dependencies?: any[];
}

/**
 * Custom hook for integrating components with the global refresh system.
 * Allows components to register refresh callbacks that will be executed
 * when a global refresh is triggered through the RefreshContext.
 * 
 * This hook is useful for:
 * - Coordinating data refreshes across multiple components
 * - Implementing pull-to-refresh functionality
 * - Synchronizing data updates after mutations
 * - Managing cache invalidation patterns
 * 
 * The hook automatically handles callback registration/unregistration
 * and provides a refresh key that can be used to trigger component re-renders.
 * 
 * @param {UseRefreshableDataOptions} options - Configuration options
 * @param {string} options.key - Unique identifier for this refresh callback
 * @param {() => Promise<void> | void} options.onRefresh - Function to call during refresh
 * @param {any[]} [options.dependencies=[]] - Dependencies for the refresh callback
 * 
 * @returns {Object} Refresh utilities
 * @returns {number} refreshKey - Incrementing key for triggering component updates
 * 
 */
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
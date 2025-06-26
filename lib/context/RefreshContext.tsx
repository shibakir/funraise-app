import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

/**
 * Refresh context interface defining functionality for coordinated data refreshing
 * across multiple components. Provides centralized refresh state management
 * and callback registration system.
 */
interface RefreshContextType {
    /** Current refreshing state indicator */
    isRefreshing: boolean;
    /** Incrementing key used to trigger component re-renders */
    refreshKey: number;
    /** Main refresh function that executes all registered callbacks */
    onRefresh: () => Promise<void>;
    /** Triggers refresh key increment for component re-rendering */
    triggerRefresh: () => void;
    /** Registers a callback function to be executed during refresh */
    registerRefreshCallback: (key: string, callback: () => Promise<void> | void) => void;
    /** Unregisters a previously registered callback function */
    unregisterRefreshCallback: (key: string) => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

/**
 * Refresh provider component that manages global refresh state and coordinates
 * data refreshing across multiple components. Allows components to register
 * refresh callbacks and provides centralized refresh functionality.
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to wrap with refresh context
 * @returns {JSX.Element} Provider component with refresh context
 */
export function RefreshProvider({ children }: { children: ReactNode }) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [refreshCallbacks, setRefreshCallbacks] = useState<Map<string, () => Promise<void> | void>>(new Map());

    /**
     * Registers a refresh callback function with a unique key.
     * The callback will be executed when onRefresh is called.
     * 
     * @param {string} key - Unique identifier for the callback
     * @param {() => Promise<void> | void} callback - Function to execute during refresh
     */
    const registerRefreshCallback = useCallback((key: string, callback: () => Promise<void> | void) => {
        setRefreshCallbacks(prev => {
            const newMap = new Map(prev);
            newMap.set(key, callback);
            return newMap;
        });
    }, []);

    /**
     * Unregisters a previously registered refresh callback.
     * Removes the callback from the execution list.
     * 
     * @param {string} key - Unique identifier of the callback to remove
     */
    const unregisterRefreshCallback = useCallback((key: string) => {
        setRefreshCallbacks(prev => {
            const newMap = new Map(prev);
            newMap.delete(key);
            return newMap;
        });
    }, []);

    /**
     * Increments the refresh key to trigger re-rendering of components
     * that depend on the refreshKey value for data updates.
     */
    const triggerRefresh = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    /**
     * Executes all registered refresh callbacks and updates the refresh key.
     * Sets refreshing state during execution and handles errors gracefully.
     * All callbacks are executed concurrently using Promise.allSettled.
     */
    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        
        try {
            // Execute all registered refresh callbacks
            const refreshPromises = Array.from(refreshCallbacks.values()).map(callback => {
                const result = callback();
                return Promise.resolve(result);
            });
            
            await Promise.allSettled(refreshPromises);
            
            // Update the key for re-rendering components
            triggerRefresh();

        } catch (error) {
            console.error('Error while updating data:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [refreshCallbacks, triggerRefresh]);

    return (
        <RefreshContext.Provider
            value={{
                isRefreshing,
                refreshKey,
                onRefresh,
                triggerRefresh,
                registerRefreshCallback,
                unregisterRefreshCallback,
            }}
        >
            {children}
        </RefreshContext.Provider>
    );
}

/**
 * Custom hook to access the refresh context.
 * Must be used within a RefreshProvider component.
 * 
 * @returns {RefreshContextType} Refresh context with state and callback management functions
 * @throws {Error} When used outside of RefreshProvider
 */
export function useRefresh() {
    const context = useContext(RefreshContext);
    
    if (context === undefined) {
        throw new Error('useRefresh must be used within a RefreshProvider');
    }
    
    return context;
}

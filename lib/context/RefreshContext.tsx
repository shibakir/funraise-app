import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface RefreshContextType {
    isRefreshing: boolean;
    refreshKey: number;
    onRefresh: () => Promise<void>;
    triggerRefresh: () => void;
    registerRefreshCallback: (key: string, callback: () => Promise<void> | void) => void;
    unregisterRefreshCallback: (key: string) => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export function RefreshProvider({ children }: { children: ReactNode }) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [refreshCallbacks, setRefreshCallbacks] = useState<Map<string, () => Promise<void> | void>>(new Map());

    const registerRefreshCallback = useCallback((key: string, callback: () => Promise<void> | void) => {
        setRefreshCallbacks(prev => {
            const newMap = new Map(prev);
            newMap.set(key, callback);
            return newMap;
        });
    }, []);

    const unregisterRefreshCallback = useCallback((key: string) => {
        setRefreshCallbacks(prev => {
            const newMap = new Map(prev);
            newMap.delete(key);
            return newMap;
        });
    }, []);

    const triggerRefresh = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

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

export function useRefresh() {
    const context = useContext(RefreshContext);
    
    if (context === undefined) {
        throw new Error('useRefresh must be used within a RefreshProvider');
    }
    
    return context;
}

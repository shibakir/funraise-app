import { useCallback } from 'react';
import AuthService from '@/services/AuthService';
import { router } from 'expo-router';

/**
 * Hook for simplified token work
 */
export default function useTokenRefresh() {
    /**
     * Safe execution of an operation with automatic token refresh
     */
    const executeWithTokenRefresh = useCallback(async <T>(operation: () => Promise<T>): Promise<T | null> => {
        try {
            return await AuthService.executeWithTokenRefresh(operation);
        } catch (error) {
            console.error('Operation failed even after token refresh:', error);
            
            // If the operation failed even after token refresh, redirect to login
            await AuthService.logout();
            router.replace('/(auth)/login');
            return null;
        }
    }, []);

    /**
     * Active token refresh
     */
    const refreshTokenIfNeeded = useCallback(async (): Promise<boolean> => {
        return await AuthService.refreshTokenIfNeeded();
    }, []);

    /**
     * Check authentication
     */
    const checkAuth = useCallback(async (): Promise<boolean> => {
        return await AuthService.isAuthenticated();
    }, []);

    return {
        executeWithTokenRefresh,
        refreshTokenIfNeeded,
        checkAuth,
    };
} 
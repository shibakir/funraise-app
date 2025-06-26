import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { RefreshProvider, useRefresh } from '@/lib/context/RefreshContext';

const renderUseRefresh = () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <RefreshProvider>{children}</RefreshProvider>
    );
    return renderHook(() => useRefresh(), { wrapper });
};

describe('RefreshContext', () => {
    describe('useRefresh hook', () => {
        it('should throw error when used outside RefreshProvider', () => {
            // Suppress console.error for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            expect(() => {
                renderHook(() => useRefresh());
            }).toThrow('useRefresh must be used within a RefreshProvider');

            consoleSpy.mockRestore();
        });
    });

    describe('RefreshProvider', () => {
        it('should initialize with default state', () => {
            const { result } = renderUseRefresh();

            expect(result.current.isRefreshing).toBe(false);
            expect(result.current.refreshKey).toBe(0);
            expect(typeof result.current.onRefresh).toBe('function');
            expect(typeof result.current.triggerRefresh).toBe('function');
            expect(typeof result.current.registerRefreshCallback).toBe('function');
            expect(typeof result.current.unregisterRefreshCallback).toBe('function');
        });

        it('should trigger refresh and increment refresh key', () => {
            const { result } = renderUseRefresh();

            const initialKey = result.current.refreshKey;

            act(() => {
                result.current.triggerRefresh();
            });

            expect(result.current.refreshKey).toBe(initialKey + 1);
        });

        it('should register and unregister refresh callbacks', () => {
            const { result } = renderUseRefresh();
            const mockCallback = jest.fn();

            // Register callback
            act(() => {
                result.current.registerRefreshCallback('test-key', mockCallback);
            });

            // Verify callback is registered by triggering refresh
            act(() => {
                result.current.onRefresh();
            });

            expect(mockCallback).toHaveBeenCalled();

            // Unregister callback
            mockCallback.mockClear();
            act(() => {
                result.current.unregisterRefreshCallback('test-key');
            });

            // Verify callback is no longer called
            act(() => {
                result.current.onRefresh();
            });

            expect(mockCallback).not.toHaveBeenCalled();
        });

        it('should handle multiple callbacks', async () => {
            const { result } = renderUseRefresh();
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            const callback3 = jest.fn();

            // Register multiple callbacks
            act(() => {
                result.current.registerRefreshCallback('key1', callback1);
                result.current.registerRefreshCallback('key2', callback2);
                result.current.registerRefreshCallback('key3', callback3);
            });

            // Trigger refresh
            await act(async () => {
                await result.current.onRefresh();
            });

            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
            expect(callback3).toHaveBeenCalled();
        });

        it('should handle async callbacks', async () => {
            const { result } = renderUseRefresh();
            const asyncCallback = jest.fn().mockResolvedValue(undefined);
            const syncCallback = jest.fn();

            act(() => {
                result.current.registerRefreshCallback('async-key', asyncCallback);
                result.current.registerRefreshCallback('sync-key', syncCallback);
            });

            await act(async () => {
                await result.current.onRefresh();
            });

            expect(asyncCallback).toHaveBeenCalled();
            expect(syncCallback).toHaveBeenCalled();
        });

        it('should update refreshKey when onRefresh is called', async () => {
            const { result } = renderUseRefresh();
            const initialKey = result.current.refreshKey;

            await act(async () => {
                await result.current.onRefresh();
            });

            expect(result.current.refreshKey).toBe(initialKey + 1);
        });

        it('should set isRefreshing to true during refresh', async () => {
            const { result } = renderUseRefresh();
            let refreshingDuringCallback = false;

            const slowCallback = jest.fn().mockImplementation(async () => {
                refreshingDuringCallback = result.current.isRefreshing;
                // Simulate slow operation
                await new Promise(resolve => setTimeout(resolve, 10));
            });

            act(() => {
                result.current.registerRefreshCallback('slow-key', slowCallback);
            });

            expect(result.current.isRefreshing).toBe(false);

            await act(async () => {
                await result.current.onRefresh();
            });

            expect(refreshingDuringCallback).toBe(true);
            expect(result.current.isRefreshing).toBe(false);
        });

        it('should handle callback errors gracefully', async () => {
            const { result } = renderUseRefresh();
            const errorCallback = jest.fn().mockRejectedValue(new Error('Callback error'));
            const successCallback = jest.fn();

            // Mock console.error to avoid error output in tests
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            act(() => {
                result.current.registerRefreshCallback('error-key', errorCallback);
                result.current.registerRefreshCallback('success-key', successCallback);
            });

            await act(async () => {
                await result.current.onRefresh();
            });

            expect(errorCallback).toHaveBeenCalled();
            expect(successCallback).toHaveBeenCalled();
            expect(result.current.isRefreshing).toBe(false);

            consoleSpy.mockRestore();
        });

        it('should allow overwriting callbacks with same key', async () => {
            const { result } = renderUseRefresh();
            const firstCallback = jest.fn();
            const secondCallback = jest.fn();

            // Register first callback
            act(() => {
                result.current.registerRefreshCallback('test-key', firstCallback);
            });

            // Overwrite with second callback
            act(() => {
                result.current.registerRefreshCallback('test-key', secondCallback);
            });

            await act(async () => {
                await result.current.onRefresh();
            });

            expect(firstCallback).not.toHaveBeenCalled();
            expect(secondCallback).toHaveBeenCalled();
        });

        it('should handle unregistering non-existent callback', () => {
            const { result } = renderUseRefresh();

            // Should not throw error
            act(() => {
                result.current.unregisterRefreshCallback('non-existent-key');
            });

            expect(result.current.refreshKey).toBe(0);
        });

        it('should execute callbacks concurrently with Promise.allSettled', async () => {
            const { result } = renderUseRefresh();

            let execution1Started = false;
            let execution2Started = false;
            let execution1Finished = false;
            let execution2Finished = false;

            const callback1 = jest.fn().mockImplementation(async () => {
                execution1Started = true;
                await new Promise(resolve => setTimeout(resolve, 20));
                execution1Finished = true;
            });

            const callback2 = jest.fn().mockImplementation(async () => {
                execution2Started = true;
                await new Promise(resolve => setTimeout(resolve, 10));
                execution2Finished = true;
            });

            act(() => {
                result.current.registerRefreshCallback('key1', callback1);
                result.current.registerRefreshCallback('key2', callback2);
            });

            await act(async () => {
                await result.current.onRefresh();
            });

            expect(execution1Started).toBe(true);
            expect(execution2Started).toBe(true);
            expect(execution1Finished).toBe(true);
            expect(execution2Finished).toBe(true);
        });

        it('should maintain stable function references for callbacks', () => {
            const { result, rerender } = renderUseRefresh();

            const registerRefreshCallback1 = result.current.registerRefreshCallback;
            const unregisterRefreshCallback1 = result.current.unregisterRefreshCallback;
            const triggerRefresh1 = result.current.triggerRefresh;
            const onRefresh1 = result.current.onRefresh;

            rerender();

            expect(result.current.registerRefreshCallback).toBe(registerRefreshCallback1);
            expect(result.current.unregisterRefreshCallback).toBe(unregisterRefreshCallback1);
            expect(result.current.triggerRefresh).toBe(triggerRefresh1);
            expect(result.current.onRefresh).toBe(onRefresh1);
        });
    });
}); 
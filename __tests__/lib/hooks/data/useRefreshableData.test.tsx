import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { useRefreshableData } from '@/lib/hooks/data/useRefreshableData';

// mock RefreshContext
const mockRegisterRefreshCallback = jest.fn();
const mockUnregisterRefreshCallback = jest.fn();
const mockRefreshKey = 5;

jest.mock('@/lib/context/RefreshContext', () => ({
  useRefresh: () => ({
    registerRefreshCallback: mockRegisterRefreshCallback,
    unregisterRefreshCallback: mockUnregisterRefreshCallback,
    refreshKey: mockRefreshKey,
  }),
}));

describe('useRefreshableData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return refreshKey from context', () => {
    const mockOnRefresh = jest.fn();
    
    const { result } = renderHook(() =>
      useRefreshableData({
        key: 'test-key',
        onRefresh: mockOnRefresh,
      })
    );

    expect(result.current.refreshKey).toBe(mockRefreshKey);
  });

  it('should register refresh callback on mount', () => {
    const mockOnRefresh = jest.fn();
    
    renderHook(() =>
      useRefreshableData({
        key: 'test-key',
        onRefresh: mockOnRefresh,
      })
    );

    expect(mockRegisterRefreshCallback).toHaveBeenCalledWith(
      'test-key',
      expect.any(Function)
    );
  });

  it('should unregister refresh callback on unmount', () => {
    const mockOnRefresh = jest.fn();
    
    const { unmount } = renderHook(() =>
      useRefreshableData({
        key: 'test-key',
        onRefresh: mockOnRefresh,
      })
    );

    unmount();

    expect(mockUnregisterRefreshCallback).toHaveBeenCalledWith('test-key');
  });

  it('should re-register callback when key changes', () => {
    const mockOnRefresh = jest.fn();
    
    const { rerender } = renderHook(
      ({ key }) =>
        useRefreshableData({
          key,
          onRefresh: mockOnRefresh,
        }),
      { initialProps: { key: 'initial-key' } }
    );

    // Initial registration
    expect(mockRegisterRefreshCallback).toHaveBeenCalledWith(
      'initial-key',
      expect.any(Function)
    );

    // Change key
    rerender({ key: 'new-key' });

    // Should unregister old and register new
    expect(mockUnregisterRefreshCallback).toHaveBeenCalledWith('initial-key');
    expect(mockRegisterRefreshCallback).toHaveBeenCalledWith(
      'new-key',
      expect.any(Function)
    );
  });

  it('should re-register callback when onRefresh function changes', () => {
    const mockOnRefresh1 = jest.fn();
    const mockOnRefresh2 = jest.fn();
    
    const { rerender } = renderHook(
      ({ onRefresh, dependencies }) =>
        useRefreshableData({
          key: 'test-key',
          onRefresh,
          dependencies,
        }),
      { initialProps: { onRefresh: mockOnRefresh1, dependencies: [mockOnRefresh1] } }
    );

    // Initial registration
    expect(mockRegisterRefreshCallback).toHaveBeenCalledWith(
      'test-key',
      expect.any(Function)
    );

    const initialCallCount = mockRegisterRefreshCallback.mock.calls.length;

    // Change onRefresh function and dependencies to trigger useCallback update
    rerender({ onRefresh: mockOnRefresh2, dependencies: [mockOnRefresh2] });

    // Should register again with new callback
    expect(mockRegisterRefreshCallback.mock.calls.length).toBeGreaterThan(
      initialCallCount
    );
  });

  it('should handle dependencies array correctly', () => {
    const mockOnRefresh = jest.fn();
    const dependency1 = 'dep1';
    const dependency2 = 'dep2';
    
    const { rerender } = renderHook(
      ({ dependencies }) =>
        useRefreshableData({
          key: 'test-key',
          onRefresh: mockOnRefresh,
          dependencies,
        }),
      { initialProps: { dependencies: [dependency1] } }
    );

    // Clear calls after initial render
    mockRegisterRefreshCallback.mockClear();
    mockUnregisterRefreshCallback.mockClear();

    // Change dependencies
    rerender({ dependencies: [dependency2] });

    // Should unregister and register again due to dependency change
    expect(mockUnregisterRefreshCallback).toHaveBeenCalledWith('test-key');
    expect(mockRegisterRefreshCallback).toHaveBeenCalledWith(
      'test-key',
      expect.any(Function)
    );
  });

  it('should handle empty dependencies array', () => {
    const mockOnRefresh = jest.fn();
    
    const { result } = renderHook(() =>
      useRefreshableData({
        key: 'test-key',
        onRefresh: mockOnRefresh,
        dependencies: [],
      })
    );

    expect(result.current.refreshKey).toBe(mockRefreshKey);
    expect(mockRegisterRefreshCallback).toHaveBeenCalledWith(
      'test-key',
      expect.any(Function)
    );
  });

  it('should handle undefined dependencies', () => {
    const mockOnRefresh = jest.fn();
    
    const { result } = renderHook(() =>
      useRefreshableData({
        key: 'test-key',
        onRefresh: mockOnRefresh,
      })
    );

    expect(result.current.refreshKey).toBe(mockRefreshKey);
    expect(mockRegisterRefreshCallback).toHaveBeenCalledWith(
      'test-key',
      expect.any(Function)
    );
  });

  it('should work with async onRefresh function', () => {
    const mockOnRefresh = jest.fn().mockResolvedValue(undefined);
    
    renderHook(() =>
      useRefreshableData({
        key: 'test-key',
        onRefresh: mockOnRefresh,
      })
    );

    expect(mockRegisterRefreshCallback).toHaveBeenCalledWith(
      'test-key',
      expect.any(Function)
    );
  });

  it('should work with sync onRefresh function', () => {
    const mockOnRefresh = jest.fn();
    
    renderHook(() =>
      useRefreshableData({
        key: 'test-key',
        onRefresh: mockOnRefresh,
      })
    );

    expect(mockRegisterRefreshCallback).toHaveBeenCalledWith(
      'test-key',
      expect.any(Function)
    );
  });

  it('should handle complex dependencies', () => {
    const mockOnRefresh = jest.fn();
    const complexDep = { id: 1, data: [1, 2, 3] };
    
    const { result } = renderHook(() =>
      useRefreshableData({
        key: 'test-key',
        onRefresh: mockOnRefresh,
        dependencies: [complexDep, 'string-dep', 123],
      })
    );

    expect(result.current.refreshKey).toBe(mockRefreshKey);
    expect(mockRegisterRefreshCallback).toHaveBeenCalledWith(
      'test-key',
      expect.any(Function)
    );
  });

  it('should call cleanup function only once per key', () => {
    const mockOnRefresh = jest.fn();
    
    const { unmount } = renderHook(() =>
      useRefreshableData({
        key: 'test-key',
        onRefresh: mockOnRefresh,
      })
    );

    unmount();

    expect(mockUnregisterRefreshCallback).toHaveBeenCalledTimes(1);
    expect(mockUnregisterRefreshCallback).toHaveBeenCalledWith('test-key');
  });

  it('should handle multiple instances with different keys', () => {
    const mockOnRefresh1 = jest.fn();
    const mockOnRefresh2 = jest.fn();
    
    const { result: result1 } = renderHook(() =>
      useRefreshableData({
        key: 'key-1',
        onRefresh: mockOnRefresh1,
      })
    );

    const { result: result2 } = renderHook(() =>
      useRefreshableData({
        key: 'key-2',
        onRefresh: mockOnRefresh2,
      })
    );

    expect(result1.current.refreshKey).toBe(mockRefreshKey);
    expect(result2.current.refreshKey).toBe(mockRefreshKey);
    
    expect(mockRegisterRefreshCallback).toHaveBeenCalledWith(
      'key-1',
      expect.any(Function)
    );
    expect(mockRegisterRefreshCallback).toHaveBeenCalledWith(
      'key-2',
      expect.any(Function)
    );
  });
}); 
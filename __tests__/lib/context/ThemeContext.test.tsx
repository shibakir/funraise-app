import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '@/lib/context/ThemeContext';

// Mock dependencies
jest.mock('react-native', () => ({
    useColorScheme: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
}));

import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const mockUseColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;
const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

const renderUseTheme = () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
    );
    return renderHook(() => useTheme(), { wrapper });
};

describe('ThemeContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Default mocks
        mockUseColorScheme.mockReturnValue('light');
        mockSecureStore.getItemAsync.mockResolvedValue(null);
        mockSecureStore.setItemAsync.mockResolvedValue();
    });

    describe('useTheme hook', () => {
        it('should throw error when used outside ThemeProvider', () => {
            // Suppress console.error for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            expect(() => {
                renderHook(() => useTheme());
            }).toThrow('useTheme must be used within a ThemeProvider');

            consoleSpy.mockRestore();
        });
    });

    describe('ThemeProvider', () => {
        it('should initialize with default system theme', async () => {
            const { result } = renderUseTheme();

            expect(result.current.theme).toBe('system');
            expect(result.current.resolvedTheme).toBe('light');
            expect(typeof result.current.setTheme).toBe('function');
        });

        it('should load saved theme from SecureStore', async () => {
            mockSecureStore.getItemAsync.mockResolvedValue('dark');

            const { result } = renderUseTheme();

            await waitFor(() => {
                expect(result.current.theme).toBe('dark');
            });

            expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('user-theme');
        });

        it('should handle SecureStore loading errors gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockSecureStore.getItemAsync.mockRejectedValue(new Error('Storage error'));

            const { result } = renderUseTheme();

            await waitFor(() => {
                expect(result.current.theme).toBe('system');
            });

            expect(consoleSpy).toHaveBeenCalledWith('Failed to load theme:', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('should save theme to SecureStore when changed', async () => {
            const { result } = renderUseTheme();

            await act(async () => {
                result.current.setTheme('dark');
            });

            expect(result.current.theme).toBe('dark');

            await waitFor(() => {
                expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('user-theme', 'dark');
            });
        });

        it('should handle SecureStore saving errors gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockSecureStore.setItemAsync.mockRejectedValue(new Error('Storage error'));

            const { result } = renderUseTheme();

            await act(async () => {
                result.current.setTheme('dark');
            });

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith('Failed to save theme:', expect.any(Error));
            });

            consoleSpy.mockRestore();
        });

        it('should resolve system theme to device theme when theme is system', () => {
            mockUseColorScheme.mockReturnValue('dark');

            const { result } = renderUseTheme();

            expect(result.current.theme).toBe('system');
            expect(result.current.resolvedTheme).toBe('dark');
        });

        it('should resolve to explicit theme when not system', async () => {
            mockUseColorScheme.mockReturnValue('dark');

            const { result } = renderUseTheme();

            await act(async () => {
                result.current.setTheme('light');
            });

            expect(result.current.theme).toBe('light');
            expect(result.current.resolvedTheme).toBe('light');
        });

        it('should fallback to dark theme when device theme is null', () => {
            mockUseColorScheme.mockReturnValue(null);

            const { result } = renderUseTheme();

            expect(result.current.theme).toBe('system');
            expect(result.current.resolvedTheme).toBe('dark');
        });

        it('should update resolvedTheme when device theme changes in system mode', () => {
            mockUseColorScheme.mockReturnValue('light');

            const { result, rerender } = renderUseTheme();

            expect(result.current.resolvedTheme).toBe('light');

            // Simulate device theme change
            mockUseColorScheme.mockReturnValue('dark');
            rerender();

            expect(result.current.resolvedTheme).toBe('dark');
        });

        it('should handle all theme types correctly', async () => {
            const { result } = renderUseTheme();

            // Test light theme
            await act(async () => {
                result.current.setTheme('light');
            });
            expect(result.current.theme).toBe('light');
            expect(result.current.resolvedTheme).toBe('light');

            // Test dark theme
            await act(async () => {
                result.current.setTheme('dark');
            });
            expect(result.current.theme).toBe('dark');
            expect(result.current.resolvedTheme).toBe('dark');

            // Test system theme
            mockUseColorScheme.mockReturnValue('light');
            await act(async () => {
                result.current.setTheme('system');
            });
            expect(result.current.theme).toBe('system');
            expect(result.current.resolvedTheme).toBe('light');
        });

        it('should persist theme changes across app sessions', async () => {
            // First render - load saved dark theme
            mockSecureStore.getItemAsync.mockResolvedValue('dark');

            const { result: result1 } = renderUseTheme();

            await waitFor(() => {
                expect(result1.current.theme).toBe('dark');
            });

            // Unmount and remount to simulate app restart
            // Second render - should load the same theme
            const { result: result2 } = renderUseTheme();

            await waitFor(() => {
                expect(result2.current.theme).toBe('dark');
            });

            expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('user-theme');
        });

        it('should update resolvedTheme reactively with device changes', () => {
            mockUseColorScheme.mockReturnValue('light');
            const { result, rerender } = renderUseTheme();

            // Initially light
            expect(result.current.resolvedTheme).toBe('light');

            // Device changes to dark
            mockUseColorScheme.mockReturnValue('dark');
            rerender();

            expect(result.current.resolvedTheme).toBe('dark');

            // Device changes back to light
            mockUseColorScheme.mockReturnValue('light');
            rerender();

            expect(result.current.resolvedTheme).toBe('light');
        });

        it('should not affect resolvedTheme when explicit theme is set', () => {
            const { result, rerender } = renderUseTheme();

            // Set explicit dark theme
            act(() => {
                result.current.setTheme('dark');
            });

            expect(result.current.resolvedTheme).toBe('dark');

            // Device theme changes should not affect resolved theme
            mockUseColorScheme.mockReturnValue('light');
            rerender();

            expect(result.current.resolvedTheme).toBe('dark');
        });

        it('should save theme immediately when setTheme is called', async () => {
            const { result } = renderUseTheme();

            await act(async () => {
                result.current.setTheme('light');
            });

            // Should save immediately
            expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('user-theme', 'light');

            await act(async () => {
                result.current.setTheme('dark');
            });

            // Should save the new theme
            expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('user-theme', 'dark');
        });
    });
}); 
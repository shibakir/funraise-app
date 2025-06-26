import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { useThemeColor } from '@/lib/hooks/ui/useThemeColor';
import { Colors } from '@/lib/constants/Colors';

// Мокируем контекст темы
const mockUseTheme = jest.fn();
jest.mock('@/lib/context/ThemeContext', () => ({
    useTheme: () => mockUseTheme(),
}));

describe('useThemeColor', () => {
    beforeEach(() => {
        mockUseTheme.mockClear();
    });

    it('should return color for light theme', () => {
        mockUseTheme.mockReturnValue({ resolvedTheme: 'light' });

        const { result } = renderHook(() =>
            useThemeColor({}, 'text')
        );

        expect(result.current).toBe(Colors.light.text);
    });

    it('should return color for dark theme', () => {
        mockUseTheme.mockReturnValue({ resolvedTheme: 'dark' });

        const { result } = renderHook(() =>
            useThemeColor({}, 'text')
        );

        expect(result.current).toBe(Colors.dark.text);
    });

    it('should use color from props for light theme', () => {
        mockUseTheme.mockReturnValue({ resolvedTheme: 'light' });

        const { result } = renderHook(() =>
            useThemeColor({ light: '#custom-light' }, 'text')
        );

        expect(result.current).toBe('#custom-light');
    });

    it('should use color from props for dark theme', () => {
        mockUseTheme.mockReturnValue({ resolvedTheme: 'dark' });

        const { result } = renderHook(() =>
            useThemeColor({ dark: '#custom-dark' }, 'text')
        );

        expect(result.current).toBe('#custom-dark');
    });

    it('should return color from constants if no prop for current theme', () => {
        mockUseTheme.mockReturnValue({ resolvedTheme: 'light' });

        const { result } = renderHook(() =>
            useThemeColor({ dark: '#custom-dark' }, 'text')
        );

        expect(result.current).toBe(Colors.light.text);
    });

    it('should work with different color names', () => {
        mockUseTheme.mockReturnValue({ resolvedTheme: 'light' });

        const { result: backgroundResult } = renderHook(() =>
            useThemeColor({}, 'background')
        );

        const { result: tintResult } = renderHook(() =>
            useThemeColor({}, 'tint')
        );

        expect(backgroundResult.current).toBe(Colors.light.background);
        expect(tintResult.current).toBe(Colors.light.tint);
    });

    it('should react to theme change', () => {
        mockUseTheme.mockReturnValue({ resolvedTheme: 'light' });

        const { result, rerender } = renderHook(() =>
            useThemeColor({}, 'text')
        );

        expect(result.current).toBe(Colors.light.text);

        mockUseTheme.mockReturnValue({ resolvedTheme: 'dark' });
        rerender();

        expect(result.current).toBe(Colors.dark.text);
    });
}); 
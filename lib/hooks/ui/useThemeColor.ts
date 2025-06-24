/**
 * Custom hook for theme-aware color selection.
 * 
 * This hook provides a convenient way to select colors based on the current theme
 * (light or dark mode). It follows the Expo color scheme conventions and allows
 * for both prop-based overrides and fallback to predefined color constants.
 * 
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/lib/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';

/**
 * Custom hook for selecting colors based on the current theme.
 * Provides automatic color switching between light and dark modes with
 * support for prop-based overrides and fallback to color constants.
 * 
 * The hook first checks for theme-specific colors provided via props,
 * then falls back to the predefined color constants for the current theme.
 * This pattern ensures consistent theming throughout the application.
 * 
 * @param {Object} props - Theme-specific color overrides
 * @param {string} [props.light] - Color to use in light mode (overrides default)
 * @param {string} [props.dark] - Color to use in dark mode (overrides default)
 * @param {keyof Colors.light & keyof Colors.dark} colorName - Name of the color from Colors constants
 * 
 * @returns {string} The appropriate color value for the current theme
 * 
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { resolvedTheme: theme } = useTheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
} 
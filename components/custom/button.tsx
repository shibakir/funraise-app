import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useThemeColor } from '@/lib/hooks/ui';
import React, { ReactNode } from 'react';

export interface CustomButtonProps {
  children?: ReactNode;
  title?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'discord';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
}

export function CustomButton({ 
  children,
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  style
}: CustomButtonProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const dividerColor = useThemeColor({}, 'divider');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const surfaceHighlightColor = useThemeColor({}, 'surfaceHighlight');
  
  // Discord brand color
  const discordColor = '#5865F2';
  
  const getBackgroundColor = () => {
    if (disabled) {
      return dividerColor;
    }
    switch (variant) {
      case 'primary':
        return primaryColor;
      case 'secondary':
        return surfaceHighlightColor;
      case 'outline':
        return 'transparent';
      case 'discord':
        return discordColor;
      default:
        return primaryColor;
    }
  };
  
  const getTextColor = () => {
    if (disabled) {
      return placeholderColor;
    }
    switch (variant) {
      case 'primary':
      case 'discord':
        return surfaceColor;
      case 'secondary':
      case 'outline':
        return textColor;
      default:
        return surfaceColor;
    }
  };

  const sizeStyles = {
    small: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4 },
    medium: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6 },
    large: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8 },
  };
  
  const fontSizes = {
    small: 14,
    medium: 16,
    large: 18,
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        sizeStyles[size],
        variant === 'outline' && { borderWidth: 1, borderColor: primaryColor },
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {children || (
        <Text
          style={[
            styles.text,
            { color: getTextColor(), fontSize: fontSizes[size] }
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  }
});
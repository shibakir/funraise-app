import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/lib/hooks/useThemeColor';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export function CustomButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium' 
}: CustomButtonProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return primaryColor;
      case 'secondary':
        return useThemeColor({}, 'surfaceHighlight');
      case 'outline':
        return 'transparent';
      default:
        return primaryColor;
    }
  };
  
  const getTextColor = () => {
    switch (variant) {
      case 'primary':
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
        variant === 'outline' && { borderWidth: 1, borderColor: primaryColor }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.text,
          { color: getTextColor(), fontSize: fontSizes[size] }
        ]}
      >
        {title}
      </Text>
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
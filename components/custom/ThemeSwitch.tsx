import { StyleSheet, View, Switch } from 'react-native';
import { useTheme } from '@/lib/context/ThemeContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useThemeColor } from '@/lib/hooks/useThemeColor';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const primaryColor = useThemeColor({}, 'primary');
  const primaryLightColor = useThemeColor({}, 'primaryLight');
  const iconColor = useThemeColor({}, 'icon');
  const surfaceColor = useThemeColor({}, 'surface');
  
  const toggleSwitch = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <MaterialIcons 
            name={isDarkMode ? "dark-mode" : "light-mode"} 
            size={24}
            color={iconColor}
            style={styles.icon}
          />
          <ThemedText type="defaultSemiBold">
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </ThemedText>
        </View>
        <Switch
          trackColor={{ false: '#b00505', true: primaryLightColor }}
          thumbColor={isDarkMode ? primaryColor : surfaceColor}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isDarkMode}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  }
}); 
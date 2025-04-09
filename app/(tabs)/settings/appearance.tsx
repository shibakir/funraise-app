import React from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { useTheme } from '@/lib/context/ThemeContext';

export default function AppearanceScreen() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const borderColor = useThemeColor({}, 'divider');
  const primaryColor = useThemeColor({}, 'primary');
  
  const ThemeOption = ({ value, label }) => {
    const isSelected = theme === value;
    
    return (
      <TouchableOpacity
        style={[styles.optionContainer, { borderBottomColor: borderColor }]}
        onPress={() => setTheme(value)}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.optionTitle}>{label}</ThemedText>
        {isSelected && (
          <View style={[styles.checkCircle, { backgroundColor: primaryColor }]}>
            <View style={styles.checkMark}></View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedView style={styles.card}>
          <ThemeOption value="system" label="Automatic" />
          <ThemeOption value="dark" label="Dark" />
          <ThemeOption value="light" label="Light" />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: moderateScale(16),
    paddingBottom: verticalScale(40),
  },
  card: {
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  optionContainer: {
    flexDirection: 'row',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: moderateScale(17),
    fontWeight: '400',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    width: 10,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'white',
    transform: [{ rotate: '-45deg' }],
    marginBottom: 2,
  },
}); 
import React from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { useTheme } from '@/lib/context/ThemeContext';

export default function AppearanceScreen() {
  const { theme, setTheme } = useTheme();
  const borderColor = useThemeColor({}, 'divider');
  const primaryColor = useThemeColor({}, 'primary');
  const backgroundColor = useThemeColor({}, 'background');
  
  const ThemeOption = ({ value, label, isLast = false }) => {
    const isSelected = theme === value;
    
    return (
      <View style={styles.optionWrapper}>
        <TouchableOpacity
          style={styles.optionContainer}
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
        {!isLast && <View style={[styles.divider, { backgroundColor: borderColor }]} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedView style={[styles.card, { backgroundColor }]}>
          <ThemeOption value="system" label="Automatic" />
          <ThemeOption value="dark" label="Dark" />
          <ThemeOption value="light" label="Light" isLast={true} />
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
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  optionWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  optionContainer: {
    flexDirection: 'row',
    padding: moderateScale(16),
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  divider: {
    height: 1,
    width: '90%',
    marginBottom: 0,
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
    transform: [{ rotate: '-45deg' }],
    marginBottom: 2,
  },
}); 
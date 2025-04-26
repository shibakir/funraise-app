import React from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { verticalScale, moderateScale, horizontalScale } from '@/lib/utilities/Metrics';

export default function AppInfoScreen() {
  
  const borderColor = useThemeColor({}, 'divider');
  const primaryColor = useThemeColor({}, 'primary');
  const backgroundColor = useThemeColor({}, 'background');
  const sectionBackground = useThemeColor({}, 'sectionBackground');
  const textSecondary = useThemeColor({}, 'icon');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      padding: moderateScale(16),
      paddingBottom: verticalScale(40),
    },
    mainSection: {
      backgroundColor: sectionBackground,
      borderRadius: moderateScale(14),
      marginBottom: verticalScale(16),
    },
    section: {
      padding: moderateScale(16),
      borderRadius: moderateScale(16),
      overflow: 'hidden',
    },
    title: {
      fontSize: moderateScale(24),
      fontWeight: 'bold',
      marginBottom: verticalScale(8),
    },
    version: {
      fontSize: moderateScale(16),
      opacity: 0.7,
      marginBottom: verticalScale(16),
    },
    description: {
      fontSize: moderateScale(16),
      lineHeight: moderateScale(24),
      marginBottom: verticalScale(16),
    },
    diplomaInfo: {
      fontSize: moderateScale(14),
      fontStyle: 'italic',
      opacity: 0.8,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedView style={styles.mainSection}>
          <ThemedView style={styles.section}>
            <ThemedText style={styles.title}>FunRaise</ThemedText>
            <ThemedText style={styles.version}>Version 1.0.1</ThemedText>
            <ThemedText style={styles.description}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure 
            dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat 
            non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </ThemedText>
            <ThemedText style={styles.diplomaInfo}>
              This project was developed as part of a bachelor thesis at FIT CVUT in Prague in 2025.
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
} 
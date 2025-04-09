import React from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';

export default function SettingDetailScreen() {
  const { title, icon } = useLocalSearchParams();
  const textSecondary = useThemeColor({}, 'icon');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedView style={styles.section}>
          <View style={styles.headerContainer}>
            {icon && (
              <View style={styles.iconContainer}>
                <IconSymbol name={icon as any} size={30} color={textSecondary} />
              </View>
            )}
            <ThemedText type="title">{title}</ThemedText>
          </View>
          
          <View style={styles.contentSection}>
            <ThemedText>
              Page settings for "{title}". Here you will find content for managing these settings.
            </ThemedText>
          </View>
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
  section: {
    marginBottom: verticalScale(16),
    borderRadius: moderateScale(8),
    overflow: 'hidden',
    padding: moderateScale(16),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  iconContainer: {
    marginRight: horizontalScale(12),
  },
  contentSection: {
    paddingVertical: verticalScale(12),
  },
}); 
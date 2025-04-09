import React from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function SearchScreen() {

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.card}>
        <ThemedText style={styles.title}>Adaptive title</ThemedText>
        <ThemedText style={styles.text}>
          THIS text will automatically scale depending on the screen size
          THIS text will automatically scale depending on the screen size
          THIS text will automatically scale depending on the screen size
          THIS text will automatically scale depending on the screen size
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.grid}>
        <ThemedView style={styles.gridItem}>
          <ThemedText>THIS text will automatically scale depending on the screen size
          THIS text will automatically scale depending on the screen size
          THIS text will automatically scale depending on the screen size
          THIS text will automatically scale depending on the screen size
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.gridItem}>
        <ThemedText>THIS text will automatically scale depending on the screen size
          THIS text will automatically scale depending on the screen size
          THIS text will automatically scale depending on the screen size
          THIS text will automatically scale depending on the screen size
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.gridItem}>
        <ThemedText>THIS text will automatically scale depending on the screen size
          THIS text will automatically scale depending on the screen size
          THIS text will automatically scale depending on the screen size
          THIS text will automatically scale depending on the screen size
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: moderateScale(16),
    padding: moderateScale(20),
    borderRadius: moderateScale(8),
    gap: verticalScale(10),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
  },
  text: {
    fontSize: moderateScale(16),
    lineHeight: moderateScale(24),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: moderateScale(16),
    gap: moderateScale(10),
  },
  gridItem: {
    width: horizontalScale(150),
    height: verticalScale(100),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(10),
  },
}); 
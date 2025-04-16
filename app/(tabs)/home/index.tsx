import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { router, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/lib/context/AuthContext';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { CreateEventSection } from '@/components/custom/createEventSection';
import { UserEvents } from '@/components/custom/UserEvents';

export default function HomeScreen() {
  const { user } = useAuth();

  const borderColor = useThemeColor({}, 'divider');
  const textSecondary = useThemeColor({}, 'icon');
  const sectionBackground = useThemeColor({}, 'sectionBackground');
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const errorColor = useThemeColor({}, 'error');
  const surfaceColor = useThemeColor({}, 'surface');
  const placeholderColor = useThemeColor({}, 'placeholder');
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      padding: moderateScale(16),
      paddingBottom: verticalScale(40),
    },
    section: {
      borderRadius: moderateScale(8),
      overflow: 'hidden',
    },
    sectionHeader: {
      marginTop: verticalScale(6),
      paddingVertical: verticalScale(12),
    },
    sectionTitle: {
      fontSize: moderateScale(20),
      fontWeight: '600',
      marginBottom: verticalScale(4),
    },
  });

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Home',
          headerShown: true,
        }} 
      />
      <SafeAreaView style={[styles.container, { flex: 1 }]}>
        <StatusBar barStyle="default" />
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
            {/* NEW EVENT SECTION */}
            <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>New Event</ThemedText>
            </View>
            <CreateEventSection />
          
          {/* MY ACTIVE EVENTS SECTION */}
          <View style={styles.sectionHeader}>
                    <ThemedText style={styles.sectionTitle}>My recent events</ThemedText>
                </View>
                <UserEvents userId="1" />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
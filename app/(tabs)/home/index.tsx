import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { router, Stack, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/lib/context/AuthContext';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { CreateEventSection } from '@/components/custom/createEventSection';
import { UserEvents } from '@/components/custom/UserEvents';
import { UserAchievements } from '@/components/custom/UserAchievements';

export default function HomeScreen() {
  const { user } = useAuth();
  const [updateKey, setUpdateKey] = useState(0);
  const userId = user?.id ? String(user.id) : "1";
  
  useFocusEffect(
    useCallback(() => {
      setUpdateKey(prev => prev + 1);
    }, [])
  );

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
      marginTop: verticalScale(20),
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
            <CreateEventSection key={`create-${updateKey}`} />
          
          {/* MY ACTIVE EVENTS SECTION */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>My Recent Events</ThemedText>
          </View>
          <UserEvents userId={userId} key={`events-${updateKey}`} />
          
          {/* ACHIEVEMENTS SECTION */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>My Achievements</ThemedText>
          </View>
          <UserAchievements userId={userId} key={`achievements-${updateKey}`} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
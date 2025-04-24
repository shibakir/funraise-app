import React, { useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useUserEvents } from '@/lib/hooks/useUserEvents';
import { useRouteEvents } from '@/lib/hooks/useRouteEvents';

interface UserEventsProps {
  userId: string;
  limit?: number;
}

// event data interface
interface EventInterface {
    id: string;
    name: string;
    status?: 'active' | 'inactive';
    imageUrl?: string;
    conditionsProgress: number[];
}

export function UserEvents({ userId, limit = 5 }: UserEventsProps) {
  const { events, isLoading, error, fetchUserEvents } = useUserEvents();
  const borderColor = useThemeColor({}, 'divider');
  const textSecondary = useThemeColor({}, 'icon');
  const sectionBackground = useThemeColor({}, 'sectionBackground');
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const errorColor = useThemeColor({}, 'error');
  const surfaceColor = useThemeColor({}, 'surface');
  const placeholderColor = useThemeColor({}, 'placeholder');

  // Загружаем данные при каждом рендере компонента
  React.useEffect(() => {
    fetchUserEvents(userId, limit);
  }, []);

  const styles = StyleSheet.create({
    mainSection: {
        backgroundColor: sectionBackground,
        borderRadius: moderateScale(14),
        marginBottom: verticalScale(16),
        overflow: 'hidden',
      },
    activeIndicator: {
      backgroundColor: primaryColor,
    },
    eventName: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      flex: 1,
    },
    progressContainer: {
      width: '70%',
      height: moderateScale(8),
      backgroundColor: borderColor,
      borderRadius: moderateScale(4),
      marginTop: verticalScale(8),
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: primaryColor,
    },
    container: {
      //marginVertical: verticalScale(8),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: moderateScale(20),
    },
    eventCard: {
        flexDirection: 'row',
        padding: moderateScale(16),
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
    },
    eventInfo: {
      flex: 1,
      marginRight: horizontalScale(12),
    },
    activeNowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(8),
    },
    statusIndicator: {
      width: moderateScale(8),
      height: moderateScale(8),
      borderRadius: moderateScale(4),
      marginRight: horizontalScale(8),
    },
    activeNowText: {
      fontSize: moderateScale(12),
      color: '#4CAF50',
    },
    bankAmount: {
      fontSize: moderateScale(14),
      color: '#666',
    },
    progressText: {
      fontSize: moderateScale(12),
      color: textColor,
      marginTop: verticalScale(4),
    },
    eventImage: {
        width: moderateScale(80),
        height: moderateScale(80),
        borderRadius: moderateScale(8),
        backgroundColor: surfaceColor,
        borderWidth: 3,
        borderColor: primaryColor,
        shadowColor: primaryColor,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
  });

  const EventCard = ({ event }: { event: EventInterface }) => {
    // animation for active indicator
    const opacity = useSharedValue(1);
    
    useEffect(() => {
      if (event.status === 'active') {
        opacity.value = withRepeat(
          withTiming(0.4, { duration: 1000 }),
          -1,
          true
        );
      } else {
        opacity.value = 0.6; // inactive indicator
      }
    }, [event.status]);
    
    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: opacity.value,
      };
    });

    // Рассчитываем общий прогресс как среднее значение всех условий
    const totalProgress = event.conditionsProgress.length > 0 
      ? Math.round(event.conditionsProgress.reduce((a, b) => a + b, 0) / event.conditionsProgress.length)
      : 0;
    
    return (
      <TouchableOpacity 
        style={styles.eventCard}
        onPress={() => router.push({
          pathname: '/event/[id]',
          params: { id: event.id }
        })}
        activeOpacity={0.7}
      >
        <View style={styles.eventInfo}>
          {event.status === 'active' && (
            <Animated.View style={[styles.activeNowContainer, { opacity: opacity }]}>
              <Animated.View 
                style={[
                  styles.statusIndicator,
                  styles.activeIndicator,
                  animatedStyle
                ]} 
              />
              <Animated.Text style={[styles.activeNowText, animatedStyle]}>
                Active Now
              </Animated.Text>
            </Animated.View>
          )}
          <ThemedText style={styles.eventName} numberOfLines={2}>{event.name}</ThemedText>
          
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${totalProgress}%` }]} />
          </View>
          <ThemedText style={styles.progressText}>{`Progress: ${totalProgress}%`}</ThemedText>
        </View>
        
        {event.imageUrl && (
          <ExpoImage 
            source={{ uri: event.imageUrl }}
            style={styles.eventImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
          />
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText style={{ marginTop: 10 }}>Loading events...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={{ color: 'red' }}>{error}</ThemedText>
      </ThemedView>
    );
  }

  if (events.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>You don't have any active events</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.mainSection}>
        <View style={styles.container}>
        {events.map(event => <EventCard key={event.id} event={event} />)}
        </View>
  </ThemedView>
  );
}

import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { router, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/lib/context/AuthContext';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { CustomButton } from '@/components/custom/button';
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedStyle } from 'react-native-reanimated';

// event data interface
interface EventInterface {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  progress: number; // 0-100
  imageUrl: string;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventInterface[]>([]);
  const [loading, setLoading] = useState(true);

  const borderColor = useThemeColor({}, 'divider');
  const textSecondary = useThemeColor({}, 'icon');
  const sectionBackground = useThemeColor({}, 'sectionBackground');
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const errorColor = useThemeColor({}, 'error');
  const surfaceColor = useThemeColor({}, 'surface');
  const placeholderColor = useThemeColor({}, 'placeholder');
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // const response = await fetch('/api/events');
        // const data = await response.json();
        
        // mock data
        const mockData: EventInterface[] = [
          { 
            id: '1', 
            name: "Top streamer donation", 
            status: 'active', 
            progress: 24, 
            imageUrl: 'https://media.istockphoto.com/id/639765496/vector/laughing-with-tears-and-pointing-emoticon.jpg?s=612x612&w=0&k=20&c=FVVZllgAwRnQkKmgyDLw4zepwzYc0WBCxOB9N4yFdL0=' 
          },
          { 
            id: '2', 
            name: "Supply for Indians and its children in Alabama", 
            status: 'active', 
            progress: 59, 
            imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR22yzBeNNNgqzdVmtp39c4uBoHKmlA0Ns2yQ&s' 
          },
          { 
            id: '3', 
            name: "Community Garden Project", 
            status: 'active', 
            progress: 3, 
            imageUrl: 'https://as1.ftcdn.net/v2/jpg/01/88/73/66/1000_F_188736680_y5kc5yEeUkGEJyiuNqoTww9Qou9uaaMO.jpg' 
          },
          { 
            id: '4', 
            name: "Charity Run for Animal Welfare Foundation", 
            status: 'inactive', 
            progress: 100, 
            imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS9CssmKfzuIknfJ1cCHwK-TN2WfEMeL-Adg&s' 
          },
        ];
        
        setTimeout(() => {
          setEvents(mockData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
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
      overflow: 'hidden',
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
    createEventButton: {
      padding: moderateScale(16),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    createEventIcon: {
      backgroundColor: primaryColor,
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: moderateScale(20),
      alignItems: 'center',
      justifyContent: 'center',
    },
    createEventText: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      flex: 1,
      marginLeft: horizontalScale(12),
    },
    eventCard: {
      flexDirection: 'row',
      padding: moderateScale(16),
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
    },
    eventInfo: {
      flex: 1,
      marginRight: horizontalScale(10),
    },
    activeNowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(4),
    },
    activeNowText: {
      fontSize: moderateScale(12),
      color: primaryColor,
      fontWeight: '500',
      marginLeft: horizontalScale(4),
    },
    statusIndicator: {
      width: moderateScale(8),
      height: moderateScale(8),
      borderRadius: moderateScale(4),
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
    eventImage: {
      width: moderateScale(70),
      height: moderateScale(70),
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
    progressText: {
      fontSize: moderateScale(12),
      color: textSecondary,
      marginTop: verticalScale(4),
    },
    loadingContainer: {
      padding: moderateScale(20),
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyListText: {
      textAlign: 'center',
      padding: moderateScale(20),
      color: textSecondary,
    },
  });
  
  // event card component with blinking indicator
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
    
    return (
      <TouchableOpacity 
        style={styles.eventCard}
        onPress={() => router.push({
          pathname: '/settings/detail',
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
            <View style={[styles.progressBar, { width: `${event.progress}%` }]} />
          </View>
          <ThemedText style={styles.progressText}>{`Progress: ${event.progress}%`}</ThemedText>
        </View>
        
        <Image 
          source={{ uri: event.imageUrl }} 
          style={styles.eventImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

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
          <ThemedView style={styles.mainSection}>
            <TouchableOpacity 
              style={styles.createEventButton}
              onPress={() => router.push('/events/create')}
              activeOpacity={0.7}
            >
              <View style={styles.createEventIcon}>
                <IconSymbol name="plus" size={24} color="white" />
              </View>
              <ThemedText style={styles.createEventText}>Create New Event</ThemedText>
              <IconSymbol name="chevron.right" size={20} color={textSecondary} />
            </TouchableOpacity>
          </ThemedView>
          
          {/* MY ACTIVE EVENTS SECTION */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>My Active Events</ThemedText>
          </View>
          <ThemedView style={styles.mainSection}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={primaryColor} />
                <ThemedText style={{ marginTop: 10 }}>Loading events...</ThemedText>
              </View>
            ) : events.length === 0 ? (
              <ThemedText style={styles.emptyListText}>
                You don't have any active events. Create or join a new one!
              </ThemedText>
            ) : (
              events.map(event => <EventCard key={event.id} event={event} />)
            )}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
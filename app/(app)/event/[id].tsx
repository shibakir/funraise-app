import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { useThemeColor } from '@/lib/hooks/ui';
import { moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useEventPage } from '@/lib/hooks/events';
import { useEventSubscriptions } from '@/lib/hooks/events';
import { useUserBalance } from '@/lib/hooks/users';

import { EventStatusInfo } from '@/components/showEvent/EventStatusInfo';
import { EventImage } from '@/components/showEvent/EventImage';
import { EventDepositPanel } from '@/components/showEvent/EventDepositPanel';
import { EventDescription } from '@/components/showEvent/EventDescription';
import { EventConditionsList } from '@/components/showEvent/EventConditionsList';
import { EventUsers } from '@/components/showEvent/EventUsers';
import { useTranslation } from 'react-i18next';
import {useAuth} from "@/lib/context/AuthContext";

export default function EventScreen() {
    const { t } = useTranslation();
    
    const { id } = useLocalSearchParams();
    const router = useRouter();
    
    const eventId = parseInt(id as string);
    const { 
        event, 
        loading, 
        error,
        eventStatus,
        bankAmount,
        type,
        recipientId,
        userId,
        isActive,
        isFinished,
    } = useEventPage(eventId);

    const { user, isAuthenticated } = useAuth();

    const [depositAmount, setDepositAmount] = useState(1);
    
    // State for tracking first load
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    // Subscriptions for event updates in real time
    useEventSubscriptions({
        eventId,
        onEventUpdated: (updatedEvent) => {
            //console.log('Event updated in real time:', updatedEvent);
        },
        onParticipationCreated: (participation) => {
            //console.log('New participation:', participation);
        },
        onParticipationUpdated: (participation) => {
            //console.log('Participation updated:', participation);
        }
    });

    useUserBalance({
        userId: (isAuthenticated && user?.id) ? user.id.toString() : null,
        enableSubscription: true,
        onBalanceUpdated: (updatedUser) => {
            //console.log('User balance updated:', updatedUser);
        }
    });
    
    // Ref for accessing methods of the EventDepositPanel component (for participation) (for participation)
    const depositPanelRef = useRef<{
        handleUpsertParticipation: () => Promise<void>;
        hasParticipation: boolean;
    } | null>(null);
    
    // Update flag for first load
    useEffect(() => {
        if (!loading && !initialLoadComplete) {
            setInitialLoadComplete(true);
        }
    }, [loading]);
    
    const handleDepositChange = (value: number) => {
        setDepositAmount(value);
    };
  
    const handleParticipationUpdated = () => {
        // Data is automatically updated through GraphQL subscriptions
        //console.log('Participation updated - data will be updated automatically');
    };
    
    // Event image press handler
    const handleImagePress = async () => {
        // Check if the event is active
        if (!isActive) {
            Alert.alert(t('alerts.eventCompleted'), t('alerts.eventNoLongerActive'));
            return;
        }

        // If the user is authenticated
        if (isAuthenticated && event && depositPanelRef.current) {
            // Single operation - the server will determine whether to create participation or update
            await depositPanelRef.current.handleUpsertParticipation();
        } else if (!isAuthenticated) {
            Alert.alert(t('auth.error'), t('alerts.mustBeLoggedIn'));
        }
    };

    const backgroundColor = useThemeColor({}, 'background');
    const primaryColor = useThemeColor({}, 'primary');
    const errorColor = useThemeColor({}, 'error');

    const headerBackground = useThemeColor({}, 'headerBackground');
    const headerText = useThemeColor({}, 'headerText');

    if (loading && !initialLoadComplete) {
        return (
        <View style={[styles.loadingContainer, { backgroundColor }]}>
            <ActivityIndicator size="large" color={primaryColor} />
            <ThemedText style={styles.loadingText}>Event loading...</ThemedText>
        </View>
        );
    }

    if (error || (!loading && !event)) {
        return (
            <View style={[styles.errorContainer, { backgroundColor }]}>
                <Ionicons name="alert-circle-outline" size={moderateScale(48)} color={errorColor} />
                <ThemedText style={styles.errorText}>
                    {error?.message || 'Event not found'}
                </ThemedText>
                <TouchableOpacity 
                    style={[styles.headerButton, { marginTop: verticalScale(16) }]}
                    onPress={() => router.back()}
                >
                    <ThemedText style={{ color: primaryColor }}>Go Back</ThemedText>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen
                options={{
                    title: event?.name || 'Event',
                    headerShown: true,
                    headerBackTitle: t('event.backTitle'),
                    headerStyle: { backgroundColor: headerBackground },
                    headerTitleStyle: { color: headerText },
                }}
            />      
            <ScrollView style={styles.scrollView} contentContainerStyle={{ flexGrow: 1 }}>
                {loading && initialLoadComplete && (
                    <View style={styles.refreshIndicator}>
                        <ActivityIndicator size="small" color={primaryColor} />
                    </View>
                )}
                
                {event && (
                    <>
                        <View style={styles.contentContainer}>
                            {/* Event status information */}
                            <EventStatusInfo 
                                bankAmount={bankAmount || 0}
                                status={eventStatus || 'IN_PROGRESS'}
                                isFinished={isFinished}
                                type={type || 'DONATION'}
                                recipient={event?.recipient}
                            />
                        </View>
                        
                        {/* Event image */}
                        <EventImage 
                            imageUrl={event.imageUrl} 
                            onPress={handleImagePress}
                            disabled={!isAuthenticated || !isActive}
                        />
                    
                        {/* Deposit section */}
                        {isAuthenticated && (
                            <View style={styles.depositContainer}>
                                <EventDepositPanel 
                                    ref={depositPanelRef}
                                    eventId={id as string}
                                    isEventActive={isActive}
                                    onDepositChange={handleDepositChange}
                                    onParticipationUpdated={handleParticipationUpdated}
                                />
                            </View>
                        )}
                            
                        <View style={styles.contentContainer}>
                            {/* Event description */}
                            <EventDescription description={event.description || ''} />

                            {/* Creator and recipient */}
                            <EventUsers 
                                userId={userId} 
                                recipientId={recipientId || ''}
                                creator={event?.creator}
                                recipient={event?.recipient}
                            />
                            
                            {/* Event conditions */}
                            <EventConditionsList
                                endConditions={event.endConditions || []}
                            />
                        </View>
                    </>
                )}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: moderateScale(16),
        paddingVertical: moderateScale(8),
    },
    depositContainer: {
        marginHorizontal: moderateScale(16),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: verticalScale(10),
        fontSize: moderateScale(16),
    },
    refreshIndicator: {
        alignItems: 'center',
        paddingVertical: verticalScale(10),
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: moderateScale(20),
    },
    errorText: {
        fontSize: moderateScale(16),
        textAlign: 'center',
    },
    headerButton: {
        padding: moderateScale(8),
    },
}); 
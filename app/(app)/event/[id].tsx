import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useEventDetails } from '@/lib/hooks/useEventDetails';
import { useAuth } from '@/lib/context/AuthContext';

import { EventStatusInfo, EventStatusInfoHandle } from '@/components/showEvent/EventStatusInfo';
import { EventImage } from '@/components/showEvent/EventImage';
import { EventDepositPanel } from '@/components/showEvent/EventDepositPanel';
import { EventDescription } from '@/components/showEvent/EventDescription';
import { EventConditionsList, EventConditionsListHandle } from '@/components/showEvent/EventConditionsList';
import { EventUsers } from '@/components/showEvent/EventUsers';
import { useTranslation } from 'react-i18next';

export default function EventScreen() {
    const { t } = useTranslation();
    
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { event, loading, error, refresh } = useEventDetails(id as string);
    const { user, isAuthenticated } = useAuth();
    
    console.log('event', event);

    const [depositAmount, setDepositAmount] = useState(1);
    
    // Состояние для отслеживания первой загрузки
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    
    // Реф для доступа к методам компонента EventDepositPanel
    const depositPanelRef = useRef<{
        handleCreateParticipation: () => Promise<void>;
        handleUpdateParticipation: () => Promise<void>;
        hasParticipation: boolean;
    } | null>(null);
    
    // Реф для доступа к методам компонента EventStatusInfo
    const statusInfoRef = useRef<EventStatusInfoHandle>(null);

    // Реф для доступа к методам компонента EventConditionsList
    const conditionsListRef = useRef<EventConditionsListHandle>(null);
    
    // Обновляем флаг первой загрузки
    useEffect(() => {
        if (!loading && !initialLoadComplete) {
            setInitialLoadComplete(true);
        }
    }, [loading]);
    
    const handleDepositChange = (value: number) => {
        setDepositAmount(value);
    };
  
    const handleParticipationUpdated = () => {
        refresh();
        // Обновляем информацию о банке события
        if (statusInfoRef.current) {
            statusInfoRef.current.refresh();
        }
        // Обновляем информацию об условиях события
        if (conditionsListRef.current) {
            conditionsListRef.current.refresh();
        }
    };
    
    // Обработчик нажатия на изображение события
    const handleImagePress = async () => {
        // Если пользователь авторизован
        if (isAuthenticated && event && depositPanelRef.current) {
            if (depositPanelRef.current.hasParticipation) {
                // Если уже есть участие, обновляем его
                await depositPanelRef.current.handleUpdateParticipation();
            } else {
                // Если участия еще нет, создаем новое
                await depositPanelRef.current.handleCreateParticipation();
            }
        } else if (!isAuthenticated) {
            Alert.alert('Error', 'You must be logged in to participate');
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
                    {error || 'Event not found'}
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
                            {/* Информация о статусе события */}
                            <EventStatusInfo 
                                ref={statusInfoRef}
                                eventId={id as string} 
                            />
                        </View>
                        
                        {/* Изображение события */}
                        <EventImage 
                            imageUrl={event.imageUrl} 
                            onPress={handleImagePress}
                            disabled={!isAuthenticated}
                        />
                    
                        {/* Секция для внесения депозита */}
                        {isAuthenticated && event.status === 'active' && (
                            <View style={styles.depositContainer}>
                                <EventDepositPanel 
                                    ref={depositPanelRef}
                                    eventId={id as string}
                                    onDepositChange={handleDepositChange}
                                    onParticipationUpdated={handleParticipationUpdated}
                                />
                            </View>
                        )}
                            
                        <View style={styles.contentContainer}>
                            {/* Описание события */}
                            <EventDescription description={event.description} />

                            {/* Создатель и получатель */}
                            <EventUsers 
                                userId={event.userId} 
                                recipientId={event.recipientId} 
                            />
                            
                            {/* Условия события */}
                            <EventConditionsList
                                ref={conditionsListRef} 
                                eventId={id as string} 
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
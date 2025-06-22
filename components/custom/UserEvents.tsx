import React, { useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';

import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { useThemeColor } from '@/lib/hooks/ui';
import { useUser } from '@/lib/hooks/users';
import { useRefreshableData } from '@/lib/hooks/data';
import { moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { EventStatus } from '@/lib/graphql';
import type { Event } from '@/lib/graphql/types';
import { EventCard } from '@/components/custom/EventCard';
import { useTranslation } from 'react-i18next';

interface UserEventsProps {
    limit?: number;
    userId: string;
    eventType?: 'created' | 'participating';
    showOnlyActive?: boolean;
}

export function UserEvents({ limit = 5, userId, eventType, showOnlyActive = false }: UserEventsProps) {
    const { t } = useTranslation();
    
    // If there is no userId, don't show anything
    if (!userId || userId.trim() === '') {
        return null;
    }
    
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
        return null;
    }
    
    const { user, loading: isLoading, error: graphqlError, refetch } = useUser(userIdNum);
    
    const borderColor = useThemeColor({}, 'divider');
    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const primaryColor = useThemeColor({}, 'primary');
    const errorColor = useThemeColor({}, 'error');

    const error = graphqlError || null;

    const processedEvents = useMemo((): Event[] => {
        if (!user) return [];

        let userEvents: Event[] = [];

        switch (eventType) {
            case 'created':
                // create a copy of the array to avoid changing the read-only array from GraphQL
                userEvents = [...(user.createdEvents || [])];
                break;
            case 'participating':
                // create a copy of the array to avoid changing the read-only array from GraphQL
                userEvents = [...(user.receivedEvents || [])];
                break;
            default:
                userEvents = [
                    ...(user.createdEvents || []),
                    ...(user.receivedEvents || []),
                    ...(user.events || [])
                ];
                
                const uniqueEventsMap = new Map();
                userEvents.forEach(event => {
                    uniqueEventsMap.set(event.id, event);
                });
                userEvents = Array.from(uniqueEventsMap.values());
                break;
        }

        // Filter only active events if the showOnlyActive parameter is true
        if (showOnlyActive) {
            userEvents = userEvents.filter(event => event.status === EventStatus.IN_PROGRESS);
        }

        userEvents.sort((a, b) => b.id - a.id);

        return userEvents.slice(0, limit);
    }, [user, eventType, limit, showOnlyActive]);

    useRefreshableData({
        key: `user-events-${userId}-${eventType || 'all'}`,
        onRefresh: async () => {
            await refetch();
        },
        dependencies: [userId, limit, eventType]
    });

    const styles = StyleSheet.create({
        mainSection: {
            backgroundColor: sectionBackground,
            borderRadius: moderateScale(14),
            marginBottom: verticalScale(16),
            overflow: 'hidden',
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
        loadMoreButton: {
            padding: moderateScale(16),
            alignItems: 'center',
            justifyContent: 'center',
            borderTopWidth: 1,
            borderTopColor: borderColor,
        },
        loadMoreText: {
            fontSize: moderateScale(16),
            fontWeight: '500',
            color: primaryColor,
        },
    });

    const LoadMoreButton = () => {
        return null;
    };

    if (isLoading && processedEvents.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={primaryColor} />
                <ThemedText style={{ marginTop: 10 }}>{t('userEvents.loading', 'Loading events...')}</ThemedText>
            </View>
        );
    }
    
    if (error && processedEvents.length === 0) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText style={{ color: errorColor, padding: moderateScale(16) }}>
                    {t('userEvents.error', 'Error')}: {error}
                </ThemedText>
                <TouchableOpacity 
                    style={[styles.loadMoreButton, { backgroundColor: primaryColor }]}
                    onPress={() => refetch()}
                >
                    <ThemedText style={[styles.loadMoreText, { color: 'white' }]}>
                        {t('userEvents.retry', 'Retry')}
                    </ThemedText>
                </TouchableOpacity>
            </ThemedView>
        );
    }
    
    if (processedEvents.length === 0) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText style={{ padding: moderateScale(16) }}>
                    {t('userEvents.noEvents', 'No user events found')}
                </ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.mainSection}>
            <View style={styles.container}>
                {processedEvents.map(event => 
                    <EventCard key={event.id} event={event} />
                )}
                <LoadMoreButton />
            </View>
        </ThemedView>
    );
}

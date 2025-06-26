import React, { useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';

import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { useThemeColor } from '@/lib/hooks/ui';
import { moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useEvents } from '@/lib/hooks/events';
import type { Event } from '@/lib/graphql/types';
import { EventCard } from '@/components/custom/EventCard';
import { useRefreshableData } from '@/lib/hooks/data';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/context/AuthContext';

interface AllEventsProps {
    limit?: number;
}

export function AllEvents({ limit = 5 }: AllEventsProps) {
    const { t } = useTranslation();
    const { user } = useAuth();
    
    // If there is no user or userId, don't show anything
    if (!user?.id) {
        return null;
    }
    
    const { events: allEvents, loading: isLoading, error: graphqlError, refetch } = useEvents();
    
    const borderColor = useThemeColor({}, 'divider');
    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const primaryColor = useThemeColor({}, 'primary');
    const errorColor = useThemeColor({}, 'error');

    const error = graphqlError || null;
    const userId = String(user.id);

    const processedEvents = useMemo((): Event[] => {
        // create a copy of allEvents
        let filtered = [...allEvents];
        // sort by
        filtered.sort((a, b) => b.id - a.id);
        return filtered.slice(0, limit);
    }, [allEvents, limit]);

    // register component in the refresh system for pull-to-refresh
    useRefreshableData({
        key: `all-events-${userId}-${limit}`,
        onRefresh: async () => {
            await refetch();
        },
        dependencies: [userId, limit]
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
                <ThemedText style={{ marginTop: 10 }}>{t('allEvents.loading', 'Loading events...')}</ThemedText>
            </View>
        );
    }
    
    if (error && processedEvents.length === 0) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText style={{ color: errorColor, padding: moderateScale(16) }}>
                    {t('allEvents.error', 'Error')}: {error}
                </ThemedText>
                <TouchableOpacity 
                    style={[styles.loadMoreButton, { backgroundColor: primaryColor }]}
                    onPress={() => refetch()}
                >
                    <ThemedText style={[styles.loadMoreText, { color: 'white' }]}>
                        {t('allEvents.retry', 'Retry')}
                    </ThemedText>
                </TouchableOpacity>
            </ThemedView>
        );
    }
    
    if (processedEvents.length === 0) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText style={{ padding: moderateScale(16) }}>
                    {t('allEvents.noEvents', 'No other events found')}
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
import React, { useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';

import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useAllEvents } from '@/lib/hooks/useAllEvents';
import { EventCard, EventInterface } from '@/components/custom/EventCard';

interface AllEventsProps {
    limit?: number;
    userId?: string;
}

export function AllEvents({ limit = 5, userId = '' }: AllEventsProps) {
    const { events, isLoading, error, hasMore, fetchEvents, resetEvents } = useAllEvents();
    const borderColor = useThemeColor({}, 'divider');
    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const primaryColor = useThemeColor({}, 'primary');
    const errorColor = useThemeColor({}, 'error');

    // Загружаем данные при первом рендере компонента
    useEffect(() => {
        fetchEvents(userId, limit);
    }, [userId]);

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
        if (!hasMore) {
            return null;
        }
            
        return (
            <TouchableOpacity 
                style={styles.loadMoreButton}
                onPress={() => fetchEvents(userId, limit)}
                activeOpacity={0.7}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={primaryColor} />
                ) : (
                    <ThemedText style={styles.loadMoreText}>Show More</ThemedText>
                )}
            </TouchableOpacity>
        );
    };

    if (isLoading && events.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={primaryColor} />
                <ThemedText style={{ marginTop: 10 }}>Loading events...</ThemedText>
            </View>
        );
    }
    if (error && events.length === 0) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText style={{ color: errorColor }}>{error}</ThemedText>
            </ThemedView>
        );
    }
    if (events.length === 0) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>No other events found</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.mainSection}>
        <View style={styles.container}>
            {events.map(event => <EventCard key={event.id} event={event} />)}
            <LoadMoreButton />
        </View>
        </ThemedView>
    );
} 
import React, { useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useEventStatus } from '@/lib/hooks/useEventStatus';

export interface EventStatusInfoHandle {
    refresh: () => void;
}

interface EventStatusInfoProps {
    eventId: string;
}

const eventTypes = [
    {
        id: 'DONATION',
        title: 'Donation',
    },
    {
        id: 'FUNDRAISING',
        title: 'Fundraising',
    },
    {
        id: 'JACKPOT',
        title: 'Jackpot',
    }
];

export const EventStatusInfo = forwardRef<EventStatusInfoHandle, EventStatusInfoProps>(({ eventId }, ref) => {
    const { bankAmount, eventStatus, type, recipientId, loading, error, refresh } = useEventStatus(eventId);
    
    const primaryColor = useThemeColor({}, 'primary');
    const cardColor = useThemeColor({}, 'card');
    const errorColor = useThemeColor({}, 'error');
    
    useImperativeHandle(ref, () => ({
        refresh
    }));

    if (error) {
        return (
            <ThemedView style={[styles.container, { backgroundColor: cardColor }]}>
                <ThemedText style={{ color: errorColor }}>{error}</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={[styles.container, { backgroundColor: cardColor }]}>
        <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Event Type:</ThemedText>
            <ThemedText style={[styles.value, { color: primaryColor }]}>
                {eventTypes.find(t => t.id === type)?.title || 'Unknown'}
            </ThemedText>
        </View>
        <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Event Status:</ThemedText>
            <ThemedText style={[styles.value, { color: primaryColor }]}>
                {eventStatus === 'completed' ? 'Completed' : 'Active'}
            </ThemedText>
        </View>
        <View style={styles.infoRow}>
            <ThemedText style={styles.label}>
                {eventStatus === 'completed' ? 'Final Bank Amount:' : 'Current Bank Amount:'}
            </ThemedText>
            <ThemedText style={[styles.value, { color: primaryColor }]}>
                ${bankAmount.toFixed(2) || '0.00'}
            </ThemedText>
            {eventStatus === 'completed' && recipientId && (
                <ThemedText style={styles.label}>
                    Recipient: {recipientId}
                </ThemedText>
            )}
        </View>
        </ThemedView>
    );
});

const styles = StyleSheet.create({
    container: {
        padding: moderateScale(16),
        borderRadius: moderateScale(12),
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: verticalScale(80),
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: moderateScale(8),
    },
    label: {
        fontSize: moderateScale(16),
        fontWeight: '600',
    },
    value: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
    },
}); 
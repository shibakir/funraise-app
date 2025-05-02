import React, { useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useEventStatus } from '@/lib/hooks/useEventStatus';
import { router } from 'expo-router';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { useTranslation } from 'react-i18next';

export interface EventStatusInfoHandle {
    refresh: () => void;
}

interface EventStatusInfoProps {
    eventId: string;
}

export const EventStatusInfo = forwardRef<EventStatusInfoHandle, EventStatusInfoProps>(({ eventId }, ref) => {

    const { t } = useTranslation();

    const eventTypes = [
        { id: 'DONATION', title: t('event.eventType.donation') },
        { id: 'FUNDRAISING', title: t('event.eventType.fundraising') },
        { id: 'JACKPOT', title: t('event.eventType.jackpot') },
    ];
    
    const { bankAmount, eventStatus, type, recipientId, loading, error, refresh } = useEventStatus(eventId);
    const { user: recipient, loading: recipientLoading, error: recipientError } = useUserInfo(recipientId);
    
    const primaryColor = useThemeColor({}, 'primary');
    const cardColor = useThemeColor({}, 'card');
    const errorColor = useThemeColor({}, 'error');
    const backgroundColor = useThemeColor({}, 'background');
    
    useImperativeHandle(ref, () => ({
        refresh
    }));

    const navigateToUserProfile = (id: string) => {
        router.push(`/profile/${id}`);
    };

    const navigateToDocumentation = () => {
        router.push('/documentation');
    };

    if (error) {
        return (
            <ThemedView style={[styles.container, { backgroundColor: cardColor }]}>
                <ThemedText style={{ color: errorColor, textAlign: 'center' }}>{error}</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={[styles.container, { backgroundColor: cardColor }]}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={navigateToDocumentation} activeOpacity={0.7}>
                        <ThemedText style={[styles.headerText, { color: primaryColor }]}>
                            {eventTypes.find(t => t.id === type)?.title || t('event.eventType.unknown')} Event
                        </ThemedText>
                    </TouchableOpacity>
                    <ThemedView style={[styles.statusBadge, { backgroundColor: primaryColor + '20' }]}>
                        <ThemedText style={[styles.statusText, { color: primaryColor }]}>
                            {eventStatus === 'completed' ? t('event.status.completed') : t('event.status.active')}
                        </ThemedText>
                    </ThemedView>
                </View>
                
                <ThemedView style={[styles.amountContainer, { backgroundColor: backgroundColor }]}>
                    <ThemedText style={styles.amountLabel}>
                        {eventStatus === 'completed' ? t('event.finalbankAmount') : t('event.currentbankAmount')}
                    </ThemedText>
                    <ThemedText style={[styles.amountValue, { color: primaryColor }]}>
                        ${bankAmount.toFixed(2) || '0.00'}
                    </ThemedText>
                </ThemedView>
                
                {eventStatus === 'completed' && recipientId && (
                    <TouchableOpacity 
                        style={[styles.recipientCard, { backgroundColor: backgroundColor }]} 
                        onPress={() => navigateToUserProfile(recipient?.id || '')}
                        activeOpacity={0.7}
                    >
                        <ThemedText style={styles.recipientLabel}>{t('event.recipientLabel')}</ThemedText>
                        <View style={styles.userRow}>
                            {recipient?.image ? (
                                <Image 
                                    source={{ uri: recipient.image }} 
                                    style={styles.userImage} 
                                />
                            ) : (
                                <View style={[styles.userImagePlaceholder, { backgroundColor: primaryColor + '30' }]}>
                                    <ThemedText style={[styles.placeholderText, { color: primaryColor }]}>
                                        {recipient?.username?.charAt(0)?.toUpperCase() || '?'}
                                    </ThemedText>
                                </View>
                            )}
                            <View style={styles.userInfo}>
                                <ThemedText style={styles.username}>{recipient?.username}</ThemedText>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </ThemedView>
    );
});

const styles = StyleSheet.create({
    container: {
        borderRadius: moderateScale(16),
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        paddingHorizontal: moderateScale(16),
        paddingVertical: moderateScale(16),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: moderateScale(16),
    },
    headerText: {
        fontSize: moderateScale(18),
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: horizontalScale(10),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(12),
    },
    statusText: {
        fontSize: moderateScale(14),
        fontWeight: '600',
    },
    amountContainer: {
        padding: moderateScale(16),
        borderRadius: moderateScale(12),
        marginBottom: moderateScale(16),
    },
    amountLabel: {
        fontSize: moderateScale(14),
        fontWeight: '500',
        marginBottom: verticalScale(4),
    },
    amountValue: {
        fontSize: moderateScale(24),
        fontWeight: 'bold',
    },
    recipientCard: {
        padding: moderateScale(16),
        borderRadius: moderateScale(12),
    },
    recipientLabel: {
        fontSize: moderateScale(14),
        fontWeight: '500',
        marginBottom: verticalScale(8),
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userImage: {
        width: moderateScale(28),
        height: moderateScale(28),
        borderRadius: moderateScale(24),
        marginRight: moderateScale(12),
    },
    userImagePlaceholder: {
        width: moderateScale(28),
        height: moderateScale(28),
        borderRadius: moderateScale(24),
        marginRight: moderateScale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: moderateScale(16),
        fontWeight: '600',
    },
}); 
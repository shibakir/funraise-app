import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { useThemeColor } from '@/lib/hooks/ui';
import { horizontalScale, moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { User, EventStatus } from '@/lib/graphql/types';

interface EventStatusInfoProps {
    bankAmount: number;
    status: EventStatus;
    isFinished: boolean;
    type: string;
    recipient?: User;
}

export const EventStatusInfo: React.FC<EventStatusInfoProps> = ({ 
    bankAmount,
    status,
    isFinished,
    type,
    recipient
}) => {

    const { t } = useTranslation();

    const eventTypes = [
        { id: 'DONATION', title: t('event.eventType.donation') },
        { id: 'FUNDRAISING', title: t('event.eventType.fundraising') },
        { id: 'JACKPOT', title: t('event.eventType.jackpot') },
    ];
    
    const primaryColor = useThemeColor({}, 'primary');
    const cardColor = useThemeColor({}, 'card');
    const backgroundColor = useThemeColor({}, 'background');

    const navigateToUserProfile = (id: string) => {
        router.push(`/profile/${id}`);
    };

    const navigateToDocumentation = () => {
        router.push('/documentation');
    };

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
                            {status === EventStatus.IN_PROGRESS ? t('event.status.active') : status === EventStatus.FINISHED ? t('event.status.completed') : t('event.status.failed')}
                        </ThemedText>
                    </ThemedView>
                </View>
                
                <ThemedView style={[styles.amountContainer, { backgroundColor: backgroundColor }]}>
                    <ThemedText style={styles.amountLabel}>
                        {!isFinished ? t('event.currentbankAmount') : t('event.finalbankAmount')}
                    </ThemedText>
                    <ThemedText style={[styles.amountValue, { color: primaryColor }]}>
                        ${bankAmount.toFixed(2) || '0.00'}
                    </ThemedText>
                </ThemedView>
                
                {isFinished && recipient && (
                    <TouchableOpacity 
                        style={[styles.recipientCard, { backgroundColor: backgroundColor }]} 
                        onPress={() => navigateToUserProfile(recipient.id.toString())}
                        activeOpacity={0.7}
                    >
                        <ThemedText style={styles.recipientLabel}>{t('event.recipientLabel')}</ThemedText>
                        <View style={styles.userRow}>
                            {recipient.image ? (
                                <Image 
                                    source={{ uri: recipient.image }} 
                                    style={styles.userImage} 
                                />
                            ) : (
                                <View style={[styles.userImagePlaceholder, { backgroundColor: primaryColor + '30' }]}>
                                    <ThemedText style={[styles.placeholderText, { color: primaryColor }]}>
                                        {recipient.username.charAt(0).toUpperCase()}
                                    </ThemedText>
                                </View>
                            )}
                            <View style={styles.userInfo}>
                                <ThemedText style={styles.username}>{recipient.username}</ThemedText>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </ThemedView>
    );
};

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

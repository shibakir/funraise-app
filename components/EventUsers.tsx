import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
interface EventUsersProps {
    userId: string;
    recipientId: string;
}

export const EventUsers: React.FC<EventUsersProps> = ({ userId, recipientId }) => {
    const { t } = useTranslation();
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const { user: creator, loading: creatorLoading, error: creatorError } = useUserInfo(userId);
    const { user: recipient, loading: recipientLoading, error: recipientError } = useUserInfo(recipientId);

    const navigateToUserProfile = (id: string) => {
        router.push(`/profile/${id}`);
    };

    if (creatorLoading || recipientLoading) {
        return (
            <ThemedView style={[styles.container, { backgroundColor: cardColor }]}>
                <ThemedText style={styles.text}>{t('event.loading')}</ThemedText>
            </ThemedView>
        );
    }

    if (creatorError || recipientError) {
        return (
            <ThemedView style={[styles.container, { backgroundColor: cardColor }]}>
                <ThemedText style={styles.text}>{t('event.errorLoadingUserInfo')}</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={[styles.container, { backgroundColor: cardColor }]}>
            <ThemedText style={styles.title}>{t('event.associatedUsers')}</ThemedText>
            
            <TouchableOpacity 
                style={styles.userRow} 
                onPress={() => navigateToUserProfile(creator?.id || '')}
            >
                {creator?.image ? (
                    <Image 
                        source={{ uri: creator.image }} 
                        style={styles.userImage} 
                    />
                ) : (
                    <View style={[styles.userImagePlaceholder, { backgroundColor: textColor + '20' }]}>
                        <ThemedText style={styles.placeholderText}>
                            {creator?.username?.charAt(0)?.toUpperCase() || '?'}
                        </ThemedText>
                    </View>
                )}
                <View style={styles.userInfo}>
                    <ThemedText style={styles.text}>{t('event.creator')}: {creator?.username}</ThemedText>
                </View>
            </TouchableOpacity>
            
            {recipientId && recipient && (
                <TouchableOpacity 
                    style={styles.userRow} 
                    onPress={() => navigateToUserProfile(recipient?.id || '')}
                >
                    {recipient?.image ? (
                        <Image 
                            source={{ uri: recipient.image }} 
                            style={styles.userImage} 
                        />
                    ) : (
                        <View style={[styles.userImagePlaceholder, { backgroundColor: textColor + '20' }]}>
                            <ThemedText style={styles.placeholderText}>
                                {recipient?.username?.charAt(0)?.toUpperCase() || '?'}
                            </ThemedText>
                        </View>
                    )}
                    <View style={styles.userInfo}>
                        <ThemedText style={styles.text}>{t('event.recipient')}: {recipient?.username}</ThemedText>
                    </View>
                </TouchableOpacity>
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: moderateScale(16),
        borderRadius: moderateScale(12),
        marginBottom: verticalScale(24),
    },
    title: {
        fontSize: moderateScale(18),
        fontWeight: '600',
        marginBottom: verticalScale(16),
    },
    text: {
        fontWeight: '200',
        fontSize: moderateScale(16),
        lineHeight: moderateScale(24),
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(8),
        borderRadius: moderateScale(8),
    },
    userImage: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        marginRight: moderateScale(12),
    },
    userImagePlaceholder: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
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
}); 
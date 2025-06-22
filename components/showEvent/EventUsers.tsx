import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { useThemeColor } from '@/lib/hooks/ui';
import { moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useUser } from '@/lib/hooks/users';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { User } from '@/lib/graphql/types';

interface EventUsersProps {
    userId: string;
    recipientId: string;
    creator?: User | null;
    recipient?: User | null;
}

export const EventUsers: React.FC<EventUsersProps> = ({ 
    userId, 
    recipientId,
    creator: graphqlCreator,
    recipient: graphqlRecipient
}) => {
    const { t } = useTranslation();
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    
    const { user: restCreator, loading: creatorLoading, error: creatorError } = useUser(
        graphqlCreator ? null : userId
    );
    const { user: restRecipient, loading: recipientLoading, error: recipientError } = useUser(
        graphqlRecipient ? null : recipientId
    );
    
    const creator = graphqlCreator || restCreator;
    const recipient = graphqlRecipient || restRecipient;
    const loading = (graphqlCreator ? false : creatorLoading) || (graphqlRecipient ? false : recipientLoading);
    const error = creatorError || recipientError;

    const navigateToUserProfile = (id: string) => {
        router.push(`/profile/${id}`);
    };

    if (loading && !graphqlCreator && !graphqlRecipient) {
        return (
            <ThemedView style={[styles.container, { backgroundColor: cardColor }]}>
                <ThemedText style={styles.text}>{t('event.loading')}</ThemedText>
            </ThemedView>
        );
    }

    if (error && !graphqlCreator && !graphqlRecipient) {
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
                onPress={() => navigateToUserProfile(creator?.id?.toString() || '')}
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
                    onPress={() => navigateToUserProfile(recipient?.id?.toString() || '')}
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
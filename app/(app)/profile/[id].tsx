import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Dimensions, TouchableOpacity, Text } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { UserEvents } from '@/components/custom/UserEvents';
import { UserAchievements } from '@/components/custom/UserAchievements';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {

    const { t } = useTranslation();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [activeSection, setActiveSection] = useState('createdEvents');
    const { profile, loading, error } = useUserProfile(id);

    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'divider');

    const navigationSections = [
        { key: 'createdEvents', title: t('profile.createdEvents'), emoji: '🎉' },
        { key: 'WinnedEvents', title: t('profile.winnedEvents'), emoji: '🔥' },
        { key: 'achievements', title: t('profile.achievements'), emoji: '🏆' },
        { key: 'participatingEvents', title: t('profile.participatingEvents'), emoji: '👥' },
    ];
    const setSection = (sectionName) => {
        setActiveSection(sectionName);
    };

    if (loading || !profile) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={primaryColor} />
            </ThemedView>
        );
    }
    if (error) {
        return (
            <ThemedView style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ProfileHeader 
                user={profile.user} 
                balance={profile.balance} 
            />
            <ThemedView style={[styles.stickyNav, { borderBottomColor: borderColor }]}>
                <View style={styles.navContainer}>
                    {navigationSections.map(section => (
                        <TouchableOpacity 
                            key={section.key}
                            style={[
                                styles.navItem, 
                                { width: SCREEN_WIDTH / navigationSections.length },
                                activeSection === section.key && { 
                                    borderBottomColor: primaryColor, 
                                    borderBottomWidth: 2 
                                }
                            ]} 
                            onPress={() => setSection(section.key)}
                        >
                            <Text style={styles.emojiText}>{section.emoji}</Text>
                            <ThemedText 
                                style={[
                                    styles.navText, 
                                    activeSection === section.key && { color: primaryColor }
                                ]}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {section.title}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>
            </ThemedView>
                        
            <ScrollView style={styles.scrollView}>
                {/* Отображаем только активную секцию */}
                {activeSection === 'achievements' && (
                    <View style={styles.section}>
                        <View style={styles.sectionContent}>
                            <UserAchievements userId={id} />
                        </View>
                    </View>
                )}

                {activeSection === 'createdEvents' && (
                    <View style={styles.section}>
                        <View style={styles.sectionContent}>
                            <UserEvents userId={id} eventType="created" />
                        </View>
                    </View>
                )}

                {activeSection === 'participatingEvents' && (
                    <View style={styles.section}>
                        <View style={styles.sectionContent}>
                            <UserEvents userId={id} eventType="participating" />
                        </View>
                    </View>
                )}
            </ScrollView>
        </ThemedView>
    );
}

function ProfileHeader({ user, balance }) {
    const { t } = useTranslation();
    
    const borderColor = useThemeColor({}, 'divider');
    const placeholderColor = useThemeColor({}, 'placeholder');
    const headerBackground = useThemeColor({}, 'headerBackground');
    const headerText = useThemeColor({}, 'headerText');
    
    return (
        <ThemedView style={[styles.headerContainer, { borderBottomColor: borderColor }]}>
            <Stack.Screen
                options={{
                title: t('profile.title'),
                headerShown: true,
                headerBackTitle: t('profile.backTitle'),
                headerStyle: { backgroundColor: headerBackground },
                headerTitleStyle: { color: headerText },
                }}
            /> 
            <View style={styles.profileHeader}>
                <Image
                    source={user.image ? { uri: user.image } : require('@/assets/images/logo.png')}
                    style={styles.avatar}
                    contentFit="cover"
                />
                <View style={styles.userInfoContainer}>
                    <ThemedText style={styles.username}>{user.username}</ThemedText>

                    <View style={styles.balanceContainer}>
                        <IconSymbol name="banknote" size={26} color={placeholderColor} />
                        <ThemedText style={styles.balanceText}>
                            {`$ ${balance.toFixed(2)}`}
                        </ThemedText>
                    </View>
                </View>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    headerContainer: {
        padding: moderateScale(20),
        borderBottomWidth: 1,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: moderateScale(80),
        height: moderateScale(80),
        borderRadius: moderateScale(40),
        marginRight: horizontalScale(20),
    },
    userInfoContainer: {
        flex: 1,
    },
    username: {
        fontSize: moderateScale(24),
        fontWeight: 'bold',
        marginBottom: verticalScale(4),
    },
    balanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    balanceText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        marginLeft: horizontalScale(6),
    },
    stickyNav: {
        borderBottomWidth: 1,
        backgroundColor: 'transparent',
    },
    navContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    navItem: {
        padding: moderateScale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    navText: {
        fontSize: moderateScale(14),
        fontWeight: '500',
        marginTop: verticalScale(4),
        textAlign: 'center',
    },
    emojiText: {
        fontSize: moderateScale(20),
    },
    scrollView: {
        flex: 1,
    },
    section: {
        marginBottom: verticalScale(20),
    },
    sectionContent: {
        padding: moderateScale(16),
    },
    noContentText: {
        textAlign: 'center',
        padding: moderateScale(20),
        fontSize: moderateScale(16),
    },
});

import React from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, TouchableOpacity, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { useAuth } from '@/lib/context/AuthContext';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { useTranslation } from 'react-i18next';

interface SettingItemProps {
    icon: string;
    title: string;
    description: string;
    showChevron?: boolean;
    onPress?: () => void;
}

export default function SettingsScreen() {
    const { user, logout, isAuthenticated } = useAuth();
    const { t } = useTranslation();

    const borderColor = useThemeColor({}, 'divider');
    const textSecondary = useThemeColor({}, 'icon');
    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const headerBackground = useThemeColor({}, 'headerBackground');
    const headerText = useThemeColor({}, 'headerText');
        
    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        contentContainer: {
            padding: moderateScale(16),
            paddingBottom: verticalScale(80),
        },
        mainSection: {
            backgroundColor: sectionBackground,
            borderRadius: moderateScale(16),
            
            overflow: 'hidden',
        },
        section: {
            borderRadius: moderateScale(8),
            overflow: 'hidden',
        },
        sectionHeader: {
            marginTop: verticalScale(20),
            paddingVertical: verticalScale(12),
        },
        sectionTitle: {
            fontSize: moderateScale(20),
            fontWeight: '600',
            marginBottom: verticalScale(4),
        },
        userHeader: {
            flexDirection: 'row',
            paddingHorizontal: moderateScale(16),
            paddingVertical: verticalScale(16),
            alignItems: 'center',
        },
        avatar: {
            width: moderateScale(48),
            height: moderateScale(48),
            borderRadius: moderateScale(24),
            backgroundColor: '#0366d6',
            alignItems: 'center',
            justifyContent: 'center',
        },
        avatarText: {
            color: 'white',
            fontSize: moderateScale(20),
            fontWeight: 'bold',
        },
        userInfo: {
            marginLeft: horizontalScale(12),
        },
        userName: {
            fontSize: moderateScale(16),
            fontWeight: 'bold',
        },
        userEmail: {
            fontSize: moderateScale(14),
            opacity: 0.7,
        },
        settingItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: moderateScale(16),
            paddingVertical: verticalScale(12),
            borderBottomColor: borderColor,
        },
        iconContainer: {
            width: moderateScale(30),
            alignItems: 'center',
            justifyContent: 'center',
        },
        settingContent: {
            flex: 1,
            marginLeft: horizontalScale(12),
        },
        settingTitle: {
            fontSize: moderateScale(14),
            fontWeight: '500',
        },
        settingDescription: {
            fontSize: moderateScale(12),
            opacity: 0.7,
        },
        profileButton: {
            paddingVertical: verticalScale(12),
            paddingHorizontal: horizontalScale(20),
            borderRadius: moderateScale(16),
            alignItems: 'center',
            marginTop: verticalScale(16),
            backgroundColor: sectionBackground,
        },
        profileButtonText: {
            fontSize: moderateScale(16),
            fontWeight: '600',
        },
    });
    
    const handleLogout = async () => {
        Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Logout', 
                style: 'destructive',
                onPress: async () => {
                    try {
                    await logout();
                    } catch (error) {
                    console.error('Error during logout:', error);
                    }
                } 
            },
        ]
        );
    };
    
    const SettingItem: React.FC<SettingItemProps> = ({ 
        icon, 
        title, 
        description,
        showChevron = true,
        onPress
    }) => (
        <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: borderColor }]} 
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <IconSymbol name={icon as any} size={22} color={textSecondary} />
            </View>
            <View style={styles.settingContent}>
                <ThemedText style={styles.settingTitle}>{title}</ThemedText>
                {description && (
                <ThemedText style={styles.settingDescription}>{description}</ThemedText>
                )}
            </View>
            {showChevron && (
                <IconSymbol name="chevron.right" size={20} color={textSecondary} />
            )}
        </TouchableOpacity>
    );

    return (
        <>
            <Stack.Screen 
                options={{ 
                    title: t('settings.title'),
                    headerShown: true,
                    headerStyle: { backgroundColor: headerBackground },
                    headerTitleStyle: { color: headerText },
                }} 
            />
            <SafeAreaView style={styles.container}>
                <ThemedView style={styles.container}>
                    <StatusBar barStyle="default" />
                    <ScrollView 
                        style={styles.container}
                        contentContainerStyle={styles.contentContainer}
                    >  
                        {/* PROFILE INFO */}
                        {isAuthenticated && (
                            <TouchableOpacity 
                                style={styles.profileButton}
                                onPress={() => router.push(`/profile/${user?.id}`)}
                            >
                                <ThemedText style={styles.profileButtonText}>{t('settings.showMyProfile')}</ThemedText>
                            </TouchableOpacity>
                        )}

                        {/* PROFILE SECTION */}
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>{t('settings.profile')}</ThemedText>
                        </View>
                        <ThemedView style={styles.mainSection}>
                            <View style={styles.userHeader}>
                                <View style={styles.avatar}>
                                    <ThemedText style={styles.avatarText}>{user?.username?.charAt(0) || 'X'}</ThemedText>
                                </View>
                                <View style={styles.userInfo}>
                                    <ThemedText style={styles.userName}>{user?.username || 'User'}</ThemedText>
                                    <ThemedText style={styles.userEmail}>{user?.email || ''}</ThemedText>
                                </View>
                            </View>
                                
                            <SettingItem 
                                icon="gear" 
                                title={t('settings.account')} 
                                description={t('settings.accountDesc')}
                                onPress={() => router.push('/settings/account')}
                            />
                            <SettingItem 
                                icon="dollarsign.circle" 
                                title={t('settings.balance')} 
                                description={t('settings.balanceDesc')}
                                onPress={() => router.push('/settings/balance')}
                            />
                            <SettingItem 
                                icon="bell" 
                                title={t('settings.notifications')} 
                                description={t('settings.notificationsDesc')}
                                onPress={() => router.push('/settings/notifications')}
                            />
                        </ThemedView>

                        {/* APP SECTION */}
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>{t('settings.app')}</ThemedText>
                        </View> 
                        <ThemedView style={styles.mainSection}>
                            <SettingItem 
                                icon="lock" 
                                title={t('settings.privacySecurity')} 
                                description={t('settings.privacySecurityDesc')}
                                onPress={() => router.push('/settings/privacy-security')}
                            />
                            <SettingItem 
                                icon="eye" 
                                title={t('settings.appearance')} 
                                description={t('settings.appearanceDesc')}
                                onPress={() => router.push('/settings/appearance')}
                            />
                            <SettingItem 
                                icon="globe" 
                                title={t('settings.language')} 
                                description={t('settings.languageDesc')}
                                onPress={() => router.push('/settings/language')}
                            />
                        </ThemedView>

                        {/* SUPPORT SECTION */}
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>{t('settings.support')}</ThemedText>
                        </View>
                        <ThemedView style={styles.mainSection}>
                            <SettingItem 
                                icon="questionmark.circle" 
                                title={t('settings.helpAndFeedback')} 
                                description={t('settings.helpAndFeedbackDesc')}
                                onPress={() => router.push('/settings/help')}
                            />
                            <SettingItem 
                                icon="doc.text" 
                                title={t('settings.termsOfService')} 
                                description={t('settings.termsOfServiceDesc')}
                                onPress={() => router.push('/settings/terms-of-service')}
                            />
                            <SettingItem 
                                icon="shield"
                                title={t('settings.privacyPolicy')} 
                                description={t('settings.privacyPolicyDesc')}
                                onPress={() => router.push('/settings/privacy-policy')}
                            />
                        </ThemedView>

                        {/* ABOUT SECTION */}
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>{t('settings.about')}</ThemedText>
                        </View>
                        <ThemedView style={styles.mainSection}>
                            <SettingItem
                                icon="info.circle" 
                                title={t('settings.appInfo')} 
                                description="FunRaise v1.0.1"
                                showChevron={false}
                                onPress={() => router.push('/settings/info')}
                            />
                        </ThemedView>

                        {/* LOGOUT BUTTON */}
                        <TouchableOpacity 
                            style={[styles.profileButton, { marginTop: verticalScale(10) }]}
                            onPress={handleLogout}
                        >
                            <ThemedText style={styles.profileButtonText}>{t('settings.logout')}</ThemedText>
                        </TouchableOpacity>
                    </ScrollView>
                </ThemedView>
            </SafeAreaView>
        </>
    );
}

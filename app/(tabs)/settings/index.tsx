import React from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, TouchableOpacity, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/lib/context/AuthContext';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { CustomButton } from '@/components/custom/button';
import { useTranslation } from 'react-i18next';

interface SettingItemProps {
    icon: string;
    title: string;
    description: string;
    showChevron?: boolean;
    onPress?: () => void;
}

export default function SettingsScreen() {
    const { user, logout } = useAuth();
    const { t } = useTranslation();

    const borderColor = useThemeColor({}, 'divider');
    const textSecondary = useThemeColor({}, 'icon');
    const surfaceColor = useThemeColor({}, 'surface');
    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const primaryColor = useThemeColor({}, 'primary');
        
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
            borderRadius: moderateScale(8),
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
    
    const navigateToSettingDetail = (title: string, icon: string) => {
        router.push({
        pathname: "/settings/detail",
        params: { title, icon }
        });
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
        onPress={onPress || (() => navigateToSettingDetail(title, icon))}
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
                    title: t('settings.title') || 'Settings',
                    headerShown: true,
                }} 
            />
            <SafeAreaView style={[styles.container, { flex: 1 }]}>
                <ThemedView style={styles.container}>
                    <StatusBar barStyle="default" />
                    <ScrollView 
                        style={styles.container}
                        contentContainerStyle={styles.contentContainer}
                    >  
                        {/* PROFILE INFO */}
                        <TouchableOpacity 
                            style={styles.profileButton}
                            onPress={() => router.push(`/profile/${user?.id}`)}
                        >
                            <ThemedText style={styles.profileButtonText}>{t('home.showMyProfile') || 'Show My Profile'}</ThemedText>
                        </TouchableOpacity>

                        {/* PROFILE SECTION */}
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>{t('settings.profile') || 'Profile'}</ThemedText>
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
                                title={t('settings.account') || 'Account'} 
                                description={t('settings.accountDesc') || 'Manage your account information'}
                                onPress={() => router.push('/settings/account')}
                            />
                            <SettingItem 
                                icon="dollarsign.circle" 
                                title={t('settings.balance') || 'Balance'} 
                                description={t('settings.balanceDesc') || 'Add funds to your account'}
                                onPress={() => router.push('/settings/balance')}
                            />
                            <SettingItem 
                                icon="bell" 
                                title={t('settings.notifications') || 'Notifications'} 
                                description={t('settings.notificationsDesc') || 'Configure how you receive notifications'}
                                onPress={() => router.push('/settings/notifications')}
                            />
                        </ThemedView>

                        {/* APP SECTION */}
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>{t('settings.app') || 'App'}</ThemedText>
                        </View> 
                        <ThemedView style={styles.mainSection}>
                            <SettingItem 
                                icon="lock" 
                                title={t('settings.privacy') || 'Privacy & Security'} 
                                description={t('settings.privacyDesc') || 'Manage your data and privacy settings'}
                                onPress={() => router.push('/settings/privacy-security')}
                            />
                            <SettingItem 
                                icon="eye" 
                                title={t('settings.appearance') || 'Appearance'} 
                                description={t('settings.appearanceDesc') || 'Customize how the app looks'}
                                onPress={() => router.push('/settings/appearance')}
                            />
                            <SettingItem 
                                icon="globe" 
                                title={t('settings.language') || 'Language'} 
                                description={t('settings.languageDesc') || 'Change your preferred language'}
                                onPress={() => router.push('/settings/language')}
                            />
                        </ThemedView>

                        {/* SUPPORT SECTION */}
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>{t('settings.support') || 'Support'}</ThemedText>
                        </View>
                        <ThemedView style={styles.mainSection}>
                            <SettingItem 
                                icon="questionmark.circle" 
                                title={t('settings.help') || 'Help & Feedback'} 
                                description={t('settings.helpDesc') || 'Get assistance or provide feedback'}
                                onPress={() => router.push('/settings/help')}
                            />
                            <SettingItem 
                                icon="doc.text" 
                                title={t('settings.terms') || 'Terms of Service'} 
                                description={t('settings.termsDesc') || 'Read our terms of service'}
                                onPress={() => router.push('/settings/terms-of-service')}
                            />
                            <SettingItem 
                                icon="shield"
                                title={t('settings.privacy') || 'Privacy Policy'} 
                                description={t('settings.privacyDesc') || 'Read our privacy policy'}
                                onPress={() => router.push('/settings/privacy-policy')}
                            />
                        </ThemedView>

                        {/* ABOUT SECTION */}
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>{t('settings.about') || 'About'}</ThemedText>
                        </View>
                        <ThemedView style={styles.mainSection}>
                            <SettingItem 
                                icon="info.circle" 
                                title={t('settings.info') || 'App Info'} 
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
                            <ThemedText style={styles.profileButtonText}>{t('settings.logout') || 'Logout'}</ThemedText>
                        </TouchableOpacity>
                    </ScrollView>
                </ThemedView>
            </SafeAreaView>
        </>
    );
}

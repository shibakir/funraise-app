import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { Switch } from 'react-native';
import { useTranslation } from 'react-i18next';

interface NotificationSetting {
    id: string;
    name: string;
    enabled: boolean;
    category: 'inApp' | 'push' | 'email';
}

interface NotificationCategory {
    title: string;
    type: 'inApp' | 'push' | 'email';
    settings: NotificationSetting[];
}

export default function NotificationsScreen() {
    const { t } = useTranslation();
    const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const headerBackground = useThemeColor({}, 'headerBackground');
    const headerText = useThemeColor({}, 'headerText');
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');

    useEffect(() => {
        const fetchNotificationSettings = async () => {
        try {
            // TODO: Add API call to fetch notification settings
            // const response = await fetch('/api/notification-settings');
            // const data = await response.json();
            
            const mockData: NotificationSetting[] = [
            { id: 'push-1', name: t('settings.pushNotifications'), enabled: true, category: 'push' },
            { id: 'push-2', name: t('settings.eventsReminders'), enabled: true, category: 'push' },
            { id: 'push-3', name: t('settings.newMessages'), enabled: true, category: 'push' },
            { id: 'push-4', name: t('settings.systemUpdates'), enabled: false, category: 'push' },
            
            { id: 'email-1', name: t('settings.emailNotifications'), enabled: true, category: 'email' },
            { id: 'email-2', name: t('settings.marketingEmails'), enabled: false, category: 'email' },
            { id: 'email-3', name: t('settings.eventsReminders'), enabled: true, category: 'email' },
            ];
            
            setTimeout(() => {
            setNotificationSettings(mockData);
            setLoading(false);
            }, 500);
        } catch (error) {
            console.error('Error fetching notification settings:', error);
            setLoading(false);
        }
        };

        fetchNotificationSettings();
    }, [t]);

    const handleToggleChange = (id: string, newValue: boolean) => {
        setNotificationSettings(prevSettings => 
        prevSettings.map(setting => 
            setting.id === id ? { ...setting, enabled: newValue } : setting
        )
        );
        //console.log(`Setting ${id} changed to ${newValue}`);
    };

    const categorizedSettings: NotificationCategory[] = [
        { title: t('settings.pushNotifications') || 'Push Notifications', type: 'push', settings: [] },
        { title: t('settings.emailNotifications') || 'Email Notifications', type: 'email', settings: [] },
    ];

    notificationSettings.forEach(setting => {
        const category = categorizedSettings.find(cat => cat.type === setting.category);
        if (category) {
            category.settings.push(setting);
        }
    });

    if (loading) {
        return (
        <>
            <Stack.Screen 
            options={{ 
                title: t('settings.notifications') || 'Notifications',
                headerShown: true,
            }} 
            />
            <SafeAreaView style={styles.container}>
            <ThemedView style={styles.container}>
                <StatusBar barStyle="default" />
                <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={primaryColor} />
                <ThemedText style={{ marginTop: verticalScale(10) }}>
                    {t('settings.loadingNotifications') || 'Loading notification settings...'}
                </ThemedText>
                </View>
            </ThemedView>
            </SafeAreaView>
        </>
        );
    }

    return (
        <>
            <Stack.Screen 
                options={{ 
                    title: t('settings.notifications') || 'Notifications',
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
                        {categorizedSettings.map((category) => (
                            <React.Fragment key={category.type}>
                                <View style={styles.sectionHeader}>
                                    <ThemedText style={styles.sectionTitle}>{category.title}</ThemedText>
                                </View>
                                <ThemedView style={[styles.mainSection, { backgroundColor: sectionBackground }]}>
                                    {category.settings.length === 0 ? (
                                        <ThemedText style={styles.emptyText}>
                                        {t('settings.noSettingsAvailable') || 'No settings available'}
                                        </ThemedText>
                                    ) : (
                                        category.settings.map((setting) => (
                                        <View key={setting.id} style={styles.notificationItem}>
                                            <ThemedText style={styles.notificationText}>{setting.name}</ThemedText>
                                            <View style={styles.statusContainer}>
                                                <Switch
                                                    value={setting.enabled}
                                                    onValueChange={(newValue) => handleToggleChange(setting.id, newValue)}
                                                    trackColor={{ false: '#767577', true: primaryColor }}
                                                />
                                            </View>
                                        </View>
                                        ))
                                    )}
                                </ThemedView>
                            </React.Fragment>
                        ))}
                    </ScrollView>
                </ThemedView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: moderateScale(16),
        paddingBottom: verticalScale(40),
    },
    mainSection: {
        borderRadius: moderateScale(16),
        overflow: 'hidden',
        marginBottom: verticalScale(16),
        padding: moderateScale(16),
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
    notificationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(8),
    },
    notificationText: {
        fontSize: moderateScale(16),
        flex: 1,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: moderateScale(14),
        marginRight: moderateScale(8),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: moderateScale(20),
    },
    emptyText: {
        textAlign: 'center',
        fontSize: moderateScale(16),
        marginVertical: verticalScale(20),
    },
});

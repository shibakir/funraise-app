import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { Switch } from 'react-native';

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
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const sectionBackground = useThemeColor({}, 'sectionBackground');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        // TODO: Add API call to fetch notification settings
        // const response = await fetch('/api/notification-settings');
        // const data = await response.json();
        
        const mockData: NotificationSetting[] = [
          { id: 'inapp-1', name: 'Event ended', enabled: true, category: 'inApp' },
          { id: 'inapp-2', name: 'Some other setting', enabled: true, category: 'inApp' },
          { id: 'inapp-3', name: 'Some other setting', enabled: true, category: 'inApp' },
          
          { id: 'push-1', name: 'Event ended', enabled: true, category: 'push' },
          { id: 'push-2', name: 'Some other setting', enabled: true, category: 'push' },
          { id: 'push-3', name: 'Some other setting', enabled: true, category: 'push' },
          
          { id: 'email-1', name: 'Some other setting', enabled: false, category: 'email' },
          { id: 'email-2', name: 'Some other setting', enabled: false, category: 'email' },
          { id: 'email-3', name: 'Some other setting', enabled: false, category: 'email' },
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
  }, []);

  const handleToggleChange = (id: string, newValue: boolean) => {
    setNotificationSettings(prevSettings => 
      prevSettings.map(setting => 
        setting.id === id ? { ...setting, enabled: newValue } : setting
      )
    );
    // TODO: Add API call to update notification settings
    // fetch(`/api/notification-settings/${id}`, { 
    //   method: 'PATCH', 
    //   body: JSON.stringify({ enabled: newValue }),
    //   headers: { 'Content-Type': 'application/json' }
    // });
    console.log(`Setting ${id} changed to ${newValue}`);
  };

  const categorizedSettings: NotificationCategory[] = [
    { title: 'In-App Notifications', type: 'inApp', settings: [] },
    { title: 'Push Notifications', type: 'push', settings: [] },
    { title: 'Email Notifications', type: 'email', settings: [] },
  ];

  notificationSettings.forEach(setting => {
    const category = categorizedSettings.find(cat => cat.type === setting.category);
    if (category) {
      category.settings.push(setting);
    }
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      padding: moderateScale(16),
      paddingBottom: verticalScale(40),
    },
    mainSection: {
      backgroundColor: sectionBackground,
      borderRadius: moderateScale(14),
      marginBottom: verticalScale(16),
    },
    section: {
      padding: moderateScale(16),
      borderRadius: moderateScale(8),
      overflow: 'hidden',
    },
    sectionTitle: {
      fontSize: moderateScale(20),
      fontWeight: '600',
      marginBottom: verticalScale(16),
    },
    notificationItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
    },
    notificationText: {
      fontSize: moderateScale(16),
      flex: 1,
      color: textColor,
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={{ marginTop: verticalScale(10) }}>Loading notification settings...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {categorizedSettings.map((category) => (
          <ThemedView key={category.type} style={styles.mainSection}>
            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{category.title}</ThemedText>
              
              {category.settings.length === 0 ? (
                <ThemedText style={styles.emptyText}>No settings available</ThemedText>
              ) : (
                category.settings.map((setting) => (
                  <View key={setting.id} style={styles.notificationItem}>
                    <ThemedText style={styles.notificationText}>{setting.name}</ThemedText>
                    <Switch
                      value={setting.enabled}
                      onValueChange={(newValue) => handleToggleChange(setting.id, newValue)}
                      trackColor={{ false: '#767577', true: primaryColor }}
                    />
                  </View>
                ))
              )}
            </ThemedView>
          </ThemedView>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

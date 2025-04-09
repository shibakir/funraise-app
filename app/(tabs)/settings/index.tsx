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

interface SettingItemProps {
  icon: string;
  title: string;
  description: string;
  showChevron?: boolean;
  onPress?: () => void;
}

export default function GitHubSettingsScreen() {
  const { user, logout } = useAuth();

  //const borderColor = useThemeColor({}, 'border');
  //const textSecondary = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'divider');
  const textSecondary = useThemeColor({}, 'icon');
  
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
          title: 'Settings',
          headerShown: true,
        }} 
      />
      <SafeAreaView style={[styles.container, { flex: 1 }]}>
        <StatusBar barStyle="default" />
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Profile</ThemedText>
            </View>
            
            <View style={styles.userHeader}>
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarText}>{user?.name?.charAt(0) || 'X'}</ThemedText>
              </View>
              <View style={styles.userInfo}>
                <ThemedText style={styles.userName}>{user?.name || 'User'}</ThemedText>
                <ThemedText style={styles.userEmail}>{user?.email || ''}</ThemedText>
              </View>
            </View>
            
            <SettingItem 
              icon="gear" 
              title="Account" 
              description="Manage your account information"
              onPress={() => router.push('/settings/account')}
            />
            <SettingItem 
              icon="bell" 
              title="Notifications" 
              description="Configure how you receive notifications"
            />
          </ThemedView>

          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>App</ThemedText>
            </View>
            
            <SettingItem 
              icon="lock" 
              title="Privacy & Security" 
              description="Manage your data and privacy settings"
            />
            <SettingItem 
              icon="eye" 
              title="Appearance" 
              description="Customize how the app looks"
              onPress={() => router.push('/settings/appearance')}
            />
            <SettingItem 
              icon="globe" 
              title="Language" 
              description="Change your preferred language"
              onPress={() => router.push('/settings/language')}
            />
          </ThemedView>

          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Support</ThemedText>
            </View>
            
            <SettingItem 
              icon="questionmark.circle" 
              title="Help & Feedback" 
              description="Get assistance or provide feedback"
            />
            <SettingItem 
              icon="doc.text" 
              title="Terms of Service" 
              description="Read our terms of service"
            />
            <SettingItem 
              icon="shield" 
              title="Privacy Policy" 
              description="Read our privacy policy"
            />
          </ThemedView>

          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>About</ThemedText>
            </View>
            
            <SettingItem 
              icon="info.circle" 
              title="App Info" 
              description="FunRaise v1.0.1"
              showChevron={false}
            />
          </ThemedView>

          <ThemedView style={styles.buttonSection}>
            <CustomButton
              title="Logout" 
              onPress={handleLogout}
              variant="secondary"
            />
          </ThemedView>
        </ScrollView>
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
  section: {
    marginBottom: verticalScale(16),
    borderRadius: moderateScale(8),
    overflow: 'hidden',
  },
  sectionHeader: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
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
    borderBottomWidth: 1,
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
    borderBottomWidth: 1,
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
    marginTop: verticalScale(2),
  },
  buttonSection: {
    padding: moderateScale(16),
    marginTop: verticalScale(8),
    marginBottom: verticalScale(24),
  },
}); 
import React, { useCallback } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, View, TouchableOpacity } from 'react-native';
import { Stack, useFocusEffect, router } from 'expo-router';
import { ThemedText } from '@/components/themed/ThemedText';
import { useThemeColor } from '@/lib/hooks/ui';
import { useAuth } from '@/lib/context/AuthContext';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { CreateEventSection } from '@/components/custom/createEventSection';
import { UserEvents } from '@/components/custom/UserEvents';
import { UserAchievements } from '@/components/custom/UserAchievements';
import { ThemedView } from '@/components/themed/ThemedView';
import { useTranslation } from 'react-i18next';
import { RefreshableScrollView } from '@/components/custom/RefreshableScrollView';
import { useRefresh } from '@/lib/context/RefreshContext';

export default function HomeScreen() {
    const { user } = useAuth();
    const userId = String(user?.id);

    const { t } = useTranslation();
    const { triggerRefresh } = useRefresh();

    const sectionBackground = useThemeColor({}, 'sectionBackground');
    //const primaryColor = useThemeColor({}, 'primary');
    const headerBackground = useThemeColor({}, 'headerBackground');
    const headerText = useThemeColor({}, 'headerText');
    
    useFocusEffect(
        useCallback(() => {
            // Update data when focus on the screen
            triggerRefresh();
        }, [triggerRefresh])
    );

    const navigateToProfile = () => {
        if (user) {
            router.push(`/profile/${user.id}`);
        }
    };
    const navigateToDocumentation = () => {
        router.push('/(app)/documentation');
    };

    const navigateToRanks = () => {
        router.push('/(app)/ranks');
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        contentContainer: {
            padding: moderateScale(16),
            paddingBottom: verticalScale(40),
        },
        section: {
            borderRadius: moderateScale(16),
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
        profileButton: {
            paddingVertical: verticalScale(12),
            paddingHorizontal: horizontalScale(20),
            borderRadius: moderateScale(16),
            alignItems: 'center',
            marginTop: verticalScale(16),
        },
        docButton: {
            paddingVertical: verticalScale(12),
            paddingHorizontal: horizontalScale(20),
            borderRadius: moderateScale(16),
            alignItems: 'center',
            marginTop: verticalScale(10),
            backgroundColor: sectionBackground,
        },
        profileButtonText: {
            fontSize: moderateScale(16),
            fontWeight: '600',
        },
        docButtonText: {
            fontSize: moderateScale(16),
            fontWeight: '600',
        },
    });

    return (
        <>
            <Stack.Screen 
                options={{ 
                    title: t('home.title'),
                    headerShown: true,
                    headerStyle: { backgroundColor: headerBackground },
                    headerTitleStyle: { color: headerText },
                }} 
            />
            <SafeAreaView style={[styles.container, { flex: 1 }]}>
                <ThemedView style={styles.container}>
                    <StatusBar barStyle="default" />
                    <RefreshableScrollView 
                        style={styles.container}
                        contentContainerStyle={styles.contentContainer}
                    >
                        {/* PROFILE BUTTON */}
                        <TouchableOpacity 
                            style={[styles.profileButton, { backgroundColor: sectionBackground }]}
                            onPress={navigateToProfile}
                        >
                            <ThemedText style={styles.profileButtonText}>{t('home.showMyProfile')}</ThemedText>
                        </TouchableOpacity>

                        {/* RANKS BUTTON */}
                        <TouchableOpacity 
                            style={styles.docButton}
                            onPress={navigateToRanks}
                        >
                            <ThemedText style={styles.docButtonText}>Top users</ThemedText>
                        </TouchableOpacity>
                        
                        {/* NEW EVENT SECTION */}
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>{t('home.newEvent')}</ThemedText>
                        </View>
                        <CreateEventSection />

                        {/* DOCUMENTATION BUTTON */}
                        <TouchableOpacity 
                            style={styles.docButton}
                            onPress={navigateToDocumentation}
                        >
                            <ThemedText style={styles.docButtonText}>{t('home.readHelp')}</ThemedText>
                        </TouchableOpacity>
                        
                        {/* MY ACTIVE EVENTS SECTION */}
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>{t('home.myActiveEvents')}</ThemedText>
                        </View>
                        <UserEvents userId={userId} limit={5} eventType="created" showOnlyActive={true} />

                        {/* ACHIEVEMENTS SECTION */}
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>{t('home.myAchievements')}</ThemedText>
                        </View>
                        <UserAchievements userId={userId} />
                    </RefreshableScrollView>
                </ThemedView>
            </SafeAreaView>
        </>
    );
}
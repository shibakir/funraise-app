import React, { useCallback } from 'react';
import { StyleSheet, StatusBar, SafeAreaView, View } from 'react-native';
import { Stack, useFocusEffect, Redirect } from 'expo-router';

import { CreateEventSection } from '@/components/custom/createEventSection';
import { UserEvents } from '@/components/custom/UserEvents';
import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { useThemeColor } from '@/lib/hooks/ui';
import { useTranslation } from 'react-i18next';
import { AllEvents } from '@/components/custom/AllEvents';
import { RefreshableScrollView } from '@/components/custom/RefreshableScrollView';
import { useRefresh } from '@/lib/context/RefreshContext';
import {useAuth} from "@/lib/context/AuthContext";

export default function ExploreScreen() {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user) {
        return <Redirect href="/login" />;
    }
    const userId = String(user.id);

    const { t } = useTranslation();
    const { triggerRefresh } = useRefresh();

    // Use useFocusEffect to update data when the screen is focused
    useFocusEffect(
        useCallback(() => {
            // Update data when the screen is focused
            triggerRefresh();
        }, [triggerRefresh])
    );

    const headerBackground = useThemeColor({}, 'headerBackground');
    const headerText = useThemeColor({}, 'headerText');
    
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
        profileButtonText: {
            fontSize: moderateScale(16),
            fontWeight: '600',
        },
    });

    return (
        <>
            <Stack.Screen 
                options={{ 
                    title: t('explore.title'),
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
                        {/* NEW EVENT SECTION */}
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>{t('explore.newEvent')}</ThemedText>
                        </View>
                        <CreateEventSection />

                        {/* ALL EVENTS SECTION */}
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>{t('explore.discoverEvents')}</ThemedText>
                        </View>
                        <AllEvents limit={5} />

                        {/* MY ACTIVE EVENTS SECTION */}
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>{t('explore.myRecentEvents')}</ThemedText>
                        </View>
                        <UserEvents userId={userId} limit={5} />

                    </RefreshableScrollView>
                </ThemedView>
            </SafeAreaView>
        </>
    );
} 
import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Stack, useFocusEffect, Redirect, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { useAuth } from '@/lib/context/AuthContext';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { CreateEventSection } from '@/components/custom/createEventSection';
import { UserEvents } from '@/components/custom/UserEvents';
import { UserAchievements } from '@/components/custom/UserAchievements';
import { ThemedView } from '@/components/ThemedView';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
    const [updateKey, setUpdateKey] = useState(0);
    const { user } = useAuth();
    const { t } = useTranslation();

    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const primaryColor = useThemeColor({}, 'primary');
    const headerBackground = useThemeColor({}, 'headerBackground');
    const headerText = useThemeColor({}, 'headerText');
    
    useFocusEffect(
        useCallback(() => {
            // Обновляем ключ, чтобы заставить компоненты перерендериться
            setUpdateKey(prev => prev + 1);
        }, [])
    );

    const navigateToProfile = () => {
        if (user) {
            router.push(`/profile/${user.id}`);
        }
    };
    const navigateToDocumentation = () => {
        router.push('/(app)/documentation');
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

    // redirect to login page if user is not authenticated
    if (!user) {
        return <Redirect href="/login" />;
    }

    const userId = String(user.id);

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
                    <ScrollView 
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
                        
                        {/* NEW EVENT SECTION */}
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>{t('home.newEvent')}</ThemedText>
                        </View>
                        <CreateEventSection key={`create-${updateKey}`} />
                        {/* DOCUMENTATION BUTTON */}
                        <TouchableOpacity 
                            style={styles.docButton}
                            onPress={navigateToDocumentation}
                        >
                            <ThemedText style={styles.docButtonText}>{t('home.readHelp')}</ThemedText>
                        </TouchableOpacity>
                        
                        
                        {/* MY ACTIVE EVENTS SECTION */}
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>{t('home.myRecentEvents')}</ThemedText>
                        </View>
                        <UserEvents userId={userId} key={`events-${updateKey}`} />
                        
                        {/* ACHIEVEMENTS SECTION */}
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>{t('home.myAchievements')}</ThemedText>
                        </View>
                        <UserAchievements userId={userId} key={`achievements-${updateKey}`} />
                    </ScrollView>
                </ThemedView>
            </SafeAreaView>
        </>
    );
}
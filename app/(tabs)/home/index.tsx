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

export default function HomeScreen() {
    const [updateKey, setUpdateKey] = useState(0);
    const { user } = useAuth();

    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const primaryColor = useThemeColor({}, 'primary');
    
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

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        contentContainer: {
            padding: moderateScale(16),
            paddingBottom: verticalScale(40),
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
        profileButton: {
            paddingVertical: verticalScale(12),
            paddingHorizontal: horizontalScale(20),
            borderRadius: moderateScale(8),
            alignItems: 'center',
            marginTop: verticalScale(16),
        },
        profileButtonText: {
            fontSize: moderateScale(16),
            fontWeight: '600',
        },
    });

    // Перенаправляем на страницу входа, если пользователь не авторизован
    if (!user) {
        return <Redirect href="/login" />;
    }

    const userId = String(user.id);

    return (
        <>
            <Stack.Screen 
                options={{ 
                    title: 'Home',
                    headerShown: true,
                }} 
            />
            <SafeAreaView style={[styles.container, { flex: 1 }]}>
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
                        <ThemedText style={styles.profileButtonText}>Show Profile</ThemedText>
                    </TouchableOpacity>
                    
                    {/* NEW EVENT SECTION */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle}>New Event</ThemedText>
                    </View>
                    <CreateEventSection key={`create-${updateKey}`} />
                    
                    {/* MY ACTIVE EVENTS SECTION */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle}>My recent events</ThemedText>
                    </View>
                    <UserEvents userId={userId} key={`events-${updateKey}`} />
                    
                    {/* ACHIEVEMENTS SECTION */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle}>My Achievements</ThemedText>
                    </View>
                    <UserAchievements userId={userId} key={`achievements-${updateKey}`} />
                </ScrollView>
            </SafeAreaView>
        </>
    );
}
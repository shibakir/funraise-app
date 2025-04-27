import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, StatusBar, SafeAreaView, View, TouchableOpacity } from 'react-native';
import { Stack, useFocusEffect, Redirect } from 'expo-router';

import { CreateEventSection } from '@/components/custom/createEventSection';
import { UserEvents } from '@/components/custom/UserEvents';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { useAuth } from '@/lib/context/AuthContext';
import { useTranslation } from 'react-i18next';

import { AllEvents } from '@/components/custom/AllEvents';

export default function ExploreScreen() {
    // Добавляем forceUpdate для обновления компонента
    const [updateKey, setUpdateKey] = useState(0);
    const { user } = useAuth();
    const { t } = useTranslation();

    // Используем useFocusEffect для обновления при каждом переходе на эту страницу
    useFocusEffect(
        useCallback(() => {
            // Обновляем ключ, чтобы заставить компоненты перерендериться
            setUpdateKey(prev => prev + 1);
        }, [])
    );

    const primaryColor = useThemeColor({}, 'primary');
    const sectionBackground = useThemeColor({}, 'sectionBackground');
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

    // Перенаправляем на страницу входа, если пользователь не авторизован
    if (!user) {
        return <Redirect href="/login" />;
    }

    const userId = String(user.id);

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
                    <ScrollView 
                        style={styles.container}
                        contentContainerStyle={styles.contentContainer}
                    >
                        {/* NEW EVENT SECTION */}
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>{t('explore.newEvent')}</ThemedText>
                        </View>
                        <CreateEventSection key={`create-${updateKey}`} />

                        {/* ALL EVENTS SECTION */}
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>{t('explore.discoverEvents')}</ThemedText>
                        </View>
                        <AllEvents limit={5} userId={userId} key={`all-events-${updateKey}`} />

                        {/* MY ACTIVE EVENTS SECTION */}
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>{t('explore.myRecentEvents')}</ThemedText>
                        </View>
                        <UserEvents userId={userId} limit={5} key={`events-${updateKey}`} />
                        
                    </ScrollView>
                </ThemedView>
            </SafeAreaView>
        </>
    );
} 
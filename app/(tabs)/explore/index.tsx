import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, StatusBar, SafeAreaView, View, TouchableOpacity } from 'react-native';
import { Stack, useFocusEffect, Redirect } from 'expo-router';

import { CreateEventSection } from '@/components/custom/createEventSection';
import { UserEvents } from '@/components/custom/UserEvents';
import { ThemedText } from '@/components/ThemedText';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { useAuth } from '@/lib/context/AuthContext';

import { AllEvents } from '@/components/custom/AllEvents';

export default function ExploreScreen() {
    // Добавляем forceUpdate для обновления компонента
    const [updateKey, setUpdateKey] = useState(0);
    const { user } = useAuth();

    // Используем useFocusEffect для обновления при каждом переходе на эту страницу
    useFocusEffect(
        useCallback(() => {
            // Обновляем ключ, чтобы заставить компоненты перерендериться
            setUpdateKey(prev => prev + 1);
        }, [])
    );

    const primaryColor = useThemeColor({}, 'primary');
    
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
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        sectionTitle: {
            fontSize: moderateScale(20),
            fontWeight: '600',
            marginBottom: verticalScale(4),
        },
        viewAllButton: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        viewAllText: {
            color: primaryColor,
            fontSize: moderateScale(14),
            fontWeight: '500',
            marginRight: horizontalScale(4),
        },
        headerImage: {
            color: '#808080',
            bottom: -90,
            left: -35,
            position: 'absolute',
        },
        titleContainer: {
            flexDirection: 'row',
            gap: 8,
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
                title: 'Explore',
                headerShown: true,
                }} 
            />
            <SafeAreaView style={[styles.container, { flex: 1 }]}>
                <StatusBar barStyle="default" />
                <ScrollView 
                    style={styles.container}
                    contentContainerStyle={styles.contentContainer}
                >
                    {/* NEW EVENT SECTION */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle}>Create your new event!</ThemedText>
                    </View>
                    <CreateEventSection key={`create-${updateKey}`} />

                    {/* MY ACTIVE EVENTS SECTION */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle}>My recent events</ThemedText>
                    </View>
                    <UserEvents userId={userId} limit={5} key={`events-${updateKey}`} />
                    
                    {/* ALL EVENTS SECTION */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle}>Discover other events</ThemedText>
                    </View>
                    <AllEvents limit={5} userId={userId} key={`all-events-${updateKey}`} />
                </ScrollView>
            </SafeAreaView>
        </>
    );
} 
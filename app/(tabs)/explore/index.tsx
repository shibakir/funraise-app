import React, { useState, useCallback } from 'react';
import { StyleSheet, Image, Platform, ScrollView, StatusBar, SafeAreaView, View } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';

import { CreateEventSection } from '@/components/custom/createEventSection';
import { UserEvents } from '@/components/custom/UserEvents';
import { ThemedText } from '@/components/ThemedText';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';

export default function ExploreScreen() {
    // Добавляем forceUpdate для обновления компонента
    const [updateKey, setUpdateKey] = useState(0);
    
    // Используем useFocusEffect для обновления при каждом переходе на эту страницу
    useFocusEffect(
        useCallback(() => {
            // Обновляем ключ, чтобы заставить компоненты перерендериться
            setUpdateKey(prev => prev + 1);
        }, [])
    );

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
                    <UserEvents userId="1" limit={5} key={`events-${updateKey}`} />
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
        borderRadius: moderateScale(8),
        overflow: 'hidden',
    },
    sectionHeader: {
        marginTop: verticalScale(6),
        paddingVertical: verticalScale(12),
    },
    sectionTitle: {
        fontSize: moderateScale(20),
        fontWeight: '600',
        marginBottom: verticalScale(4),
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
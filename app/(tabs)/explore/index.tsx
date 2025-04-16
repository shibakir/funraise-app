import React from 'react';
import { StyleSheet, Image, Platform, ScrollView, StatusBar, SafeAreaView, View } from 'react-native';

import { CreateEventSection } from '@/components/custom/createEventSection';
import { UserEvents } from '@/components/custom/UserEvents';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { Stack } from 'expo-router';

export default function ExploreScreen() {
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'divider');
    const textSecondary = useThemeColor({}, 'icon');
    const sectionBackground = useThemeColor({}, 'sectionBackground');

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
                    <CreateEventSection />

                    {/* MY ACTIVE EVENTS SECTION */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle}>My recent events</ThemedText>
                    </View>
                    <UserEvents userId="1" limit={5} />
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
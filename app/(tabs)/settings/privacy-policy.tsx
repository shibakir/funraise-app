import React from 'react';
import { StyleSheet, SafeAreaView, ScrollView, View, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicyScreen() {
    
    const { t } = useTranslation();
    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const headerBackground = useThemeColor({}, 'headerBackground');
    const headerText = useThemeColor({}, 'headerText');

    return (
        <>
            <Stack.Screen 
                options={{ 
                    title: t('settings.privacyPolicyPage.title'),
                    headerBackTitle: t('settings.privacyPolicyPage.backTitle'),
                    headerShown: true,
                    headerStyle: { backgroundColor: headerBackground },
                    headerTitleStyle: { color: headerText },
                }} 
            />
            <SafeAreaView style={styles.container}>
                <ThemedView style={styles.container}>
                    <StatusBar barStyle="default" />
                    <ScrollView 
                        style={styles.container}
                        contentContainerStyle={styles.contentContainer}
                    >
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>{t('settings.privacyPolicyPage.privacyPolicy')}</ThemedText>
                        </View>
                        
                        <ThemedView style={[styles.mainSection, { backgroundColor: sectionBackground }]}>
                            <ThemedText style={styles.description}>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure 
                                dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat 
                                non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                            </ThemedText>
                            <ThemedText style={styles.description}>
                                Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, 
                                nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. 
                                Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien 
                                risus a quam.
                            </ThemedText>
                        </ThemedView>
                    </ScrollView>
                </ThemedView>
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
    mainSection: {
        borderRadius: moderateScale(16),
        overflow: 'hidden',
        marginBottom: verticalScale(16),
        padding: moderateScale(16),
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
    description: {
        fontSize: moderateScale(16),
        lineHeight: moderateScale(24),
        marginBottom: verticalScale(16),
    },
}); 
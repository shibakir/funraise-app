import React from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { useTranslation } from 'react-i18next';

export default function SettingDetailScreen() {
    const { title, icon } = useLocalSearchParams();
    const { t } = useTranslation();
    const textSecondary = useThemeColor({}, 'icon');
    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const headerBackground = useThemeColor({}, 'headerBackground');
    const headerText = useThemeColor({}, 'headerText');

    const displayTitle = typeof title === 'string' ? title : '';

    return (
        <>
            <Stack.Screen 
                    options={{ 
                    title: displayTitle || t('settings.detail') || 'Detail',
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
                            <ThemedText style={styles.sectionTitle}>{displayTitle || t('settings.detail') || 'Detail'}</ThemedText>
                        </View>
                        
                        <ThemedView style={[styles.mainSection, { backgroundColor: sectionBackground }]}>
                            <View style={styles.headerContainer}>
                                {icon && (
                                <View style={styles.iconContainer}>
                                    <IconSymbol name={icon as any} size={30} color={textSecondary} />
                                </View>
                                )}
                            </View>
                            
                            <View style={styles.contentSection}>
                                <ThemedText>
                                {t('settings.pageComingSoon', {title: displayTitle}) || `Page "${displayTitle}" will be added soon. Thank you for your patience.`}
                                </ThemedText>
                            </View>
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
        borderRadius: moderateScale(8),
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
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    iconContainer: {
        marginRight: horizontalScale(12),
    },
    contentSection: {
        paddingVertical: verticalScale(8),
    },
}); 
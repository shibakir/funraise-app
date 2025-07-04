import React from 'react';
import { StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { useThemeColor } from '@/lib/hooks/ui';
import { verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function PrivacySecurityScreen() {

    const { t } = useTranslation();

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
        mainSection: {
            backgroundColor: sectionBackground,
            borderRadius: moderateScale(14),
            marginBottom: verticalScale(16),
        },
        section: {
            padding: moderateScale(16),
            borderRadius: moderateScale(8),
            overflow: 'hidden',
        },
        title: {
            fontSize: moderateScale(24),
            fontWeight: 'bold',
            marginBottom: verticalScale(8),
        },
        description: {
            fontSize: moderateScale(16),
            lineHeight: moderateScale(24),
            marginBottom: verticalScale(16),
        },
    });

    return (
        <>
            <Stack.Screen 
                options={{ 
                    title: t('settings.privacyAndSecurityPage.title'),
                    headerBackTitle: t('settings.privacyAndSecurityPage.backTitle'),
                    headerShown: true,
                    headerStyle: { backgroundColor: headerBackground },
                    headerTitleStyle: { color: headerText },
                }} 
            />
            <SafeAreaView style={styles.container}>
                <ThemedView style={styles.container}>
                    <StatusBar barStyle="default" />
                    <ScrollView contentContainerStyle={styles.contentContainer}>
                        <ThemedView style={styles.mainSection}>
                            <ThemedView style={styles.section}>
                                <ThemedText style={styles.title}>Privacy & Security</ThemedText>
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
                                    risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, 
                                    commodo eget, consequat quis, neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam 
                                    lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam consequat. Curabitur augue lorem, dapibus quis, laoreet et, 
                                    pretium ac, nisi. Aenean magna nisl, mollis quis, molestie eu, feugiat in, orci. In hac habitasse platea dictumst.
                                </ThemedText>
                                <ThemedText style={styles.description}>
                                    Fusce convallis, mauris imperdiet gravida bibendum, nisl turpis suscipit mauris, sed placerat ipsum urna sed risus. Class aptent 
                                    taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Nulla facilisi. Sed a libero. Cras in purus eu magna 
                                    vulputate luctus. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna.
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>
                    </ScrollView>
                </ThemedView>
            </SafeAreaView>
        </>
    );
} 
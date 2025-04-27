import React from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { useTheme } from '@/lib/context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function AppearanceScreen() {
    const { theme, setTheme } = useTheme();
    const { t } = useTranslation();
    const borderColor = useThemeColor({}, 'divider');
    const primaryColor = useThemeColor({}, 'primary');
    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const headerBackground = useThemeColor({}, 'headerBackground');
    const headerText = useThemeColor({}, 'headerText');
    
    const ThemeOption = ({ value, label, isLast = false }) => {
        const isSelected = theme === value;
        
        return (
            <View style={styles.optionWrapper}>
                <TouchableOpacity
                    style={styles.optionContainer}
                    onPress={() => setTheme(value)}
                    activeOpacity={0.7}
                >
                    <ThemedText style={styles.optionTitle}>{label}</ThemedText>
                    {isSelected && (
                        <View style={[styles.checkCircle, { backgroundColor: primaryColor }]}>
                            <View style={styles.checkMark}></View>
                        </View>
                    )}
                </TouchableOpacity>
                { ! isLast && 
                    <View style={[styles.divider, { backgroundColor: borderColor }]} />
                }
            </View>
        );
    };

    return (
        <>
            <Stack.Screen 
                options={{ 
                    title: t('settings.appearance') || 'Appearance',
                    headerShown: true,
                    headerStyle: { backgroundColor: headerBackground },
                    headerTitleStyle: { color: headerText },
                }} 
            />
            <SafeAreaView style={styles.container}>
                <ThemedView style={styles.container}>
                <StatusBar barStyle="default" />
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <ThemedView style={[styles.mainSection, { backgroundColor: sectionBackground }]}>
                    <ThemeOption value="system" label={t('settings.automatic') || 'Automatic'} />
                    <ThemeOption value="dark" label={t('settings.dark') || 'Dark'} />
                    <ThemeOption value="light" label={t('settings.light') || 'Light'} isLast={true} />
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
    optionWrapper: {
        width: '100%',
        alignItems: 'center',
    },
    optionContainer: {
        flexDirection: 'row',
        padding: moderateScale(16),
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    divider: {
        height: 1,
        width: '90%',
        marginBottom: 0,
    },
    optionTitle: {
        fontSize: moderateScale(17),
        fontWeight: '400',
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkMark: {
        width: 10,
        height: 6,
        borderLeftWidth: 2,
        borderBottomWidth: 2,
        transform: [{ rotate: '-45deg' }],
        marginBottom: 2,
    },
}); 
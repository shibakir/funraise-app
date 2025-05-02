import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@/lib/localization/i18n';
import * as SecureStore from 'expo-secure-store';

export default function LanguageScreen() {
    const { t, i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState('en');
    
    const borderColor = useThemeColor({}, 'divider');
    const primaryColor = useThemeColor({}, 'primary');
    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const headerBackground = useThemeColor({}, 'headerBackground');
    const headerText = useThemeColor({}, 'headerText');

    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const storedLanguage = await SecureStore.getItemAsync('app_language');
                if (storedLanguage) {
                    setCurrentLanguage(storedLanguage);
                }
            } catch (error) {
                console.error('Error loading language:', error);
            }
        };
        loadLanguage();
    }, []);
    
    const handleLanguageChange = (lang: string) => {
        setCurrentLanguage(lang);
        changeLanguage(lang);
    };
  
    const LanguageOption = ({ value, label, isLast = false }) => {
        const isSelected = currentLanguage === value;
        
        return (
            <View style={styles.optionWrapper}>
                <TouchableOpacity
                    style={styles.optionContainer}
                    onPress={() => handleLanguageChange(value)}
                    activeOpacity={0.7}
                >
                    <ThemedText style={styles.optionTitle}>{label}</ThemedText>
                    { isSelected && (
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
                    title: t('settings.languagePage.title'),
                    headerBackTitle: t('settings.languagePage.backTitle'),
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
                        <ThemedView style={[styles.mainSection, { backgroundColor: sectionBackground }]}>
                            <LanguageOption value="en" label={t('settings.languagePage.language.english')} />
                            <LanguageOption value="cs" label={t('settings.languagePage.language.czech')} isLast={true} />
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
        marginVertical: verticalScale(16),
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
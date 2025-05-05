import React from 'react';
import { StyleSheet, SafeAreaView, ScrollView, View, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { useTranslation } from 'react-i18next';
import { CreateEventSection } from '@/components/custom/createEventSection';
export default function EventDocumentationScreen() {
    const { t } = useTranslation();
    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const headerBackground = useThemeColor({}, 'headerBackground');
    const headerText = useThemeColor({}, 'headerText');
  
    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        contentContainer: {
            padding: moderateScale(8),
            paddingTop: verticalScale(16),
            paddingBottom: verticalScale(40),
        },
        mainSection: {
            backgroundColor: sectionBackground,
            borderRadius: moderateScale(14),
            marginBottom: verticalScale(16),
        },
        section: {
            padding: moderateScale(8),
            borderRadius: moderateScale(8),
            overflow: 'hidden',
        },
        title: {
            fontSize: moderateScale(24),
            fontWeight: 'bold',
            marginBottom: verticalScale(8),
        },
        subtitle: {
            fontSize: moderateScale(20),
            fontWeight: 'bold',
            marginTop: verticalScale(16),
            marginBottom: verticalScale(8),
        },
        sectionTitle: {
            fontSize: moderateScale(18),
            fontWeight: '600',
            marginTop: verticalScale(12),
            marginBottom: verticalScale(8),
        },
        description: {
            fontSize: moderateScale(16),
            lineHeight: moderateScale(24),
            marginBottom: verticalScale(16),
        },
        bullet: {
            fontSize: moderateScale(16),
            lineHeight: moderateScale(24),
            marginBottom: verticalScale(8),
            paddingLeft: moderateScale(8),
        },
        bold: {
            fontWeight: '600',
        },
        tipBox: {
            backgroundColor: '#f8f4e3',
            borderLeftWidth: 4,
            borderLeftColor: '#f5c33b',
            padding: moderateScale(12),
            marginVertical: verticalScale(12),
            borderRadius: moderateScale(4),
        },
        tipTitle: {
            fontSize: moderateScale(16),
            fontWeight: '600',
            marginBottom: verticalScale(8),
            color: '#70591e',
        },
        tipText: {
            fontSize: moderateScale(14),
            lineHeight: moderateScale(22),
            color: '#70591e',
        },
        sectionHeader: {
            marginTop: verticalScale(20),
            paddingVertical: verticalScale(12),
        },
    });

    return (
        <>
            <Stack.Screen
                options={{
                    title: t('documentation.title'),
                    headerShown: true,  
                    headerBackTitle: t('documentation.backTitle'),
                    headerStyle: { backgroundColor: headerBackground },
                    headerTitleStyle: { color: headerText },
                }}
            />
            <ThemedView style={styles.container}>
                <StatusBar barStyle="default" />
                <ThemedView style={styles.container}>
                    <ScrollView contentContainerStyle={styles.contentContainer}>
                        <ThemedView style={styles.mainSection}>
                            <ThemedView style={styles.section}>
                                <ThemedText style={styles.title}>{t('documentation.ourBestGuide')}</ThemedText>
                                
                                <ThemedText style={styles.description}>
                                    {t('documentation.welcome')}
                                </ThemedText>
                                
                                <ThemedText style={styles.subtitle}>📎 {t('documentation.eventTypes')}</ThemedText>
                                
                                <ThemedText style={styles.sectionTitle}>💡 {t('documentation.donation')}</ThemedText>
                                <ThemedText style={styles.description}>
                                    {t('documentation.donationDesc')}
                                </ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.donationPoint1')}</ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.donationPoint2')}</ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.donationPoint3')}</ThemedText>
                                
                                <ThemedText style={styles.sectionTitle}>💡 {t('documentation.fundraising')}</ThemedText>
                                <ThemedText style={styles.description}>
                                    {t('documentation.fundraisingDesc')}
                                </ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.fundraisingPoint1')}</ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.fundraisingPoint2')}</ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.fundraisingPoint3')}</ThemedText>
                                
                                <ThemedText style={styles.sectionTitle}>💡 {t('documentation.jackpot')}</ThemedText>
                                <ThemedText style={styles.description}>
                                    {t('documentation.jackpotDesc')}
                                </ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.jackpotPoint1')}</ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.jackpotPoint2')}</ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.jackpotPoint3')}</ThemedText>
                                
                                <ThemedText style={styles.subtitle}>📎 {t('documentation.creatingEvent')}</ThemedText>
                                <ThemedText style={styles.description}>
                                    {t('documentation.setupIntro')}
                                </ThemedText>
                                <ThemedText style={styles.bullet}>• <ThemedText style={styles.bold}>{t('documentation.setupName')}</ThemedText> {t('documentation.setupNameDesc')}</ThemedText>
                                <ThemedText style={styles.bullet}>• <ThemedText style={styles.bold}>{t('documentation.setupDescription')}</ThemedText> {t('documentation.setupDescriptionDesc')}</ThemedText>
                                <ThemedText style={styles.bullet}>• <ThemedText style={styles.bold}>{t('documentation.setupType')}</ThemedText> {t('documentation.setupTypeDesc')}</ThemedText>
                                <ThemedText style={styles.bullet}>• <ThemedText style={styles.bold}>{t('documentation.setupRecipient')}</ThemedText> {t('documentation.setupRecipientDesc')}</ThemedText>
                                <ThemedText style={styles.bullet}>• <ThemedText style={styles.bold}>{t('documentation.setupImage')}</ThemedText> {t('documentation.setupImageDesc')}</ThemedText>
                                <ThemedText style={styles.bullet}>• <ThemedText style={styles.bold}>{t('documentation.setupConditions')}</ThemedText> {t('documentation.setupConditionsDesc')}</ThemedText>
                                
                                
                                <ThemedText style={styles.subtitle}>📎 {t('documentation.settingConditions')}</ThemedText>
                                <ThemedText style={styles.description}>
                                    {t('documentation.conditionsDesc')}
                                </ThemedText>
                                
                                <ThemedText style={styles.sectionTitle}>💡 {t('documentation.moneyGoals')}</ThemedText>
                                <ThemedText style={styles.description}>
                                    {t('documentation.moneyGoalsDesc')}
                                </ThemedText>

                                <ThemedText style={styles.description}>
                                    {t('documentation.moneyGoalsExample')}
                                </ThemedText>

                                <ThemedText style={styles.sectionTitle}>💡 {t('documentation.peopleGoals')}</ThemedText>
                                <ThemedText style={styles.description}>
                                    {t('documentation.peopleGoalsDesc')}
                                </ThemedText>

                                <ThemedText style={styles.description}>
                                    {t('documentation.peopleGoalsExample')}
                                </ThemedText>
                                
                                <ThemedText style={styles.sectionTitle}>💡 {t('documentation.timeLimits')}</ThemedText>
                                <ThemedText style={styles.description}>
                                    {t('documentation.timeLimitsDesc')}
                                </ThemedText>

                                <ThemedText style={styles.description}>
                                    {t('documentation.timeLimitsExample')}
                                </ThemedText>
                                
                                <ThemedText style={styles.sectionTitle}>💡 {t('documentation.combiningConditions')}</ThemedText>
                                <ThemedText style={styles.description}>
                                    {t('documentation.combiningDesc')}
                                </ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.combiningPoint1')}</ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.combiningPoint2')}</ThemedText>
                                
                                <ThemedText style={styles.description}>
                                    {t('documentation.combiningExample')}
                                </ThemedText>
                                
                                <ThemedText style={styles.subtitle}>📎 {t('documentation.findingEvents')}</ThemedText>
                                <ThemedText style={styles.description}>
                                    {t('documentation.findingDesc')}
                                </ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.findingPoint1')}</ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.findingPoint2')}</ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.findingPoint3')}</ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.findingPoint4')}</ThemedText>
                                
                                <ThemedText style={styles.subtitle}>📎 {t('documentation.participating')}</ThemedText>
                                <ThemedText style={styles.description}>
                                    {t('documentation.participatingDesc')}
                                </ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.participatingPoint1')}</ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.participatingPoint2')}</ThemedText>
                                
                                <ThemedText style={styles.description}>
                                    {t('documentation.participatingProgress')}
                                </ThemedText>
                                
                                <ThemedText style={styles.subtitle}>📎 {t('documentation.eventCompletion')}</ThemedText>
                                <ThemedText style={styles.description}>
                                    {t('documentation.completionDesc')}
                                </ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.completionPoint1')}</ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.completionPoint2')}</ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.completionPoint3')}</ThemedText>
                                
                                <ThemedText style={styles.description}>
                                    {t('documentation.completionDetails')}
                                </ThemedText>
                                
                                <ThemedText style={styles.subtitle}>📎 {t('documentation.behindScenes')}</ThemedText>
                                <ThemedText style={styles.description}>
                                    {t('documentation.behindScenesDesc')}
                                </ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.behindScenesPoint1')}</ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.behindScenesPoint2')}</ThemedText>
                                <ThemedText style={styles.bullet}>• {t('documentation.behindScenesPoint3')}</ThemedText>
                                
                                <ThemedText style={styles.description}>
                                    {t('documentation.behindScenesDetails')}
                                </ThemedText>
                                
                                <ThemedText style={styles.subtitle}>📎 {t('documentation.proTips')}</ThemedText>
                                
                                <View style={styles.tipBox}>
                                    <ThemedText style={styles.tipTitle}>🌟 {t('documentation.tipStandOut')}</ThemedText>
                                    <ThemedText style={styles.tipText}>
                                        {t('documentation.tipStandOutDesc')}
                                    </ThemedText>
                                </View>
                                
                                <View style={styles.tipBox}>
                                    <ThemedText style={styles.tipTitle}>⏱️ {t('documentation.tipTiming')}</ThemedText>
                                    <ThemedText style={styles.tipText}>
                                        {t('documentation.tipTimingDesc')}
                                    </ThemedText>
                                </View>
                                
                                <View style={styles.tipBox}>
                                    <ThemedText style={styles.tipTitle}>💰 {t('documentation.tipGoals')}</ThemedText>
                                    <ThemedText style={styles.tipText}>
                                        {t('documentation.tipGoalsDesc')}
                                    </ThemedText>
                                </View>
                                
                                <View style={styles.tipBox}>
                                    <ThemedText style={styles.tipTitle}>🎮 {t('documentation.tipJackpot')}</ThemedText>
                                    <ThemedText style={styles.tipText}>
                                        {t('documentation.tipJackpotDesc')}
                                    </ThemedText>
                                </View>
                                
                                <View style={styles.tipBox}>
                                    <ThemedText style={styles.tipTitle}>🔄 {t('documentation.tipConditions')}</ThemedText>
                                    <ThemedText style={styles.tipText}>
                                        {t('documentation.tipConditionsDesc')}
                                    </ThemedText>
                                </View>
                                
                                <ThemedText style={styles.subtitle}>📎 {t('documentation.getStarted')}</ThemedText>
                                <ThemedText style={styles.description}>
                                    {t('documentation.getStartedDesc')}
                                </ThemedText>

                                {/* NEW EVENT SECTION */}
                                <CreateEventSection />


                                <ThemedText style={styles.subtitle}>📎 {t('documentation.topUpBalance')}</ThemedText>
                                <ThemedText style={styles.description}>
                                    {t('documentation.topUpBalanceDesc')}
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>
                    </ScrollView>
                </ThemedView>
            </ThemedView>
        </>
    );
} 
import React, { useState } from 'react';
import { StyleSheet, View, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { Stack, Redirect } from 'expo-router';
import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { useThemeColor } from '@/lib/hooks/ui';
import { CustomButton } from '@/components/custom/button';
import { TextInput } from 'react-native';
import { useAuth } from '@/lib/context/AuthContext';
import { horizontalScale, moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useUserBalance } from '@/lib/hooks/users';
import { useTranslation } from 'react-i18next';

export default function BalanceScreen() {
    const { user } = useAuth();

    const { t } = useTranslation();
    const [amount, setAmount] = useState('');
    
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'divider');
    const placeholderColor = useThemeColor({}, 'placeholder');
    const textColor = useThemeColor({}, 'text');
    const errorColor = useThemeColor({}, 'error');
    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const headerBackground = useThemeColor({}, 'headerBackground');
    const headerText = useThemeColor({}, 'headerText');

    if (!user) {
        return <Redirect href="/login" />;
    }
    const userId = user?.id ? String(user.id) : null;
    const { balance, loading: loadingBalance, refetch: refreshBalance, error: balanceError, updateBalance, updateLoading } = useUserBalance({ 
        userId,
        enableSubscription: false // prevent infinite re-renders
    });

    const handleAddBalance = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            Alert.alert(t('settings.alerts.invalidAmount'), t('settings.alerts.invalidAmountMessage'));
            return;
        }

        const result = await updateBalance(parseFloat(amount));
        
        if (result.success) {
            Alert.alert(t('settings.alerts.success'), t('settings.alerts.balanceUpdated'));
            refreshBalance();
            setAmount('');
        } else {
            Alert.alert(t('settings.alerts.error'), balanceError || t('settings.alerts.failedToAddBalance'));
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: t('settings.balancePage.title'),
                    headerBackTitle: t('settings.balancePage.backTitle'),
                    headerShown: true,
                    headerStyle: { backgroundColor: headerBackground },
                    headerTitleStyle: { color: headerText },
                }}
            />
            <SafeAreaView style={styles.container}>
                <ThemedView style={styles.container}>
                    <StatusBar barStyle="default" />
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <KeyboardAvoidingView 
                            style={styles.container} 
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        >
                            <ScrollView
                                style={styles.container}
                                contentContainerStyle={styles.contentContainer}
                            >
                                <View style={styles.sectionHeader}>
                                    <ThemedText style={styles.sectionTitle}>{t('settings.balancePage.balance')}</ThemedText>
                                </View>
                                
                                <ThemedView style={[styles.mainSection, { backgroundColor: sectionBackground }]}>
                                    <View style={styles.balanceContainer}>
                                        {loadingBalance ? (
                                            <ActivityIndicator size="small" color={primaryColor} />
                                        ) : (
                                            <>
                                                <ThemedText style={styles.balanceAmount}>
                                                    ${balance !== null ? balance.toFixed(2) : '0.00'}
                                                </ThemedText>
                                                {balanceError && (
                                                    <ThemedText style={styles.errorText}>{balanceError}</ThemedText>
                                                )}
                                            </>
                                        )}
                                    </View>
                                </ThemedView>

                                <View style={styles.sectionHeader}>
                                    <ThemedText style={styles.sectionTitle}>{t('settings.balancePage.addFunds')}</ThemedText>
                                </View>
                                <ThemedView style={[styles.mainSection, { backgroundColor: sectionBackground }]}>
                                    <View style={styles.formContainer}>
                                        
                                        <View style={[styles.inputContainer, { borderColor }]}>
                                            <ThemedText style={styles.dollarSign}>$</ThemedText>
                                            <TextInput
                                                style={[styles.input, { color: textColor }]}
                                                placeholder={t('settings.balancePage.amount')}
                                                placeholderTextColor={placeholderColor}
                                                keyboardType="numeric"
                                                value={amount}
                                                onChangeText={setAmount}
                                                maxLength={10}
                                            />
                                        </View>

                                        {balanceError && (
                                            <ThemedText style={styles.errorText}>{balanceError}</ThemedText>
                                        )}

                                        <CustomButton 
                                            title={updateLoading ? t('settings.balancePage.processing') : t('settings.balancePage.addFunds')}
                                            onPress={handleAddBalance}
                                            disabled={updateLoading || !amount || isNaN(Number(amount)) || Number(amount) <= 0}
                                            style={styles.submitButton}
                                            variant="primary"
                                        />
                                    </View>
                                </ThemedView>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
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
    balanceContainer: {
        alignItems: 'center',
        padding: moderateScale(20),
    },
    balanceLabel: {
        fontSize: moderateScale(18),
        marginBottom: verticalScale(8),
    },
    balanceAmount: {
        //marginTop: verticalScale(12),
        fontSize: moderateScale(36),
        fontWeight: 'bold',
        lineHeight: moderateScale(44),
    },
    formContainer: {
        padding: moderateScale(16),
    },
    label: {
        fontSize: moderateScale(16),
        marginBottom: verticalScale(8),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: moderateScale(8),
        marginBottom: verticalScale(20),
        paddingHorizontal: horizontalScale(12),
    },
    dollarSign: {
        fontSize: moderateScale(24),
        fontWeight: 'bold',
        marginRight: horizontalScale(8),
    },
    input: {
        flex: 1,
        height: verticalScale(50),
        fontSize: moderateScale(18),
        borderWidth: 0,
    },
    submitButton: {
        marginTop: moderateScale(16),
        width: '100%',
    },
    errorText: {
        color: 'red',
        fontSize: moderateScale(14),
        marginBottom: verticalScale(16),
    },
});

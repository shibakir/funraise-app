import React, { useState } from 'react';
import { StyleSheet, View, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { Stack, Redirect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { CustomButton } from '@/components/custom/button';
import { TextInput } from 'react-native';
import { useAuth } from '@/lib/context/AuthContext';
import { horizontalScale, moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useUserBalance } from '@/lib/hooks/useUserBalance';
import { useUpdateBalance } from '@/lib/hooks/useUpdateBalance';
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
    const userId = String(user.id);
    const { balance, loading: loadingBalance, refresh: refreshBalance, error: balanceError } = useUserBalance(userId);
    const { updateBalance, loading: loadingUpdate, error: updateError } = useUpdateBalance();

    const handleAddBalance = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid positive number');
            return;
        }

        const result = await updateBalance(userId, parseFloat(amount));
        
        if (result.success) {
            Alert.alert('Success', 'Balance was successfully updated');
            refreshBalance();
            setAmount('');
        } else {
            Alert.alert('Error', updateError || 'Failed to add balance');
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: t('settings.balance') || 'Balance',
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
                                    <ThemedText style={styles.sectionTitle}>{t('settings.balanceTitle') || 'Account Balance'}</ThemedText>
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
                                    <ThemedText style={styles.sectionTitle}>{t('settings.addFunds') || 'Add Funds'}</ThemedText>
                                </View>
                                <ThemedView style={[styles.mainSection, { backgroundColor: sectionBackground }]}>
                                    <View style={styles.formContainer}>
                                        
                                        <View style={[styles.inputContainer, { borderColor }]}>
                                            <ThemedText style={styles.dollarSign}>$</ThemedText>
                                            <TextInput
                                                style={[styles.input, { color: textColor }]}
                                                placeholder={t('settings.amount') || 'Enter amount'}
                                                placeholderTextColor={placeholderColor}
                                                keyboardType="numeric"
                                                value={amount}
                                                onChangeText={setAmount}
                                                maxLength={10}
                                            />
                                        </View>

                                        {updateError && (
                                            <ThemedText style={styles.errorText}>{updateError}</ThemedText>
                                        )}

                                        <CustomButton 
                                            title={loadingUpdate ? t('settings.processing') || 'Processing...' : t('settings.addFunds') || 'Add Funds'}
                                            onPress={handleAddBalance}
                                            disabled={loadingUpdate || !amount || isNaN(Number(amount)) || Number(amount) <= 0}
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
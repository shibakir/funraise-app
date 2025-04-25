import React, { useState } from 'react';
import { StyleSheet, View, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, SafeAreaView, ScrollView } from 'react-native';
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

export default function BalanceScreen() {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'divider');
    const placeholderColor = useThemeColor({}, 'placeholder');
    const textColor = useThemeColor({}, 'text');
    const errorColor = useThemeColor({}, 'error');

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

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            flexGrow: 1,
        },
        contentContainer: {
            padding: moderateScale(16),
            paddingBottom: verticalScale(40),
            flexGrow: 1,
        },
        balanceContainer: {
            alignItems: 'center',
            marginVertical: verticalScale(30),
        },
        balanceLabel: {
            fontSize: moderateScale(18),
            marginBottom: verticalScale(8),
        },
        balanceAmount: {
            marginTop: verticalScale(20),
            fontSize: moderateScale(36),
            fontWeight: 'bold',
            lineHeight: moderateScale(44),
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderRadius: moderateScale(10),
            marginBottom: verticalScale(24),
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
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: moderateScale(12),
            borderBottomWidth: 1,
        },
        headerTitle: {
            fontSize: moderateScale(18),
            fontWeight: '600',
        },
        submitButton: {
            marginTop: moderateScale(20),
            marginBottom: moderateScale(20),
            width: '100%',
        },
        sectionDescription: {
            fontSize: moderateScale(14),
            color: placeholderColor,
            lineHeight: moderateScale(20),
        },
        errorText: {
            color: errorColor,
            fontSize: moderateScale(14),
            marginVertical: verticalScale(10),
        },
    }); 

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Stack.Screen
                    options={{
                        title: 'Balance',
                        headerShown: true,
                    }}
                />
                <ThemedView style={styles.contentContainer}>

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

                    <View style={[styles.inputContainer, { borderColor }]}>

                        <TextInput
                            style={[styles.input, { color: textColor }]}
                            placeholder="Enter amount"
                            placeholderTextColor={textColor + '80'}
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                            maxLength={10}
                        />
                    </View>

                    {updateError && (
                        <ThemedText style={styles.errorText}>{updateError}</ThemedText>
                    )}

                    <ThemedText style={styles.sectionDescription}>
                        { updateError ? updateError :
                            "Enter the amount to refill your account balance."
                        }
                    </ThemedText>
                    <CustomButton 
                        onPress={handleAddBalance}
                        disabled={loadingUpdate || !amount || isNaN(Number(amount)) || Number(amount) <= 0}
                        style={styles.submitButton}
                    >
                        <ThemedText style={{ color: 'white', fontWeight: '600', fontSize: moderateScale(16) }}>
                            {loadingUpdate ? 'Processing...' : 'Add Balance'}
                        </ThemedText>
                    </CustomButton>
                </ThemedView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}
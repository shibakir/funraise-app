import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useAuth } from '@/lib/context/AuthContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CustomButton } from '@/components/custom/button';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { useTranslation } from 'react-i18next';

import { LogoBox } from '@/components/auth/LogoBox';

export default function RegisterScreen() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { register, isLoading, error } = useAuth();
    const { t } = useTranslation();
    
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const surfaceColor = useThemeColor({}, 'surface');
    const errorColor = useThemeColor({}, 'error');
  
    const handleRegister = async () => {
        if (!username || !email || !password || !confirmPassword) {
            Alert.alert(t('auth.error'), t('auth.fillAllFields'));
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert(t('auth.error'), t('auth.passwordsNotMatch'));
            return;
        }

        try {
            await register(username, email, password);
            router.replace('/(app)/(tabs)/home');
        } catch (error: any) {
            Alert.alert(t('auth.error'), error.message || t('auth.failedToRegister'));
        }
    };
  
    // handler for login page
    const navigateToLogin = () => {
        router.push('/(auth)/login');
    };
  
    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={[styles.container, { backgroundColor }]}
        >
            <StatusBar style="auto" />

            <LogoBox/>

            <ThemedView style={styles.formContainer}>

                <TextInput
                    style={[styles.input, { backgroundColor: surfaceColor, color: textColor, borderColor: primaryColor }]}
                    placeholder={t('auth.username')}
                    placeholderTextColor="#888"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="words"
                />

                <TextInput
                    style={[styles.input, { backgroundColor: surfaceColor, color: textColor, borderColor: primaryColor }]}
                    placeholder={t('auth.email')}
                    placeholderTextColor="#888"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={[styles.input, { backgroundColor: surfaceColor, color: textColor, borderColor: primaryColor }]}
                    placeholder={t('auth.password')}
                    placeholderTextColor="#888"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TextInput
                    style={[styles.input, { backgroundColor: surfaceColor, color: textColor, borderColor: primaryColor }]}
                    placeholder={t('auth.confirmPassword')}
                    placeholderTextColor="#888"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />

                {isLoading ? (
                    <ActivityIndicator size="large" color={primaryColor} style={styles.loader} />
                ) : (
                    <CustomButton
                        title={t('auth.register')}
                        onPress={handleRegister}
                        variant="primary"
                        size="large"
                    />
                )}

                <ThemedView style={styles.loginContainer}>
                    <ThemedText>{t('auth.haveAccount')} </ThemedText>
                    <TouchableOpacity onPress={navigateToLogin}>
                        <ThemedText style={[styles.loginLink, { color: primaryColor }]}>
                            {t('auth.login')}
                        </ThemedText>
                    </TouchableOpacity>
                    </ThemedView>
              </ThemedView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 12,
    },
    errorText: {
        marginBottom: 16,
        textAlign: 'center',
    },
    loader: {
        marginTop: 20,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    loginLink: {
        fontWeight: 'bold',
    },
}); 
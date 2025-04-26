import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, LogBox } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useAuth } from '@/lib/context/AuthContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CustomButton } from '@/components/custom/button';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { useTranslation } from 'react-i18next';

import { LogoBox } from '@/components/auth/LogoBox';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error } = useAuth();
    const { t } = useTranslation();
    
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const surfaceColor = useThemeColor({}, 'surface');
    const errorColor = useThemeColor({}, 'error');
    
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert(t('auth.error'), t('auth.fillAllFields'));
            return;
        }
        
        try {
            await login(email, password);
            router.replace('/(tabs)/home');
        } catch (error: any) {
            Alert.alert(t('auth.error'), error.message || t('auth.failedToLogin'));
        }
    };
    
    // handler for register page
    const navigateToRegister = () => {
        router.push('/register');
    };
  
    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={[styles.container, { backgroundColor }]}
        >
            <StatusBar style="auto" />

            <LogoBox/>
        
            <ThemedView style={styles.formContainer}>
                {
                /*error && (
                    <ThemedText style={[styles.errorText, { color: errorColor }]}>
                        {error}
                    </ThemedText>
                )*/
                }
                
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
                
                {isLoading ? (
                    <ActivityIndicator size="large" color={primaryColor} style={styles.loader} />
                ) : (
                    <CustomButton
                        title={t('auth.login')}
                        onPress={handleLogin}
                        variant="primary"
                        size="large"
                    />
                )}
                
                <ThemedView style={styles.registerContainer}>
                    <ThemedText>{t('auth.notRegistered')} </ThemedText>
                    <TouchableOpacity onPress={navigateToRegister}>
                        <ThemedText style={[styles.registerLink, { color: primaryColor }]}>
                            {t('auth.register')}
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
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    registerLink: {
        fontWeight: 'bold',
    },
}); 
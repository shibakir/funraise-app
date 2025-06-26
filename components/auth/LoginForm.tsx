import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

import { useAuth } from '@/lib/context/AuthContext';
import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { CustomButton } from '@/components/custom/button';
import { useThemeColor } from '@/lib/hooks/ui';
import { useTranslation } from 'react-i18next';

export default function LoginForm() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { login, loginWithDiscord, isLoading, error } = useAuth();
    const { t } = useTranslation();

    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
    const surfaceColor = useThemeColor({}, 'surface');


    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert(t('auth.error'), t('auth.fillAllFields'));
            return;
        }

        try {
            await login(email, password);
        } catch (error: any) {
            //Alert.alert(t('auth.error'), error.message || t('auth.failedToLogin'));
            Alert.alert(t('auth.error'), t('auth.failedToLogin'));
        }
    };

    const handleDiscordLogin = async () => {
        try {
            await loginWithDiscord();
        } catch (error: any) {
            Alert.alert(t('auth.error'), error.message || t('auth.discordLoginFailed'));
        }
    };

    const navigateToRegister = () => {
        router.push('/(auth)/register');
    };

    return (
        <ThemedView style={styles.formContainer}>
            <TextInput
                style={[styles.input, { backgroundColor: surfaceColor, color: textColor, borderColor: primaryColor }]}
                placeholder={t('auth.email')}
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="none"
            />

            <TextInput
                style={[styles.input, { backgroundColor: surfaceColor, color: textColor, borderColor: primaryColor }]}
                placeholder={t('auth.password')}
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                textContentType="none"
            />

            {isLoading ? (
                <ActivityIndicator size="large" color={primaryColor} style={styles.loader} />
            ) : (
                <>
                    <CustomButton
                        title={t('auth.login')}
                        onPress={handleLogin}
                        variant="primary"
                        size="large"
                    />
                    
                    <ThemedView style={styles.divider}>
                        <ThemedView style={[styles.line, { backgroundColor: textColor }]} />
                        <ThemedText style={styles.dividerText}>{t('auth.or')}</ThemedText>
                        <ThemedView style={[styles.line, { backgroundColor: textColor }]} />
                    </ThemedView>
                    
                    <CustomButton
                        title={t('auth.discordButton')}
                        onPress={handleDiscordLogin}
                        variant="discord"
                        size="large"
                    />
                </>
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
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    line: {
        flex: 1,
        height: 1,
        opacity: 0.3,
    },
    dividerText: {
        marginHorizontal: 15,
        fontSize: 14,
        opacity: 0.7,
    },
});
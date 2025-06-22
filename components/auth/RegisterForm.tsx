import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

import { useAuth } from '@/lib/context/AuthContext';
import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { CustomButton } from '@/components/custom/button';
import { useThemeColor } from '@/lib/hooks/ui';
import { useTranslation } from 'react-i18next';

export default function RegisterForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { register, isLoading, error, loginWithDiscord } = useAuth();
    const { t } = useTranslation();
    
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
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
  
    const handleDiscordRegister = async () => {
        try {
            await loginWithDiscord();
        } catch (error: any) {
            Alert.alert(t('auth.error'), error.message || t('auth.discordLoginFailed'));
        }
    };
  
    // handler for login page
    const navigateToLogin = () => {
        router.push('/(auth)/login');
    };
  
    return (
        <ThemedView style={styles.formContainer}>
            <TextInput
                style={[styles.input, { backgroundColor: surfaceColor, color: textColor, borderColor: primaryColor }]}
                placeholder={t('auth.username')}
                placeholderTextColor="#888"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="words"
                textContentType="none"
            />

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
                textContentType="none"
            />

            <TextInput
                style={[styles.input, { backgroundColor: surfaceColor, color: textColor, borderColor: primaryColor }]}
                placeholder={t('auth.confirmPassword')}
                placeholderTextColor="#888"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                textContentType="none"
            />

            {isLoading ? (
                <ActivityIndicator size="large" color={primaryColor} style={styles.loader} />
            ) : (
                <>
                    <CustomButton
                        title={t('auth.register')}
                        onPress={handleRegister}
                        variant="primary"
                        size="large"
                    />

                    <ThemedView style={styles.divider}>
                        <ThemedView style={[styles.line, { backgroundColor: textColor }]} />
                        <ThemedText style={styles.dividerText}>{t('auth.or')}</ThemedText>
                        <ThemedView style={[styles.line, { backgroundColor: textColor }]} />
                    </ThemedView>

                    <ThemedView style={styles.discordButtonSpacing}>
                        <CustomButton
                            title={t('auth.discordRegisterButton')}
                            onPress={handleDiscordRegister}
                            variant="secondary"
                            size="large"
                        />
                    </ThemedView>
                </>
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
    );
}

const styles = StyleSheet.create({
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
    discordButtonSpacing: {
        //marginTop: 6,
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

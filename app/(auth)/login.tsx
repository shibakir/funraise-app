import React from 'react';
import { StyleSheet, KeyboardAvoidingView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useThemeColor } from '@/lib/hooks/ui';

import LoginForm from '@/components/auth/LoginForm';
import { LogoBox } from '@/components/auth/LogoBox';

export default function LoginScreen() {
    const backgroundColor = useThemeColor({}, 'background');

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor }]}
        >
            <StatusBar style="auto" />
            <LogoBox/>
            <LoginForm/>
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
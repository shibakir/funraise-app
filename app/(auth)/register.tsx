import React from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useThemeColor } from '@/lib/hooks/ui';

import RegisterForm from '@/components/auth/RegisterForm';
import { LogoBox } from '@/components/auth/LogoBox';

export default function RegisterScreen() {
    const backgroundColor = useThemeColor({}, 'background');

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={[styles.container, { backgroundColor }]}
        >
            <StatusBar style="auto" />
            <LogoBox/>
            <RegisterForm/>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
}); 
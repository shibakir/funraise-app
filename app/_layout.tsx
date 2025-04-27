import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import { AuthProvider } from '@/lib/context/AuthContext';

// import i18n configuration
import '@/lib/localization/i18n';

export default function Layout() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <StatusBar style="auto" />
                <Stack 
                    screenOptions={{
                        headerShown: false,
                    }}
                />
            </AuthProvider>
        </ThemeProvider>
    );
}

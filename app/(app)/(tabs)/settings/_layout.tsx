import { Stack } from 'expo-router';
import React from 'react';

export default function SettingsLayout() {
    return (
        <Stack>
            <Stack.Screen 
                name="appearance" 
                options={{ 
                    headerShown: true, 
                    title: 'Appearance',
                    headerBackTitle: 'Settings' 
                }} 
            />
            <Stack.Screen 
                name="language" 
                options={{ 
                    headerShown: true, 
                    title: 'Language',
                    headerBackTitle: 'Settings' 
                }} 
            />
            <Stack.Screen 
                name="account" 
                options={{ 
                    headerShown: true, 
                    title: 'Account',
                    headerBackTitle: 'Settings' 
                }} 
            />
            <Stack.Screen 
                name="detail"
                options={{ 
                    headerShown: true,
                    headerBackTitle: 'Settings' 
                }}
            />
            <Stack.Screen 
                name="info"
                options={{ 
                    headerShown: true,
                    title: 'App Info',
                    headerBackTitle: 'Settings' 
                }}
            />
            <Stack.Screen 
                name="privacy-policy"
                options={{ 
                    headerShown: true,
                    title: 'Privacy Policy',
                    headerBackTitle: 'Settings' 
                }}
            />
            <Stack.Screen 
                name="terms-of-service"
                options={{ 
                    headerShown: true,
                    title: 'Terms of Service',
                    headerBackTitle: 'Settings' 
                }}
            />
            <Stack.Screen 
                name="help"
                options={{ 
                    headerShown: true,
                    title: 'Help & Support',
                    headerBackTitle: 'Settings' 
                }}
            />
            <Stack.Screen 
                name="privacy-security"
                options={{ 
                    headerShown: true,
                    title: 'Privacy & Security',
                    headerBackTitle: 'Settings' 
                }}
            />
            <Stack.Screen 
                name="notifications"
                options={{ 
                    headerShown: true,
                    title: 'Notifications',
                    headerBackTitle: 'Settings' 
                }}
            />
        </Stack>
    );
} 
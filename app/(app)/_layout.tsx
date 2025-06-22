import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/lib/context/AuthContext';
import { useThemeColor } from '@/lib/hooks/ui';
import { RefreshProvider } from '@/lib/context/RefreshContext';

export default function AppLayout() {
    const { isAuthenticated, isLoading } = useAuth();
    const backgroundColor = useThemeColor({}, 'background');
    
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
    
    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }
    
    return (
        <RefreshProvider>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </RefreshProvider>
    );
} 
import { Slot, Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/lib/context/AuthContext';
import { useThemeColor } from '@/lib/hooks/useThemeColor';

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
    
    return <Slot />;
} 
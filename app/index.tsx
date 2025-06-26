import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/lib/context/AuthContext';
import { useThemeColor } from '@/lib/hooks/ui';

export default function Index() {
    const { isAuthenticated, isLoading } = useAuth();
    const backgroundColor = useThemeColor({}, 'background');

    // Show loading while checking saved authentication data
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (isAuthenticated) {
        return <Redirect href="/(app)/(tabs)/home" />;
    } else {
        return <Redirect href="/(auth)/login" />;
    }
} 
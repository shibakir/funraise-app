import { Slot } from 'expo-router';
import '@/lib/localization/i18n';

import { ThemeProvider } from '@/lib/context/ThemeContext';
import { AuthProvider } from '@/lib/context/AuthContext';
import { ApolloProvider } from '@/lib/providers/ApolloProvider';

export default function RootLayout() {
    return (
        <ThemeProvider>
            <ApolloProvider>
                <AuthProvider>
                    <Slot />
                </AuthProvider>
            </ApolloProvider>
        </ThemeProvider>
    );
}

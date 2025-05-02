import { Slot } from 'expo-router';
import '@/lib/localization/i18n';

import { ThemeProvider } from '@/lib/context/ThemeContext';
import { AuthProvider } from '@/lib/context/AuthContext';

export default function AuthLayout() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Slot />
            </AuthProvider>
        </ThemeProvider>
    );
} 
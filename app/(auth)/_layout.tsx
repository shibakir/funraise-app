import { Slot } from 'expo-router';
import '@/lib/localization/i18n';

import { ThemeProvider } from '@/lib/context/ThemeContext';

export default function AuthLayout() {
    return (
        <ThemeProvider>
            <Slot />
        </ThemeProvider>
    );
} 
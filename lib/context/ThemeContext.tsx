import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/** Theme type definition supporting dark, light, and system preferences */
type ThemeType = 'dark' | 'light' | 'system';

/**
 * Theme context interface defining theme management functionality.
 * Provides theme state, setter, and resolved theme value.
 */
type ThemeContextType = {
    /** Current theme setting (dark, light, or system) */
    theme: ThemeType;
    /** Function to update the theme setting */
    setTheme: (theme: ThemeType) => void;
    /** Resolved theme value (either 'dark' or 'light') based on system preference when theme is 'system' */
    resolvedTheme: 'dark' | 'light';
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme provider component that manages global theme state and persistence.
 * Handles theme storage, system theme detection, and provides theme context
 * to all child components. Automatically saves theme preferences to secure storage.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap with theme context
 * @returns {JSX.Element} Provider component with theme context
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const deviceTheme = useDeviceColorScheme();
    const [theme, setTheme] = useState<ThemeType>('system');
    
    // Load saved theme on startup
    useEffect(() => {
        /**
         * Loads the saved theme preference from secure storage.
         * Falls back to 'system' theme if no saved preference exists.
         */
        const loadTheme = async () => {
            try {
                const savedTheme = await SecureStore.getItemAsync('user-theme');
                if (savedTheme) {
                    setTheme(savedTheme as ThemeType);
                }
            } catch (error) {
                console.error('Failed to load theme:', error);
            }
        };
        
        loadTheme();
    }, []);
    
    // Save theme when it changes
    useEffect(() => {
        /**
         * Saves the current theme preference to secure storage.
         * Persists user's theme choice across app sessions.
         */
        const saveTheme = async () => {
        try {
            await SecureStore.setItemAsync('user-theme', theme);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
        };
        
        saveTheme();
    }, [theme]);
    
    // Determine the actual theme based on system and user preference
    const resolvedTheme = theme === 'system' ? deviceTheme || 'dark' : theme;
    
    const value = {
        theme,
        setTheme,
        resolvedTheme,
    };
    
    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

/**
 * Custom hook to access the theme context.
 * Must be used within a ThemeProvider component.
 * 
 * @returns {ThemeContextType} Theme context with current theme, setter, and resolved theme
 * @throws {Error} When used outside of ThemeProvider
 */
export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
} 
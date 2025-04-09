import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark' | 'system';
type ThemeContextType = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  resolvedTheme: 'light' | 'dark';
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceTheme = useDeviceColorScheme();
  const [theme, setTheme] = useState<ThemeType>('system');
  
  // Load saved theme on startup
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('user-theme');
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
    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem('user-theme', theme);
      } catch (error) {
        console.error('Failed to save theme:', error);
      }
    };
    
    saveTheme();
  }, [theme]);
  
  // Determine the actual theme based on system and user preference
  const resolvedTheme = theme === 'system' 
    ? deviceTheme || 'dark' 
    : theme;
  
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

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 
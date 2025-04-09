import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ThemeProvider } from '@/lib/context/ThemeContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { AuthProvider, useAuth } from '@/lib/context/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// navigation wrapper component that gets theme from context
function NavigationThemeWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  
  return (
    <NavigationThemeProvider value={resolvedTheme === 'dark' ? DarkTheme : DefaultTheme}>
      {children}
    </NavigationThemeProvider>
  );
}

// component for checking user authentication and redirecting
function AuthRouter({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const isLoginOrRegister = segments[0] === 'login' || segments[0] === 'register';

    if (!token && inAuthGroup) {
      // if user is not authenticated and tries to access protected routes
      router.replace('/login');
    } else if (token && isLoginOrRegister) {
      // if user is authenticated and tries to access login or register page
      router.replace('/(tabs)');
    }
  }, [token, segments, isLoading]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
      <ThemeProvider>
        <AuthProvider>
          <NavigationThemeWrapper>
            <AuthRouter>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="register" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </AuthRouter>
          </NavigationThemeWrapper>
        </AuthProvider>
      </ThemeProvider>
  );
}

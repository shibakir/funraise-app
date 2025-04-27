import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/lib/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {

    const { t } = useTranslation();
    const { resolvedTheme } = useTheme();
    const colorScheme = resolvedTheme;

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme].tint,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                tabBarStyle: {
                    backgroundColor: colorScheme === 'dark' ? Colors.dark.background : Colors.light.background,
                    ...(Platform.OS === 'ios' ? { position: 'absolute' } : {}),
                },
                tabBarInactiveTintColor: colorScheme === 'dark' ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                title: t('tabs.home'),
                tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name="house.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                title: t('tabs.explore'),
                tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                title: t('tabs.search'),
                tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                title: t('tabs.settings'),
                tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name="gear" color={color} />,
                }}
            />
        </Tabs>
    );
}

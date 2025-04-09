import { Stack } from 'expo-router';
import React from 'react';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="appearance" 
        options={{ 
          headerShown: true, 
          title: 'Appearance',
          headerBackTitle: 'Settings' 
        }} 
      />
      <Stack.Screen 
        name="language" 
        options={{ 
          headerShown: true, 
          title: 'Language',
          headerBackTitle: 'Settings' 
        }} 
      />
      <Stack.Screen 
        name="account" 
        options={{ 
          headerShown: true, 
          title: 'Account',
          headerBackTitle: 'Settings' 
        }} 
      />
      <Stack.Screen 
        name="detail"
        options={{ 
          headerShown: true,
          headerBackTitle: 'Settings' 
        }}
      />
    </Stack>
  );
} 
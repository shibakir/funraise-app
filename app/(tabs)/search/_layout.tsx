import React from 'react';
import { Stack } from 'expo-router';

export default function SearchLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="index"
        options={{ 
          title: 'Search',
        }} 
      />
    </Stack>
  );
} 
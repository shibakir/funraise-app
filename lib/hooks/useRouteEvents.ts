import { useEffect } from 'react';
import { usePathname } from 'expo-router';
import { useUserEvents } from './useUserEvents';

export const useRouteEvents = (userId: string, limit?: number) => {
  const pathname = usePathname();
  const { fetchUserEvents } = useUserEvents();

  // Запускаем каждый раз при рендере на страницах home и explore
  const homeScreenPaths = ['/', '/index', '/(tabs)/home'];
  const exploreScreenPaths = ['/explore', '/(tabs)/explore'];
  
  const isHomeScreen = homeScreenPaths.includes(pathname);
  const isExploreScreen = exploreScreenPaths.includes(pathname);
  
  useEffect(() => {
    // Обновляем данные на страницах Home или Explore при каждом рендере
    if (isHomeScreen || isExploreScreen) {
      fetchUserEvents(userId, limit);
    }
  });
}; 
import { useEffect } from 'react';
import { usePathname } from 'expo-router';
import { useUserEvents } from './useUserEvents';

export const useRouteEvents = (userId: string) => {
  const pathname = usePathname();
  const { fetchUserEvents } = useUserEvents();

  useEffect(() => {
    // Обновляем данные при входе на страницы Home или Explore
    if (pathname === '/' || pathname === '/index') {
      fetchUserEvents(userId);
    }
  }, [pathname, userId, fetchUserEvents]);
}; 
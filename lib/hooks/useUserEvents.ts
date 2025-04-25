import { useState } from 'react';
import { Alert } from 'react-native';

interface Event {
  id: string;
  name: string;
  description: string;
  type: string;
  status?: 'active' | 'inactive';
  imageUrl?: string;
  createdAt: string;
  /*endConditions?: {
    conditions: {
      parameterName: string;
      operator: string;
      value: string;
    }[];
    }[];
    */
  conditionsProgress: number[];
}

export const useUserEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserEvents = async (userId: string, limit: number = 0, eventType?: 'created' | 'participating') => {
    if (!userId) {
      setEvents([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let url = `http://localhost:3000/users/${userId}/events?limit=${limit}`;
      
      // Добавляем параметр типа, если он указан
      if (eventType) {
        url += `&type=${eventType}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
            //  'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events. Server is not responding. Check your internet connection.');
      Alert.alert('Error', 'Failed to fetch events. Server is not responding. Check your internet connection.');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetEvents = () => {
    setEvents([]);
    setError(null);
  };

  return {
    events,
    isLoading,
    error,
    fetchUserEvents,
    resetEvents,
  };
}; 
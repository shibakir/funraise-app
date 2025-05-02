import { useState, useCallback, useEffect } from 'react';
import { getApiUrl } from '../config/api';

export interface UserParticipation {
    id: string;
    userId: string;
    eventId: string;
    deposit: number;
    progress: number;
    status: string;
    createdAt: string;
}

export interface UseUserParticipationReturn {
    participation: UserParticipation | null;
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

export const useUserParticipation = (userId: string | null, eventId: string | null): UseUserParticipationReturn => {
  const [participation, setParticipation] = useState<UserParticipation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipation = useCallback(async () => {
    if (!userId || !eventId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl('USER_PARTICIPATION', userId, eventId));
      
      if (!response.ok) {
        if (response.status === 404) {
          // Участие не найдено, это нормальная ситуация
          setParticipation(null);
          setLoading(false);
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch participation');
      }

      const data = await response.json();
      setParticipation(data);
    } catch (err: any) {
      console.error('Error fetching user participation:', err);
      setError(err.message || 'Error fetching participation data');
    } finally {
      setLoading(false);
    }
  }, [userId, eventId]);

  useEffect(() => {
    fetchParticipation();
  }, [fetchParticipation]);

  return {
    participation,
    loading,
    error,
    refresh: fetchParticipation,
  };
}; 
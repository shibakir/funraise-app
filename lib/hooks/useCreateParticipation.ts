import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

interface CreateParticipationParams {
  userId: string;
  eventId: string;
  deposit: number;
}

interface CreateParticipationResponse {
  success: boolean;
  participation?: any;
}

export const useCreateParticipation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createParticipation = useCallback(async (params: CreateParticipationParams): Promise<CreateParticipationResponse> => {
    const { userId, eventId, deposit } = params;
    
    if (!userId) {
      setError('User ID is required');
      return { success: false };
    }

    if (!eventId) {
      setError('Event ID is required');
      return { success: false };
    }

    if (isNaN(deposit) || deposit <= 0) {
      setError('Please enter a valid positive deposit amount');
      return { success: false };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/participations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          eventId,
          deposit
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create participation');
      }

      const data = await response.json();
      return { success: true, participation: data };
    } catch (err: any) {
      console.error('Error creating participation:', err);
      const errorMessage = err.message || 'Failed to create participation. Please try again later.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  return { createParticipation, loading, error };
}; 
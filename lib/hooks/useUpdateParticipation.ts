import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

interface UpdateParticipationParams {
  id: string;
  deposit: number;
}

interface UpdateParticipationResponse {
  success: boolean;
  participation?: any;
}

export const useUpdateParticipation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateParticipation = useCallback(async (params: UpdateParticipationParams): Promise<UpdateParticipationResponse> => {
    const { id, deposit } = params;
    
    if (!id) {
      setError('Participation ID is required');
      return { success: false };
    }

    if (isNaN(deposit) || deposit <= 0) {
      setError('Please enter a valid positive deposit amount');
      return { success: false };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/participations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deposit
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update participation');
      }

      const data = await response.json();
      return { success: true, participation: data };
    } catch (err: any) {
      console.error('Error updating participation:', err);
      const errorMessage = err.message || 'Failed to update participation. Please try again later.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateParticipation, loading, error };
}; 
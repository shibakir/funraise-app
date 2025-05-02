import { useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../config/api';

export const useUserBalance = (userId: string | null) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!userId) {
      setBalance(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl('USER_BALANCE', userId));

      if (!response.ok) {
        throw new Error('Failed to load user balance');
      }

      const data = await response.json();
      setBalance(data);
    } catch (err) {
      console.error('Error fetching user balance:', err);
      setError('Failed to load balance. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const refresh = useCallback(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, error, refresh };
}; 
import { useState, useCallback } from 'react';

interface UpdateBalanceResponse {
    success: boolean;
    newBalance?: number;
}

export const useUpdateBalance = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateBalance = useCallback(async (userId: string | null, amount: number): Promise<UpdateBalanceResponse> => {
        if (!userId) {
            setError('User ID is required');
            return { success: false };
        }

        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid positive amount');
            return { success: false };
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:3000/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: userId,
                    amount: amount
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update balance');
            }

            const data = await response.json();
            return { success: true, newBalance: data.newBalance };
        } catch (err) {
            console.error('Error updating balance:', err);
            setError('Failed to update balance. Please try again later.');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    return { updateBalance, loading, error };
}; 
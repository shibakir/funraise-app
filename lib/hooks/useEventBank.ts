import { useState, useEffect, useCallback } from 'react';

interface EventBankInfo {
    bankAmount: number;
    status: string;
}

export const useEventBank = (eventId: string | null) => {
    const [bankAmount, setBankAmount] = useState(0);
    const [eventStatus, setEventStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBankInfo = useCallback(async () => {
        if (!eventId) {
            setBankAmount(0);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:3000/events/${eventId}/bank`);

            if (!response.ok) {
                throw new Error('Failed to load bank info');
            }

            const data = await response.json();
            setBankAmount(data.bankAmount);
            setEventStatus(data.status);

            console.log('data', data);
        } catch (err) {
            console.error('Error fetching bank info:', err);
            setError('Failed to load bank info. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        fetchBankInfo();
    }, [fetchBankInfo]);

    const refresh = useCallback(() => {
        fetchBankInfo();
    }, [fetchBankInfo]);

    return { bankAmount, eventStatus, loading, error, refresh };
}; 
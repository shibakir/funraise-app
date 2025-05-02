import { useState, useCallback, useEffect } from 'react';
import { getApiUrl } from '../config/api';

interface EventStatusInfo {
    bankAmount: number;
    status: string;
}

export const useEventStatus = (eventId: string | null) => {
    const [bankAmount, setBankAmount] = useState(0);
    const [eventStatus, setEventStatus] = useState('');
    const [type, setType] = useState<string | null>(null);
    const [recipientId, setRecipientId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStatusInfo = useCallback(async () => {
        if (!eventId) {
            setBankAmount(0);
            setEventStatus('active');
            setType(null);
            setRecipientId(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(getApiUrl('EVENT_STATUS', eventId));

            if (!response.ok) {
                throw new Error('Failed to load bank info');
            }

            const data = await response.json();

            setBankAmount(data.bankAmount);
            setEventStatus(data.status);
            setType(data.type);
            setRecipientId(data.recipientId);

        } catch (err) {
            console.error('Error fetching bank info:', err);
            setError('Failed to load bank info. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        fetchStatusInfo();
    }, [fetchStatusInfo]);

    const refresh = useCallback(() => {
        fetchStatusInfo();
    }, [fetchStatusInfo]);

    return { bankAmount, eventStatus, type, recipientId, loading, error, refresh };
}; 
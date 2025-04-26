import { useState, useEffect, useCallback } from 'react';

export interface Condition {
    id: string;
    endConditionId: number;
    parameterName: string;
    operator: string;
    value: string;
    isCompleted: boolean;
}

export interface ConditionGroup {
    id: number;
    conditions: Condition[];
    progress: number;
}

export interface EventDetails {
    id: string;
    userId: string,
    recipientId: string,
    name: string;
    description: string;
    imageUrl?: string;
    bankAmount: number;
    conditionGroups: ConditionGroup[];
    status: 'active' | 'completed';
}

export const useEventDetails = (eventId: string | null) => {
    const [event, setEvent] = useState<EventDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEventDetails = useCallback(async () => {
        if (!eventId) {
        setEvent(null);
        return;
        }

    setLoading(true);
    setError(null);

    try {
        const response = await fetch(`http://localhost:3000/events/${eventId}`);

        if (!response.ok) {
            throw new Error('Failed to load event details');
        }

        const data = await response.json();

        // Преобразуем данные из API в нужный формат
        const formattedEvent: EventDetails = {
            id: data.id,
            userId: data.userId,
            recipientId: data.recipientId || null,
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
            bankAmount: data.bankAmount || 0,
            status: data.status || 'completed',
            conditionGroups: data.endConditions?.map((group: any, index: number) => ({
            id: group.id,
            conditions: group.conditions || [],
            progress: data.conditionsProgress?.[index] || 0
            })) || []
        };

        //console.log(formattedEvent);

        setEvent(formattedEvent);
    } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details. Please try again later.');
    } finally {
        setLoading(false);
    }
  }, [eventId]);

    useEffect(() => {
        fetchEventDetails();
    }, [fetchEventDetails]);

    const refresh = useCallback(() => {
        fetchEventDetails();
    }, [fetchEventDetails]);

    return { event, loading, error, refresh };
}; 
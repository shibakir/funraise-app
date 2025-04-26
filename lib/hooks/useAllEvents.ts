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
    conditionsProgress: number[];
}

export const useAllEvents = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchEvents = async (userId: string = '', limit: number = 5) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:3000/events?page=${page}&limit=${limit}${userId === '' ? `&userId=${userId}` : ''}`, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch events');
            }

            const data = await response.json();
            
            if (data.length < limit) {
                setHasMore(false);
            }
            
            if (page === 1) {
                setEvents(data);
            } else {
                setEvents((prevEvents) => [...prevEvents, ...data]);
            }
            
            setPage(prevPage => prevPage + 1);
        } catch (error) {
            console.error('Error fetching events:', error);
            setError('Failed to fetch events. Server is not responding. Check your internet connection.');
            Alert.alert('Error', 'Failed to fetch events. Server is not responding. Check your internet connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetEvents = () => {
        setEvents([]);
        setPage(1);
        setHasMore(true);
        setError(null);
    };

    return {
        events,
        isLoading,
        error,
        hasMore,
        fetchEvents,
        resetEvents,
    };
}; 
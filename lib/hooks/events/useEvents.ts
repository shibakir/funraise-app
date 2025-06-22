import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { 
  GET_EVENT, 
  GET_EVENTS,
} from '@/lib/graphql';
import {
  EventResponse, 
  EventsResponse,
  GetEventArgs,
  EventStatus,
  User
} from '@/lib/graphql';

// Get all events
export const useEvents = () => {
    const { data, loading, error, refetch } = useQuery<EventsResponse>(GET_EVENTS, {
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-and-network',
    });

    return {
        events: data?.events || [],
        loading,
        error: error?.message || null,
        refetch,
    };
};

// Get event by ID
export const useEvent = (id: number) => {
    const { data, loading, error, refetch } = useQuery<EventResponse, GetEventArgs>(
        GET_EVENT,
        {
            variables: { id },
            errorPolicy: 'all',
            notifyOnNetworkStatusChange: true,
            skip: !id,
            fetchPolicy: 'cache-and-network',
        }
    );

    return {
        event: data?.event,
        loading,
        error: error?.message || null,
        refetch,
    };
};

// Interface for event page data
export interface EventPageData {
    // Main event data
    event: any;
    loading: boolean;
    error: any;
    refetch: () => void;
    
    // Transformed data for compatibility with components
    eventStatus: EventStatus;
    bankAmount: number;
    type: string;
    recipientId: string | null;
    userId: string;
    
    // Full user objects
    creator: User | null;
    recipient: User | null;
    
    // Utility functions
    isActive: boolean;
    isCompleted: boolean;
    isFinished: boolean;
    hasRecipient: boolean;
}

// Hook for event page - provides an optimized interface
export const useEventPage = (eventId: number): EventPageData => {
    const { event, loading, error, refetch } = useEvent(eventId);
    
    const result = useMemo(() => {
        // Use the original status from the enum EventStatus
        const eventStatus: EventStatus = event?.status || EventStatus.IN_PROGRESS;
        
        // Check if the event is active (status IN_PROGRESS)
        const isEventActive = eventStatus === EventStatus.IN_PROGRESS;
        const isEventFinished = eventStatus !== EventStatus.IN_PROGRESS;

        return {
            event,
            loading,
            error: error || null,
            refetch,
            
            // Transformed data
            eventStatus,
            bankAmount: event?.bankAmount || 0,
            type: event?.type || '',
            recipientId: event?.recipientId?.toString() || null,
            userId: event?.userId?.toString() || '',
            
            // Full user objects from GraphQL
            creator: event?.creator || null,
            recipient: event?.recipient || null,
            
            // Utility properties
            isActive: isEventActive,
            isCompleted: eventStatus === EventStatus.FINISHED,
            isFinished: isEventFinished,
            hasRecipient: !!event?.recipientId,
        };
    }, [event, loading, error, refetch]);
    
    return result;
}; 
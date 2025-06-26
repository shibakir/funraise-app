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

/**
 * Custom hook for fetching all events in the system.
 * Provides a comprehensive list of events with caching and error handling.
 * 
 * @returns {Object} Events data and state
 * @returns {Event[]} events - Array of all events
 * @returns {boolean} loading - Loading state indicator
 * @returns {string|null} error - Error message or null
 * @returns {Function} refetch - Function to manually refetch data
 * 
 */
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

/**
 * Custom hook for fetching a specific event by ID.
 * Provides detailed event information with related data.
 * 
 * @param {number} id - Event ID to fetch
 * @returns {Object} Event data and state
 * @returns {Event|undefined} event - Event data or undefined if not found
 * @returns {boolean} loading - Loading state indicator
 * @returns {string|null} error - Error message or null
 * @returns {Function} refetch - Function to manually refetch data
 * 
 */
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

/**
 * Enhanced interface for event page data with computed properties.
 * Provides optimized data structure for event detail pages.
 */
export interface EventPageData {
    /** Main event data from GraphQL */
    event: any;
    /** Loading state indicator */
    loading: boolean;
    /** Error state */
    error: any;
    /** Function to refetch event data */
    refetch: () => void;
    
    /** Event status as enum value */
    eventStatus: EventStatus;
    /** Total amount in event bank */
    bankAmount: number;
    /** Event type string */
    type: string;
    /** Recipient user ID as string (null if no recipient) */
    recipientId: string | null;
    /** Creator user ID as string */
    userId: string;
    
    /** Full creator user object */
    creator: User | null;
    /** Full recipient user object */
    recipient: User | null;
    
    /** Whether event is currently active (IN_PROGRESS status) */
    isActive: boolean;
    /** Whether event is completed successfully */
    isCompleted: boolean;
    /** Whether event is finished (any non-IN_PROGRESS status) */
    isFinished: boolean;
    /** Whether event has a designated recipient */
    hasRecipient: boolean;
}

/**
 * Custom hook providing optimized event data for event detail pages.
 * Transforms raw GraphQL data into a convenient format with computed properties.
 * 
 * This hook enhances the basic event data with:
 * - Status-based boolean flags for easy conditional rendering
 * - String-based IDs for form compatibility
 * - Direct access to user objects
 * - Memoized computations for performance
 * 
 * @param {number} eventId - ID of the event to fetch and optimize
 * @returns {EventPageData} Optimized event data with computed properties
 * 
 */
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
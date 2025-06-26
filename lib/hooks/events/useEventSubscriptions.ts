import { useSubscription } from '@apollo/client';

import {
    EVENT_UPDATED_SUBSCRIPTION,
    PARTICIPATION_CREATED_SUBSCRIPTION,
    PARTICIPATION_UPDATED_SUBSCRIPTION,
    EVENT_CONDITIONS_UPDATED_SUBSCRIPTION
} from '@/lib/graphql';

/**
 * Configuration props for event subscriptions hook.
 * Defines event ID and callback functions for different subscription types.
 */
interface UseEventSubscriptionsProps {
    /** ID of the event to subscribe to */
    eventId: number;
    /** Callback function triggered when event data is updated */
    onEventUpdated?: (event: any) => void;
    /** Callback function triggered when a new participation is created */
    onParticipationCreated?: (participation: any) => void;
    /** Callback function triggered when a participation is updated */
    onParticipationUpdated?: (participation: any) => void;
    /** Callback function triggered when event conditions are updated */
    onConditionsUpdated?: (conditions: any[]) => void;
}

/**
 * Custom hook for subscribing to real-time event updates.
 * Manages multiple WebSocket subscriptions for comprehensive event monitoring.
 * 
 * This hook provides real-time updates for:
 * - Event status changes (progress, completion, failure)
 * - New user participations in the event
 * - Updates to existing participations (deposit changes)
 * - Event end condition evaluations and completions
 * 
 * @param {UseEventSubscriptionsProps} props - Configuration object
 * @param {number} props.eventId - ID of the event to monitor
 * @param {Function} [props.onEventUpdated] - Callback for event updates
 * @param {Function} [props.onParticipationCreated] - Callback for new participations
 * @param {Function} [props.onParticipationUpdated] - Callback for participation updates
 * @param {Function} [props.onConditionsUpdated] - Callback for condition updates
 * 
 * @returns {Object} Subscription data and state
 * @returns {any} eventData - Latest event update data
 * @returns {any} participationCreatedData - Latest participation creation data
 * @returns {any} participationUpdatedData - Latest participation update data
 * @returns {any} conditionsData - Latest conditions update data
 * @returns {boolean} loading - Combined loading state of all subscriptions
 * @returns {Object} errors - Error messages for each subscription type
 *
 */
export const useEventSubscriptions = ({
    eventId,
    onEventUpdated,
    onParticipationCreated,
    onParticipationUpdated,
    onConditionsUpdated
}: UseEventSubscriptionsProps) => {
    
    // Subscription for event updates
    const { data: eventData, loading: eventLoading, error: eventError } = useSubscription(
        EVENT_UPDATED_SUBSCRIPTION,
        {
            variables: { eventId },
            onData: ({ data }) => {
                if (data.data?.eventUpdated && onEventUpdated) {
                    onEventUpdated(data.data.eventUpdated);
                }
            }
        }
    );

    // Subscription for participation creation
    const { data: participationCreatedData, loading: participationCreatedLoading, error: participationCreatedError } = useSubscription(
        PARTICIPATION_CREATED_SUBSCRIPTION,
        {
            variables: { eventId },
            onData: ({ data }) => {
                if (data.data?.participationCreated && onParticipationCreated) {
                    onParticipationCreated(data.data.participationCreated);
                }
            }
        }
    );

    // Subscription for participation updates
    const { data: participationUpdatedData, loading: participationUpdatedLoading, error: participationUpdatedError } = useSubscription(
        PARTICIPATION_UPDATED_SUBSCRIPTION,
        {
            variables: { eventId },
            onData: ({ data }) => {
                if (data.data?.participationUpdated && onParticipationUpdated) {
                    onParticipationUpdated(data.data.participationUpdated);
                }
            }
        }
    );

    // Subscription for event conditions updates
    const { data: conditionsData, loading: conditionsLoading, error: conditionsError } = useSubscription(
        EVENT_CONDITIONS_UPDATED_SUBSCRIPTION,
        {
            variables: { eventId },
            onData: ({ data }) => {
                if (data.data?.eventConditionsUpdated && onConditionsUpdated) {
                    onConditionsUpdated(data.data.eventConditionsUpdated);
                }
            }
        }
    );

    return {
        // Data
        eventData: eventData?.eventUpdated,
        participationCreatedData: participationCreatedData?.participationCreated,
        participationUpdatedData: participationUpdatedData?.participationUpdated,
        conditionsData: conditionsData?.eventConditionsUpdated,
        
        // Loading states
        loading: eventLoading || participationCreatedLoading || participationUpdatedLoading || conditionsLoading,
        
        // Errors
        errors: {
            eventError: eventError?.message || null,
            participationCreatedError: participationCreatedError?.message || null,
            participationUpdatedError: participationUpdatedError?.message || null,
            conditionsError: conditionsError?.message || null
        }
    };
}; 
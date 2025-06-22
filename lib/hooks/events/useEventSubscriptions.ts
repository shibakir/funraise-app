import { useSubscription } from '@apollo/client';

import {
    EVENT_UPDATED_SUBSCRIPTION,
    PARTICIPATION_CREATED_SUBSCRIPTION,
    PARTICIPATION_UPDATED_SUBSCRIPTION,
    EVENT_CONDITIONS_UPDATED_SUBSCRIPTION
} from '@/lib/graphql';

interface UseEventSubscriptionsProps {
    eventId: number;
    onEventUpdated?: (event: any) => void;
    onParticipationCreated?: (participation: any) => void;
    onParticipationUpdated?: (participation: any) => void;
    onConditionsUpdated?: (conditions: any[]) => void;
}

/**
 * Hook for subscribing to all event updates in real time
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
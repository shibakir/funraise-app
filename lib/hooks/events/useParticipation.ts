import { useMutation, useQuery } from '@apollo/client';
import { UPSERT_PARTICIPATION, GET_USER_PARTICIPATION, GET_USER_BALANCE } from '@/lib/graphql';
import { UpsertParticipationInput, ParticipationResult, Participation } from '@/lib/graphql';
import { Alert } from 'react-native';

/**
 * Input parameters for creating or updating event participation.
 * Contains user ID, event ID, and deposit amount as strings for form compatibility.
 */
interface UpsertParticipationParams {
    /** ID of the user participating in the event */
    userId: string;
    /** ID of the event to participate in */
    eventId: string;
    /** Amount to deposit for participation */
    deposit: number;
}

/**
 * Response structure for participation upsert operations.
 * Indicates success status and returns operation result data.
 */
interface UpsertParticipationResponse {
    /** Whether the operation was successful */
    success: boolean;
    /** Detailed result data (only present if success is true) */
    result?: ParticipationResult;
}

/**
 * Custom hook for managing user participation in events.
 * Provides functionality to fetch, create, and update event participations
 * with comprehensive validation and error handling.
 * 
 * @param {string|null} userId - ID of the user (null if not authenticated)
 * @param {string|null} eventId - ID of the event (null if not specified)
 * 
 * @returns {Object} Participation data and operations
 * @returns {Participation|null} participation - Current user participation or null
 * @returns {boolean} loading - Combined loading state for queries and mutations
 * @returns {string|null} error - Current error message or null
 * @returns {Function} refetch - Function to refetch participation data
 * @returns {Function} upsertParticipation - Function to create/update participation
 * 
 */
export const useParticipation = (userId: string | null, eventId: string | null) => {
    // Get user participation
    const { 
        data, 
        loading: fetchLoading, 
        error: fetchError, 
        refetch 
    } = useQuery(GET_USER_PARTICIPATION, {
        variables: { 
            userId: userId ? parseInt(userId) : 0, 
            eventId: eventId ? parseInt(eventId) : 0 
        },
        skip: !userId || !eventId,
        errorPolicy: 'all'
    });

    // Mutation for creating/updating participation
    const [upsertParticipation, { loading: mutationLoading, error: mutationError }] = useMutation(UPSERT_PARTICIPATION, {
        errorPolicy: 'all',
        refetchQueries: [
            GET_USER_BALANCE,
            GET_USER_PARTICIPATION
        ]
    });

    /**
     * Creates a new participation or updates an existing one.
     * Handles validation, GraphQL mutation, and user feedback.
     * 
     * @param {UpsertParticipationParams} params - Participation parameters
     * @param {string} params.userId - User ID as string
     * @param {string} params.eventId - Event ID as string  
     * @param {number} params.deposit - Deposit amount
     * @returns {Promise<UpsertParticipationResponse>} Operation result
     */
    const handleUpsertParticipation = async (params: UpsertParticipationParams): Promise<UpsertParticipationResponse> => {
        const { userId, eventId, deposit } = params;
        
        if (!userId) {
            Alert.alert('Error', 'User is required');
            return { success: false };
        }

        if (!eventId) {
            Alert.alert('Error', 'Event is required');
            return { success: false };
        }

        if (isNaN(deposit) || deposit <= 0) {
            Alert.alert('Error', 'Please enter a valid positive deposit amount');
            return { success: false };
        }

        try {
            const input: UpsertParticipationInput = {
                userId: parseInt(userId),
                eventId: parseInt(eventId),
                deposit
            };

            const result = await upsertParticipation({
                variables: { input }
            });

            if (result.data?.upsertParticipation) {
                const data = result.data.upsertParticipation;
                
                // Show alert only when creating a new participation
                if (data.isNewParticipation) {
                    Alert.alert('Success', 'You have successfully joined this event');
                }
                
                return { 
                    success: true, 
                    result: data 
                };
            } else {
                throw new Error('Failed to upsert participation');
            }
        } catch (err: any) {
            console.error('Error upserting participation:', err);
            const errorMessage = err.message || 'Failed to process participation. Please try again later.';
            Alert.alert('Error', errorMessage);
            return { success: false };
        }
    };

    return {
        // Participation data
        participation: data?.userParticipation || null,
        
        // Loading states
        loading: fetchLoading || mutationLoading,
        
        // Errors
        error: fetchError?.message || mutationError?.message || null,
        
        // Methods
        refetch,
        upsertParticipation: handleUpsertParticipation,
    };
}; 
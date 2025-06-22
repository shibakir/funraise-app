import { useMutation, useQuery } from '@apollo/client';
import { UPSERT_PARTICIPATION, GET_USER_PARTICIPATION, GET_USER_BALANCE } from '@/lib/graphql';
import { UpsertParticipationInput, ParticipationResult, Participation } from '@/lib/graphql';
import { Alert } from 'react-native';

interface UpsertParticipationParams {
    userId: string;
    eventId: string;
    deposit: number;
}

interface UpsertParticipationResponse {
    success: boolean;
    result?: ParticipationResult;
}

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
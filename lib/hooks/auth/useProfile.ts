import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_USER } from '@/lib/graphql';
import { useAuth } from '@/lib/context/AuthContext';

interface UpdateProfileInput {
    username?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
}

interface UpdateProfileResponse {
    updateUser: {
        id: number;
        username: string;
        email: string;
        balance: number;
        image?: string;
    };
}

export const useProfile = () => {
    const { updateUserData } = useAuth();
    const [updateUserMutation, { loading: graphqlLoading, error: graphqlError }] = useMutation<UpdateProfileResponse>(UPDATE_USER);
    const [error, setError] = useState<string | null>(null);

    const updateProfile = async (userId: number, data: UpdateProfileInput) => {
        try {
            setError(null);
            
            const result = await updateUserMutation({
                variables: {
                    id: userId,
                    input: data
                }
            });
            
            if (result.data?.updateUser) {
                // Update user data in AuthContext
                updateUserData({
                    username: result.data.updateUser.username,
                    email: result.data.updateUser.email,
                    balance: result.data.updateUser.balance,
                    image: result.data.updateUser.image
                });
                return result.data.updateUser;
            }
            
            throw new Error('No data returned from update');
        } catch (err: any) {
            let message = 'Error updating profile';
            
            // Handle GraphQL errors with detailed messages from server
            if (err.graphQLErrors && err.graphQLErrors.length > 0) {
                message = err.graphQLErrors[0].message;
            } else if (err.networkError) {
                message = 'Network error. Please check your connection.';
            } else if (err.message) {
                message = err.message;
            }
            
            setError(message);
            throw new Error(message);
        }
    };

    return {
        updateProfile,
        loading: graphqlLoading,
        error: error || (graphqlError ? graphqlError.message : null)
    };
}; 
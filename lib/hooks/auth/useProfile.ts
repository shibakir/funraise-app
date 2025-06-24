import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_USER } from '@/lib/graphql';
import { useAuth } from '@/lib/context/AuthContext';

/**
 * Input data structure for updating user profile information.
 * Contains optional fields that can be modified in the user profile.
 */
interface UpdateProfileInput {
    /** New username to set */
    username?: string;
    /** New email address to set */
    email?: string;
    /** Current password for verification when changing sensitive data */
    currentPassword?: string;
    /** New password to set (requires currentPassword) */
    newPassword?: string;
}

/**
 * GraphQL response structure for user profile update mutations.
 * Contains the updated user data returned from the server.
 */
interface UpdateProfileResponse {
    /** Updated user data from the mutation */
    updateUser: {
        /** User's unique identifier */
        id: number;
        /** Updated username */
        username: string;
        /** Updated email address */
        email: string;
        /** User's current balance */
        balance: number;
        /** User's profile image URL */
        image?: string;
    };
}

/**
 * Custom hook for managing user profile updates.
 * Provides functionality to update user profile information including
 * username, email, password, and handles authentication context updates.
 * 
 * @returns {Object} Profile update functionality and state
 * @returns {Function} updateProfile - Function to update user profile
 * @returns {boolean} loading - Loading state indicator
 * @returns {string|null} error - Current error message or null
 * 
 */
export const useProfile = () => {
    const { updateUserData } = useAuth();
    const [updateUserMutation, { loading: graphqlLoading, error: graphqlError }] = useMutation<UpdateProfileResponse>(UPDATE_USER);
    const [error, setError] = useState<string | null>(null);

    /**
     * Updates user profile information on the server and in local state.
     * Handles validation, error processing, and automatic context updates.
     * 
     * @param {number} userId - ID of the user to update
     * @param {UpdateProfileInput} data - Profile data to update
     * @returns {Promise<Object>} Updated user data from the server
     * @throws {Error} When update fails due to validation, network, or server errors
     */
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
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
            
            // In mock mode, just update the AuthContext
            const updatedData: any = {};
            if (data.username) updatedData.username = data.username;
            if (data.email) updatedData.email = data.email;
            
            updateUserData(updatedData);
            
            console.log('Profile updated successfully (mock mode):', updatedData);
            
            // When the backend is ready, use this:
            /*
            const result = await updateUserMutation({
                variables: {
                    id: userId,
                    input: data
                }
            });
            
            if (result.data?.updateUser) {
                updateUserData({
                    username: result.data.updateUser.username,
                    email: result.data.updateUser.email
                });
                return result.data.updateUser;
            }
            */
            
            return { id: userId, ...updatedData };
        } catch (err: any) {
            const message = err.message || 'Error updating profile';
            setError(message);
            throw new Error(message);
        }
    };

    return {
        updateProfile,
        loading: graphqlLoading,
        error: error || graphqlError || null
    };
}; 
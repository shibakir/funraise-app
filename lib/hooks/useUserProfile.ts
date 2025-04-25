import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';

export interface UserProfile {
    user: {
        id: number;
        username: string;
        image: string | null;
        createdAt: string;
    };
    balance: number;
}

export function useUserProfile(userId: string | null) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!userId) {
            setProfile(null);
            return;
        }

        setLoading(true);
        setError(null);

    try {
        const response = await fetch(`http://localhost:3000/users/${userId}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch user profile');
        }

        const data = await response.json();
        setProfile(data);
    } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err.message || 'Failed to load user profile');
        Alert.alert('Error', 'Failed to load user profile. Please try again later.');
    } finally {
        setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return {
        profile,
        loading,
        error,
        refreshProfile: fetchProfile
    };
} 
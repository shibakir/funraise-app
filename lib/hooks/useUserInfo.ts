import { useState, useCallback, useEffect } from 'react';
import { getApiUrl } from '../config/api';

export interface UserInfo {
    id: string;
    username: string;
    image: string | null;
    createdAt: string;
}

export const useUserInfo = (userId: string | null) => {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUserInfo = useCallback(async () => {
        if (!userId) {
            setUser(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(getApiUrl('USER_PROFILE', userId));

            if (!response.ok) {
                throw new Error('Failed to load user balance');
            }

            const data = await response.json();
            if (data.user) {
                setUser(data.user);
            } else {
                throw new Error('Error fetching user info');
            }
            
        } catch (err) {
            console.error('Error fetching user info:', err);
            setError('Failed to load user info. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    const refresh = useCallback(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    return { user, loading, error, refresh };
}; 
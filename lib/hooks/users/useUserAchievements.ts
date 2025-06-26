import { useQuery } from '@apollo/client';
import { GET_USER_ACHIEVEMENTS } from '@/lib/graphql';
import { UserAchievementsResponse, GetUserAchievementsArgs, UserAchievement } from '@/lib/graphql/types';

/**
 * Return type for the user achievements hook.
 * Provides achievements data with loading and error states.
 */
interface UseUserAchievementsReturn {
    /** Array of user achievement records with progress */
    achievements: UserAchievement[];
    /** Loading state indicator */
    loading: boolean;
    /** Error message or null if no error */
    error: string | null;
    /** Function to manually refetch achievements data */
    refetch: () => void;
}

/**
 * Custom hook for fetching and managing user achievements.
 * Retrieves achievement progress, completion status, and unlocking information
 * for a specific user.
 * 
 * @param {string|null} userId - ID of the user to fetch achievements for (null if not authenticated)
 * 
 * @returns {UseUserAchievementsReturn} Achievements data and state
 * @returns {UserAchievement[]} achievements - Array of achievement records with progress
 * @returns {boolean} loading - Loading state indicator
 * @returns {string|null} error - Error message or null
 * @returns {Function} refetch - Function to manually refetch data
 * 
 */
export const useUserAchievements = (userId: string | null): UseUserAchievementsReturn => {
    const { 
        data, 
        loading, 
        error, 
        refetch 
    } = useQuery<UserAchievementsResponse, GetUserAchievementsArgs>(GET_USER_ACHIEVEMENTS, {
        variables: { userId: userId ? parseInt(userId) : 0 },
        skip: !userId,
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
    });

    return {
        achievements: data?.userAchievements || [],
        loading,
        error: error?.message || null,
        refetch
    };
}; 
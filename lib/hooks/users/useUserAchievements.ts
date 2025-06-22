import { useQuery } from '@apollo/client';
import { GET_USER_ACHIEVEMENTS } from '@/lib/graphql';
import { UserAchievementsResponse, GetUserAchievementsArgs, UserAchievement } from '@/lib/graphql/types';

interface UseUserAchievementsReturn {
    achievements: UserAchievement[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

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
import { useState, useEffect, useCallback } from 'react';

export interface AchievementCriterion {
    id: number;
    achievementId: number;
    criteriaType: string;
    criteriaValue: number;
    description: string;
}

export interface CriterionProgress {
    id: number;
    userAchievementId: number;
    criterionId: number;
    currentValue: number;
    isCompleted: boolean;
    completedAt: string | null;
    criterion: AchievementCriterion;
}

export interface Achievement {
    id: number;
    name: string;
    description: string;
    iconUrl: string | null;
}

export interface UserAchievement {
    id: number;
    userId: number;
    achievementId: number;
    status: string;
    unlockedAt: string | null;
    achievement: Achievement;
    progress: CriterionProgress[];
}

export function useUserAchievements(userId: string) {
    const [achievements, setAchievements] = useState<UserAchievement[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAchievements = useCallback(async () => {
        if (!userId){
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`http://localhost:3000/users/${userId}/achievements`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch achievements: ${response.status}`);
        }
            
            const data = await response.json();
            setAchievements(data);
        } catch (err: any) {
            console.error('Error fetching user achievements:', err);
            setError(err.message || 'Failed to load achievements');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchAchievements();
    }, [fetchAchievements]);

    return {
        achievements,
        loading,
        error,
        refresh: fetchAchievements
    };
} 
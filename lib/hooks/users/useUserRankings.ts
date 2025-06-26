import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { 
    GET_USERS_BY_BALANCE, 
    GET_USERS_BY_EVENT_INCOME, 
    GET_USERS_BY_EVENT_OUTCOME,
    UserRanking 
} from '@/lib/graphql';

/**
 * Custom hook for managing user rankings data and state.
 * 
 * Provides a clean interface for fetching and managing different types
 * of user rankings (balance, event income, event outcome) with proper
 * loading states and error handling.
 * 
 * @param {number} limit - Maximum number of users to fetch for rankings
 * @returns Object containing ranking data, loading states, and control functions
 */

export type RankingType = 'balance' | 'income' | 'outcome';
export type TimePeriod = 'now' | 'lastWeek' | 'lastYear';

interface UseUserRankingsReturn {
    /** Currently selected ranking type */
    selectedRanking: RankingType;
    /** Function to change the selected ranking type */
    setSelectedRanking: (type: RankingType) => void;
    /** Currently selected time period */
    selectedTimePeriod: TimePeriod;
    /** Function to change the selected time period */
    setSelectedTimePeriod: (period: TimePeriod) => void;
    /** Current ranking data based on selected type */
    data: UserRanking[];
    /** Loading state for current ranking type */
    loading: boolean;
    /** Error state for current ranking type */
    error: any;
    /** Function to refetch current ranking data */
    refetch: () => void;
}

/**
 * Calculate the afterDate based on selected time period
 * Returns date for "not older than" filtering
 */
const getAfterDate = (period: TimePeriod): string | undefined => {
    const now = new Date();
    
    switch (period) {
        case 'now':
            // All transactions (no date filter)
            return undefined;
        case 'lastWeek':
            // Transactions not older than 1 week
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            weekAgo.setHours(0, 0, 0, 0);
            return weekAgo.toISOString();
        case 'lastYear':
            // Transactions not older than 1 year
            const yearAgo = new Date(now);
            yearAgo.setFullYear(now.getFullYear() - 1);
            yearAgo.setHours(0, 0, 0, 0);
            return yearAgo.toISOString();
        default:
            return undefined;
    }
};

export const useUserRankings = (limit: number = 50): UseUserRankingsReturn => {
    const [selectedRanking, setSelectedRanking] = useState<RankingType>('balance');
    const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('now');
    
    const afterDate = getAfterDate(selectedTimePeriod);

    // Single active query based on selected ranking
    const {
        data: currentData,
        loading: currentLoading,
        error: currentError,
        refetch: currentRefetch
    } = useQuery(
        selectedRanking === 'balance' ? GET_USERS_BY_BALANCE : 
        selectedRanking === 'income' ? GET_USERS_BY_EVENT_INCOME : 
        GET_USERS_BY_EVENT_OUTCOME,
        {
            variables: selectedRanking === 'balance' ? { limit } : { afterDate, limit },
            errorPolicy: 'all',
            fetchPolicy: 'network-only',
            notifyOnNetworkStatusChange: true
        }
    );

    // Extract data based on selected ranking type
    const extractCurrentData = (): UserRanking[] => {
        if (!currentData) return [];
        
        switch (selectedRanking) {
            case 'balance':
                return currentData.usersByBalance || [];
            case 'income':
                return currentData.usersByEventIncome || [];
            case 'outcome':
                return currentData.usersByEventOutcome || [];
            default:
                return [];
        }
    };

    const data = extractCurrentData();
    const loading = currentLoading;
    const error = currentError;
    const refetch = currentRefetch;

    return {
        selectedRanking,
        setSelectedRanking,
        selectedTimePeriod,
        setSelectedTimePeriod,
        data,
        loading,
        error,
        refetch
    };
}; 
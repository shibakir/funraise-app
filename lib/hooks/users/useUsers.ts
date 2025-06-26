import { useQuery, useLazyQuery } from '@apollo/client';
import { 
  GET_USER,
  SEARCH_USERS 
} from '@/lib/graphql';
import {
  UserResponse,
  SearchUsersResponse,
  GetUserArgs,
  SearchUsersArgs,
  User
} from '@/lib/graphql';

/**
 * Custom hook for fetching a specific user by ID.
 * Provides detailed user information with automatic query management.
 * 
 * @param {number|string|null} id - User ID to fetch (accepts various formats)
 * 
 * @returns {Object} User data and state
 * @returns {User|null} user - User data or null if not found
 * @returns {boolean} loading - Loading state indicator
 * @returns {string|null} error - Error message or null
 * @returns {Function} refetch - Function to manually refetch user data
 * 
 */
export const useUser = (id: number | string | null) => {
    const userId = typeof id === 'string' ? parseInt(id) : id;
    
    const { data, loading, error, refetch } = useQuery<UserResponse, GetUserArgs>(
        GET_USER,
        {
            variables: { id: userId || 0 },
            errorPolicy: 'all',
            notifyOnNetworkStatusChange: true,
            skip: !userId,
            fetchPolicy: 'cache-and-network',
        }
    );

    return {
        user: data?.user || null,
        loading,
        error: error?.message || null,
        refetch,
    };
};

/**
 * Custom hook for lazy user search functionality.
 * Provides on-demand user searching with manual trigger control.
 * 
 * This hook uses lazy querying, meaning the search is not executed
 * automatically. The search must be manually triggered using the
 * returned search function.
 * 
 */
export const useUserSearch = () => {
    const [searchUsers, { data, loading, error }] = useLazyQuery<SearchUsersResponse, SearchUsersArgs>(
        SEARCH_USERS,
        {
            errorPolicy: 'all',
        }
    );

    /**
     * Executes user search if the username meets minimum requirements.
     * Validates input length before triggering the GraphQL query.
     * 
     * @param {string} username - Username to search for
     */
    const search = (username: string) => {
        if (username && username.length >= 2) {
            searchUsers({ variables: { username } });
        }
    };

    return {
        search,
        users: data?.searchUsers || [],
        loading,
        error: error?.message || null,
    };
};

/**
 * Custom hook for fetching comprehensive user profile information.
 * Provides enhanced user data with computed statistics and formatted output.
 * 
 * This hook extends the basic user fetching with additional computed
 * properties and maintains compatibility with REST API patterns used
 * elsewhere in the application.
 * 
 * @param {number|string|null} id - User ID to fetch profile for
 * 
 * @returns {Object} Enhanced profile data and state
 * @returns {Object|null} profile - Formatted profile data (REST API compatible)
 * @returns {boolean} loading - Loading state indicator
 * @returns {string|null} error - Error message or null
 * @returns {Function} refreshProfile - Function to refresh profile data
 * @returns {User|null} fullUser - Complete GraphQL user object
 * @returns {number} totalCreatedEvents - Count of events created by user
 * @returns {number} totalReceivedEvents - Count of events received by user
 * @returns {number} totalEvents - Total count of user's event participations
 * 
 */
export const useUserProfile = (id: number | string | null) => {
    const userId = typeof id === 'string' ? parseInt(id) : id;
    
    const { data, loading, error, refetch } = useQuery<UserResponse, GetUserArgs>(
        GET_USER,
        {
            variables: { id: userId || 0 },
            errorPolicy: 'all',
            notifyOnNetworkStatusChange: true,
            skip: !userId,
            fetchPolicy: 'cache-and-network',
        }
    );

    const user = data?.user;

    // Return data in the same format as the REST API version
    const profile = user ? {
        user: {
            id: user.id,
            username: user.username,
            image: user.image || null,
            createdAt: user.createdAt || ''
        },
        balance: user.balance
    } : null;

    return {
        profile,
        loading,
        error: error?.message || null,
        refreshProfile: refetch,
        // Additional data for the extended profile
        fullUser: user,
        totalCreatedEvents: user?.createdEvents?.length || 0,
        totalReceivedEvents: user?.receivedEvents?.length || 0,
        totalEvents: (user?.events?.length || 0),
    };
}; 
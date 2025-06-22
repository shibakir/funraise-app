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

// Get user by ID
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

// Lazy user search
export const useUserSearch = () => {
    const [searchUsers, { data, loading, error }] = useLazyQuery<SearchUsersResponse, SearchUsersArgs>(
        SEARCH_USERS,
        {
            errorPolicy: 'all',
        }
    );

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

// Get user profile with full information
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
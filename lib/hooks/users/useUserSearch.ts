import { useState, useCallback, useEffect, useRef } from 'react';
import { useUserSearch as useGraphQLUserSearch } from './useUsers';
import { debounce } from '@/lib/utilities/debounce';

interface SearchUser {
    id: string;
    name: string;
    imageUrl?: string;
}

export const useUserSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<SearchUser[]>([]);
    const [showUserList, setShowUserList] = useState(false);
    const lastQueryRef = useRef('');
    
    const { search, users: graphQLUsers, loading: isSearching } = useGraphQLUserSearch();

    const debouncedSearch = useCallback(
        debounce((query: string) => {
            if (query.trim().length >= 2) {
                lastQueryRef.current = query.trim();
                search(query.trim());
            }
        }, 300),
        []
    );

    useEffect(() => {
        if (graphQLUsers && graphQLUsers.length > 0) {
            const mappedUsers = graphQLUsers.map(user => ({
                id: user.id.toString(),
                name: user.username,
                imageUrl: user.image || undefined
            }));
            setUsers(mappedUsers);
            setShowUserList(true);
        } else if (lastQueryRef.current.length >= 2 && !isSearching && graphQLUsers) {
            // Show empty list if search is completed but users are not found
            setUsers([]);
            setShowUserList(true);
        }
    }, [graphQLUsers, isSearching]);

    const searchUsers = useCallback((query: string) => {
        setSearchQuery(query);
        if (query.trim().length === 0) {
            setUsers([]);
            setShowUserList(false);
            lastQueryRef.current = '';
            return;
        }
        debouncedSearch(query);
    }, [debouncedSearch]);

    const resetSearch = useCallback(() => {
        setSearchQuery('');
        setUsers([]);
        setShowUserList(false);
        lastQueryRef.current = '';
    }, []);

    return {
        users,
        isSearching,
        showUserList,
        searchQuery,
        setSearchQuery,
        searchUsers,
        resetSearch
    };
}; 
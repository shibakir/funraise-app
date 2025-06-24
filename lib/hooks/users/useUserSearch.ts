import { useState, useCallback, useEffect, useRef } from 'react';
import { useUserSearch as useGraphQLUserSearch } from './useUsers';
import { debounce } from '@/lib/utilities/debounce';

/**
 * Simplified user data structure for search results.
 * Contains essential user information for search display and selection.
 */
interface SearchUser {
    /** User's unique identifier as string */
    id: string;
    /** User's display name */
    name: string;
    /** Optional profile image URL */
    imageUrl?: string;
}

/**
 * Custom hook for enhanced user search functionality with debouncing and UI state management.
 * Provides a complete user search experience with automatic debouncing, loading states,
 * and optimized result handling.
 * 
 * @returns {Object} Search state and control functions
 * @returns {SearchUser[]} users - Array of search result users
 * @returns {boolean} isSearching - Loading state for search operations
 * @returns {boolean} showUserList - Whether to display the search results list
 * @returns {string} searchQuery - Current search query string
 * @returns {Function} setSearchQuery - Function to update search query
 * @returns {Function} searchUsers - Function to perform search with debouncing
 * @returns {Function} resetSearch - Function to clear search state
 * 
 */
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

    /**
     * Performs user search with automatic debouncing and validation.
     * Updates search query state and triggers search if criteria are met.
     * 
     * @param {string} query - Search query string
     */
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

    /**
     * Resets all search state to initial values.
     * Clears search query, results, and UI state.
     */
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
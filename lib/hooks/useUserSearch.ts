import { useState } from 'react';
import { Alert } from 'react-native';

interface User {
    id: string;
    name: string;
    imageUrl?: string;
}

export const useUserSearch = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showUserList, setShowUserList] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const searchUsers = async (query: string) => {
        if (!query) {
            setUsers([]);
            setShowUserList(false);
            return;
        }

        setIsSearching(true);
        setShowUserList(true);

        try {
            const response = await fetch(`http://localhost:3000/users?search=${query}`, {
                //headers: {
                //          'Authorization': `Bearer ${localStorage.getItem('token')}`,
                //      },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data.map((user: any) => ({
                id: user.id.toString(),
                name: user.username,
                imageUrl: user.image || null
            })));
        } catch (error) {
            console.error('Error searching users:', error);
            Alert.alert('Error', 'Failed to search users. Server is not responding. Check your internet connection.');
            setUsers([]);
        } finally {
            setIsSearching(false);
        }
    };

    const resetSearch = () => {
        setUsers([]);
        setShowUserList(false);
        setSearchQuery('');
    };

    return {
        users,
        isSearching,
        showUserList,
        searchQuery,
        setSearchQuery,
        searchUsers,
        resetSearch,
    };
}; 
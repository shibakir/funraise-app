import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { getApiUrl } from '@/lib/config/api';
import { debounce } from '@/lib/utilities/debounce';

interface User {
  id: string;
  username: string;
  image: string | null;
}

export const useUserSearch = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showUserList, setShowUserList] = useState(false);

  const performSearch = async (query: string) => {
    if (query.length < 2) {
      setUsers([]);
      setShowUserList(false);
      return;
    }

    setIsSearching(true);
    try {
      const searchUrl = `${getApiUrl('USERS')}?search=${encodeURIComponent(query)}`;
      //console.log('Searching users with URL:', searchUrl);
      
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      //console.log('Received users:', data);
      
      setUsers(data.map((user: any) => ({
        id: user.id.toString(),
        username: user.username,
        image: user.image
      })));
      setShowUserList(true);
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to search users'
      );
    } finally {
      setIsSearching(false);
    }
  };

  // debounce с задержкой 300мс
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      performSearch(query);
    }, 300),
    []
  );

  const searchUsers = (query: string) => {
    debouncedSearch(query);
  };

  const resetSearch = () => {
    setUsers([]);
    setShowUserList(false);
  };

  return {
    users,
    isSearching,
    showUserList,
    searchUsers,
    resetSearch,
  };
}; 
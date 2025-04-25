import { useState, useCallback, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import debounce from 'lodash.debounce';

interface Event {
    id: string;
    name: string;
    description: string;
    type: string;
    status?: 'active' | 'inactive';
    imageUrl?: string;
    createdAt: string;
    conditionsProgress: number[];
    avgProgress: number;
}

export interface SearchFilters {
    types: string[];
    minProgress: number;
    maxProgress: number;
    sortBy: 'name' | 'createdAt' | 'progress';
    sortOrder: 'asc' | 'desc';
}

export const useEventSearch = (initialFilters?: Partial<SearchFilters>) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState<SearchFilters>({
        types: [],
        minProgress: 0,
        maxProgress: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ...initialFilters
    });

    // debouce func to reduce api load
    const debouncedSearch = useRef(
        debounce(async (query: string) => {
            // Если поисковый запрос пуст, просто очищаем список событий
            if (!query.trim()) {
                setEvents([]);
                setHasMore(false);
                return;
            }
            
            const page = 1;
            const limit = 10;
            
            setEvents([]);
            setCurrentPage(1);
            setHasMore(true);
            
            setIsLoading(true);
            setError(null);

            try {
                const queryParams = new URLSearchParams({
                    query: query,
                    page: page.toString(),
                    limit: limit.toString(),
                    minProgress: filters.minProgress.toString(),
                    maxProgress: filters.maxProgress.toString(),
                    sortBy: filters.sortBy,
                    sortOrder: filters.sortOrder
                });

                filters.types.forEach(type => {
                    queryParams.append('types', type);
                });
                
                const response = await fetch(`http://localhost:3000/events?${queryParams.toString()}`, {
                    method: 'GET',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to search events');
                }

                const data = await response.json();
                
                if (data.length < limit) {
                    setHasMore(false);
                }
                
                setEvents(data);
                setCurrentPage(2); // next page
            } catch (error) {
                console.error('Error searching events:', error);
                setError('Failed to search events. Server is not responding.');
                Alert.alert('Error', 'Failed to search events. Server is not responding. Check your internet connection.');
            } finally {
                setIsLoading(false);
            }
        }, 300)
    ).current;

    // debouce func to reduce api load
    const debouncedSearchWithFilters = useRef(
        debounce(async (searchText: string, searchFilters: SearchFilters) => {
            // clean if empty
            if (!searchText.trim()) {
                setEvents([]);
                setHasMore(false);
                return;
            }
            
            const page = 1;
            const limit = 10;
            
            setEvents([]);
            setCurrentPage(1);
            setHasMore(true);
            
            setIsLoading(true);
            setError(null);

            try {
                const queryParams = new URLSearchParams({
                    query: searchText,
                    page: page.toString(),
                    limit: limit.toString(),
                    minProgress: searchFilters.minProgress.toString(),
                    maxProgress: searchFilters.maxProgress.toString(),
                    sortBy: searchFilters.sortBy,
                    sortOrder: searchFilters.sortOrder
                });
                
                // Добавляем типы, если они выбраны
                searchFilters.types.forEach(type => {
                    queryParams.append('types', type);
                });
                
                const response = await fetch(`http://localhost:3000/events?${queryParams.toString()}`, {
                    method: 'GET',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to search events');
                }

                const data = await response.json();
                
                if (data.length < limit) {
                    setHasMore(false);
                }
                
                setEvents(data);
                setCurrentPage(2); // next page
            } catch (error) {
                console.error('Error searching events:', error);
                setError('Failed to search events. Server is not responding.');
                Alert.alert('Error', 'Failed to search events. Server is not responding. Check your internet connection.');
            } finally {
                setIsLoading(false);
            }
        }, 300)
    ).current;

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
            debouncedSearchWithFilters.cancel();
        };
    }, []);
    
    const updateSearchQuery = (query: string) => {
        setSearchQuery(query);
        debouncedSearch(query);
    };
    
    const updateFilters = (newFilters: Partial<SearchFilters>) => {
        const updatedFilters = {
            ...filters,
            ...newFilters
        };
        
        setFilters(updatedFilters);
        
        if (searchQuery.trim()) {
            debouncedSearchWithFilters(searchQuery, updatedFilters);
        }
    };
    
    // Загружаем следующую страницу
    const loadMore = useCallback(() => {
        if (!isLoading && hasMore && searchQuery.trim()) {
            (async () => {
                setIsLoading(true);
                setError(null);

                try {
                    const queryParams = new URLSearchParams({
                        query: searchQuery,
                        page: currentPage.toString(),
                        limit: '10',
                        minProgress: filters.minProgress.toString(),
                        maxProgress: filters.maxProgress.toString(),
                        sortBy: filters.sortBy,
                        sortOrder: filters.sortOrder
                    });
                    
                    filters.types.forEach(type => {
                        queryParams.append('types', type);
                    });
                    
                    const response = await fetch(`http://localhost:3000/events?${queryParams.toString()}`, {
                        method: 'GET',
                        headers: {
                        'Content-Type': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to search events');
                    }

                    const data = await response.json();
                    
                    if (data.length < 10) {
                        setHasMore(false);
                    }
                    
                    setEvents(prevEvents => [...prevEvents, ...data]);
                    setCurrentPage(prevPage => prevPage + 1);
                } catch (error) {
                    console.error('Error searching events:', error);
                    setError('Failed to search events. Server is not responding.');
                    Alert.alert('Error', 'Failed to search events. Server is not responding. Check your internet connection.');
                } finally {
                    setIsLoading(false);
                }
            })();
        }
    }, [isLoading, hasMore, searchQuery, currentPage, filters]);

    const resetSearch = useCallback(() => {
        debouncedSearch.cancel();
        debouncedSearchWithFilters.cancel();
        
        setSearchQuery('');
        setEvents([]);
        setCurrentPage(1);
        setHasMore(true);
        setFilters({
            types: [],
            minProgress: 0,
            maxProgress: 100,
            sortBy: 'createdAt',
            sortOrder: 'desc',
            ...initialFilters
        });
    }, [initialFilters]);

    return {
        events,
        isLoading,
        error,
        hasMore,
        searchQuery,
        filters,
        setSearchQuery: updateSearchQuery,
        updateFilters,
        loadMore,
        resetSearch,
    };
};
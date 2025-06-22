import React, { useState, useMemo } from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, TextInput, View, TouchableOpacity, ActivityIndicator } from 'react-native';

import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/lib/hooks/ui';
import { SearchFilterPanel, SearchFilters } from '@/components/search/SearchFilterPanel';
import { useEvents } from '@/lib/hooks/events';
import { EventStatus } from '@/lib/graphql';
import { moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { EventCard } from '@/components/custom/EventCard';
import type { Event } from '@/lib/graphql/types';
import { useTranslation } from 'react-i18next';
import { RefreshableScrollView } from '@/components/custom/RefreshableScrollView';

interface EventWithProgress extends Event {
    progress: number;
}

export default function SearchScreen() {

    const { t } = useTranslation();

    const borderColor = useThemeColor({}, 'divider');
    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const headerBackground = useThemeColor({}, 'headerBackground');
    const headerText = useThemeColor({}, 'headerText');

    const primaryColor = useThemeColor({}, 'primary');
    const placeholderColor = useThemeColor({}, 'placeholder');
    const textColor = useThemeColor({}, 'text');
    const errorColor = useThemeColor({}, 'error');
    
    const { events: allEvents, loading: isLoading, error: graphqlError, refetch } = useEvents();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<SearchFilters>({
        types: [],
        statuses: [],
        minProgress: 0,
        maxProgress: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [displayLimit, setDisplayLimit] = useState(10);

    const error = graphqlError || null;

    const filteredAndSortedEvents = useMemo((): Event[] => {
        let filtered = allEvents;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(event =>
                event.name.toLowerCase().includes(query) ||
                (event.description && event.description.toLowerCase().includes(query))
            );
        }

        if (filters.types.length > 0) {
            filtered = filtered.filter(event => filters.types.includes(event.type));
        }

        if (filters.statuses.length > 0) {
            filtered = filtered.filter(event => filters.statuses.includes(event.status));
        }

        const eventsWithProgress: EventWithProgress[] = filtered.map(event => {
            let progress = 0;
            if (event.endConditions && event.endConditions.length > 0) {
                const completedConditions = event.endConditions.filter(group => group.isCompleted).length;
                progress = (completedConditions / event.endConditions.length) * 100;
            } else {
                progress = event.status === EventStatus.FINISHED ? 100 : 
                          event.status === EventStatus.IN_PROGRESS ? 50 : 0;
            }
            return { ...event, progress };
        });

        const progressFiltered = eventsWithProgress.filter(event => 
            event.progress >= filters.minProgress && event.progress <= filters.maxProgress
        );

        progressFiltered.sort((a, b) => {
            let comparison = 0;
            
            switch (filters.sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'createdAt':
                    comparison = a.id - b.id;
                    break;
                case 'progress':
                    comparison = a.progress - b.progress;
                    break;
            }
            
            return filters.sortOrder === 'desc' ? -comparison : comparison;
        });

        return progressFiltered;
    }, [allEvents, searchQuery, filters]);

    const events = filteredAndSortedEvents.slice(0, displayLimit);
    const hasMore = filteredAndSortedEvents.length > displayLimit;

    const updateFilters = (newFilters: Partial<SearchFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setDisplayLimit(10);
    };

    const loadMore = () => {
        if (hasMore && !isLoading) {
            setDisplayLimit(prev => prev + 10);
        }
    };

    const resetSearch = () => {
        setSearchQuery('');
        setFilters({
            types: [],
            statuses: [],
            minProgress: 0,
            maxProgress: 100,
            sortBy: 'createdAt',
            sortOrder: 'desc'
        });
        setDisplayLimit(10);
    };
  
    const LoadMoreButton = () => {
        if (!hasMore || events.length === 0) {
            return null;
        }
        
        return (
            <TouchableOpacity 
                style={styles.loadMoreButton}
                onPress={loadMore}
                activeOpacity={0.7}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={primaryColor} />
                ) : (
                    <ThemedText style={styles.loadMoreText}>{t('search.showMore', 'Show More')}</ThemedText>
                )}
            </TouchableOpacity>
        );
    };

    const styles = StyleSheet.create({
        mainSection: {
            backgroundColor: sectionBackground,
            borderRadius: moderateScale(14),
            marginHorizontal: moderateScale(16),
            marginTop: verticalScale(16),
            marginBottom: verticalScale(80),
            overflow: 'hidden',
        },
        container: {
            flex: 1,
        },
        scrollContainer: {
            flexGrow: 1,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: moderateScale(20),
        },
        searchContainer: {
            margin: moderateScale(16),
            marginBottom: moderateScale(8),
        },
        searchBar: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: moderateScale(10),
            paddingHorizontal: moderateScale(12),
            paddingVertical: moderateScale(8),
            marginBottom: moderateScale(8),
        },
        input: {
            flex: 1,
            marginLeft: moderateScale(8),
            fontSize: moderateScale(16),
            height: verticalScale(36),
        },
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        emptyText: {
            opacity: 0.6,
            fontSize: moderateScale(16),
        },
        loadMoreButton: {
            padding: moderateScale(16),
            alignItems: 'center',
            justifyContent: 'center',
            borderTopWidth: 1,
            borderTopColor: borderColor,
        },
        loadMoreText: {
            fontSize: moderateScale(16),
            fontWeight: '500',
            color: primaryColor,
        },
        filterButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: moderateScale(10),
            paddingVertical: moderateScale(10),
            marginTop: moderateScale(4),
        },
        filterButtonText: {
            marginLeft: moderateScale(8),
            fontSize: moderateScale(16),
        },
    }); 

    const renderSearchBar = () => (
        <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: sectionBackground }]}>
                <IconSymbol name="magnifyingglass" size={20} color={placeholderColor} />
                <TextInput
                    style={[styles.input, { color: textColor }]}
                    placeholder={t('search.searchPlaceholder')}
                    placeholderTextColor={placeholderColor}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={resetSearch}>
                        <IconSymbol name="xmark.circle.fill" size={20} color={placeholderColor} />
                    </TouchableOpacity>
                )}
            </View>
            <TouchableOpacity 
                style={[styles.filterButton, { backgroundColor: sectionBackground }]}
                onPress={() => setShowFilterPanel(true)}
            >
                <IconSymbol name="line.3.horizontal.decrease" size={20} color={placeholderColor} />
                <ThemedText style={styles.filterButtonText}>{t('search.searchFilterButton')}</ThemedText>
            </TouchableOpacity>
        </View>
    );
    
    const renderEmptyContent = () => {
        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={primaryColor} />
                    <ThemedText style={{ marginTop: 10 }}>{t('search.loading', 'Searching events...')}</ThemedText>
                </View>
            );
        }
        
        return (
            <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                    {searchQuery.length > 0
                        ? t('search.searchPanel.noResults')
                        : t('search.searchPanel.emptySearch')}
                </ThemedText>
            </View>
        );
    };
    
    const renderErrorContent = () => {
        if (error && events.length === 0) {
            return (
                <ThemedView style={styles.container}>
                    <ThemedText style={{ color: errorColor, padding: moderateScale(16) }}>
                        {t('search.error', 'Error')}: {error}
                    </ThemedText>
                    <TouchableOpacity 
                        style={[styles.filterButton, { backgroundColor: primaryColor, marginHorizontal: moderateScale(16) }]}
                        onPress={() => refetch()}
                    >
                        <ThemedText style={[styles.filterButtonText, { color: 'white' }]}>
                            {t('search.retry', 'Retry')}
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            );
        }
        return null;
    };
    
    const renderEventsList = () => {
        if (events.length === 0) {
            return renderEmptyContent();
        }

        return (
            <ThemedView style={styles.mainSection}>
                <View>
                    {events.map(event => <EventCard key={event.id} event={event} />)}
                    <LoadMoreButton />
                </View>
            </ThemedView>
        );
    };

    return (
        <>
            <Stack.Screen 
                    options={{ 
                        title: t('search.title'),
                        headerShown: true,
                        headerBackTitle: t('search.backTitle'),
                        headerStyle: { backgroundColor: headerBackground },
                        headerTitleStyle: { color: headerText },
                    }}
                />
            
            <ThemedView style={styles.container}>
                {renderSearchBar()}
                <RefreshableScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {renderErrorContent() || renderEventsList()}
                </RefreshableScrollView>
                
                <SearchFilterPanel
                    filters={filters} 
                    onApplyFilters={updateFilters}
                    isVisible={showFilterPanel}
                    onClose={() => setShowFilterPanel(false)}
                />
            </ThemedView>
        </>
    );
} 
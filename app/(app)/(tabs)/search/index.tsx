import React, { useState, useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StyleSheet, TextInput, View, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { SearchFilterPanel } from '@/components/SearchFilterPanel';
import { useEventSearch } from '@/lib/hooks/useEventSearch';
import { moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { EventCard } from '@/components/EventCard';
import { useTranslation } from 'react-i18next';

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
    
    const {
        events,
        isLoading,
        error,
        hasMore,
        searchQuery,
        filters,
        setSearchQuery,
        updateFilters,
        loadMore,
        resetSearch
    } = useEventSearch();
    
    const [showFilterPanel, setShowFilterPanel] = useState(false);
  
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
                    <ThemedText style={styles.loadMoreText}>Show More</ThemedText>
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

    // search panel
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
    // no results
    const renderEmptyContent = () => {
        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={primaryColor} />
                    <ThemedText style={{ marginTop: 10 }}>Searching events...</ThemedText>
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
    // on error
    const renderErrorContent = () => {
        if (error && events.length === 0) {
            return (
                <ThemedView style={styles.container}>
                    <ThemedText style={{ color: errorColor }}>{error}</ThemedText>
                </ThemedView>
            );
        }
        return null;
    };
    // results
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
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {renderErrorContent() || renderEventsList()}
                </ScrollView>
                
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
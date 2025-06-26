import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useThemeColor } from '@/lib/hooks/ui';
import { useRefreshableData } from '@/lib/hooks/data';
import { useUserRankings, RankingType, TimePeriod } from '@/lib/hooks/users/useUserRankings';
import { UserRanking } from '@/lib/graphql';
import { useTranslation } from 'react-i18next';
import RankingButton from '@/components/ranks/RankingButton';
import { RefreshableScrollView } from '@/components/custom/RefreshableScrollView';

/**
 * Rankings page component that displays top users in various categories.
 * 
 */

interface UserRankingItemProps {
    item: UserRanking;
    index: number;
    textColor: string;
    borderColor: string;
}

const UserRankingItem: React.FC<UserRankingItemProps> = ({ 
    item, 
    index, 
    textColor, 
    borderColor 
}) => (
    <View style={[styles.rankingItem, { borderBottomColor: borderColor }]}>
        <Text style={[styles.rankingPosition, { color: textColor }]}>
            {index + 1}
        </Text>
        <Text style={[styles.username, { color: textColor }]}>
            {item.username}
        </Text>
        <Text style={[styles.amount, { color: textColor }]}>
            ${item.amount.toFixed(2) || '0.00'}
        </Text>
    </View>
);

export default function RanksScreen() {
    const { t } = useTranslation();
    
    // Use custom hook for rankings data
    const { 
        selectedRanking, 
        setSelectedRanking, 
        selectedTimePeriod, 
        setSelectedTimePeriod, 
        data, 
        loading, 
        error,
        refetch
    } = useUserRankings(10);
    
    // Theme colors
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const tintColor = useThemeColor({}, 'tint');
    const borderColor = useThemeColor({}, 'divider');
    
    const headerBackground = useThemeColor({}, 'headerBackground');
    const headerText = useThemeColor({}, 'headerText');

    // Register component in the refresh system for pull-to-refresh
    useRefreshableData({
        key: `user-rankings-${selectedRanking}-${selectedTimePeriod}`,
        onRefresh: async () => {
            await refetch();
        },
        dependencies: [selectedRanking, selectedTimePeriod, refetch]
    });

    const renderRankingItem = ({ item, index }: { item: UserRanking; index: number }) => (
        <UserRankingItem 
            item={item} 
            index={index} 
            textColor={textColor} 
            borderColor={borderColor}
        />
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: textColor }]}>
                {error ? t('ranks.errorLoading') : t('ranks.noData')}
            </Text>
        </View>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={tintColor} />
                    <Text style={[styles.loadingText, { color: textColor }]}>
                        {t('ranks.loading')}
                    </Text>
                </View>
            );
        }

        if (data.length === 0) {
            return renderEmptyState();
        }

        return (
            <View style={styles.listContent}>
                {data.map((item, index) => (
                    <UserRankingItem 
                        key={item.id.toString()}
                        item={item} 
                        index={index} 
                        textColor={textColor} 
                        borderColor={borderColor}
                    />
                ))}
            </View>
        );
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: t('ranks.title') || 'Ranks',
                    headerShown: true,
                    headerBackTitle: t('ranks.backTitle') || 'Back',
                    headerStyle: { backgroundColor: headerBackground },
                    headerTitleStyle: { color: headerText },
                }}
            />
            <View style={[styles.container, { backgroundColor }]}>
                <RefreshableScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollViewContent}
                >
                    {/* Ranking type selection buttons */}
                    <View style={styles.buttonContainer}>
                        <RankingButton
                            title={t('ranks.byBalance')}
                            isActive={selectedRanking === 'balance'}
                            onPress={() => {
                                setSelectedRanking('balance');
                                setSelectedTimePeriod('now'); // Reset time period for balance
                            }}
                        />
                        <RankingButton
                            title={t('ranks.byDonations')}
                            isActive={selectedRanking === 'outcome'}
                            onPress={() => setSelectedRanking('outcome')}
                        />
                        <RankingButton
                            title={t('ranks.byWinnings')}
                            isActive={selectedRanking === 'income'}
                            onPress={() => setSelectedRanking('income')}
                        />
                    </View>

                    {/* Time period selection buttons (only for income and outcome) */}
                    {(selectedRanking === 'income' || selectedRanking === 'outcome') && (
                        <View style={styles.timePeriodContainer}>
                            <RankingButton
                                title={t('ranks.timePeriod.now')}
                                isActive={selectedTimePeriod === 'now'}
                                onPress={() => setSelectedTimePeriod('now')}
                            />
                            <RankingButton
                                title={t('ranks.timePeriod.lastWeek')}
                                isActive={selectedTimePeriod === 'lastWeek'}
                                onPress={() => setSelectedTimePeriod('lastWeek')}
                            />
                            <RankingButton
                                title={t('ranks.timePeriod.lastYear')}
                                isActive={selectedTimePeriod === 'lastYear'}
                                onPress={() => setSelectedTimePeriod('lastYear')}
                            />
                        </View>
                    )}

                    {/* Rankings content */}
                    {renderContent()}
                </RefreshableScrollView>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        marginTop: 20,
        gap: 10,
    },
    timePeriodContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 10,
    },
    listContent: {
        paddingHorizontal: 20,
    },
    rankingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
    },
    rankingPosition: {
        fontSize: 18,
        fontWeight: 'bold',
        width: 40,
        textAlign: 'center',
    },
    username: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 15,
    },
    amount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});

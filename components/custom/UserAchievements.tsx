import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { useThemeColor } from '@/lib/hooks/ui';
import { horizontalScale, moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useUserAchievements } from '@/lib/hooks/users';
import { UserAchievement, UserCriterionProgress } from '@/lib/graphql/types';
import { useRefreshableData } from '@/lib/hooks/data';

// Function to get achievement key based on its name
const getAchievementKey = (name: string): string => {
    // Convert achievement name to key for translations
    return name.toUpperCase().replace(/\s+/g, '_');
};

// Function to get criteria key based on its type
const getCriteriaKey = (criteriaType: string): string => {
    switch (criteriaType) {
        case 'EVENT_BANK_COMPLETED':
        case 'EVENT_INCOME_ONETIME':
        case 'EVENT_INCOME_ALL':
            return 'EVENT_INCOME';
        case 'EVENT_PEOPLE_COMPLETED':
            return 'EVENT_PARTICIPANTS';
        case 'EVENT_TIME_COMPLETED':
            return 'EVENT_TIME';
        case 'EVENT_COUNT_ALL':
        case 'EVENT_COUNT_CREATED':
            return 'EVENT_COUNT_CREATED';
        case 'EVENT_COUNT_COMPLETED':
            return 'EVENT_COUNT_COMPLETED';
        case 'USER_ACTIVITY':
            return 'USER_ACTIVITY';
        case 'USER_BANK':
            return 'USER_BANK';
        default:
            return criteriaType;
    }
};

interface AchievementCardProps {
    achievement: UserAchievement;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
    const { t } = useTranslation();
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'divider');
    const cardColor = useThemeColor({}, 'card');

    // Calculate achievement progress (total criteria and completed criteria)
    const totalCriteria = achievement.progress.length;
    const completedCriteria = achievement.progress.filter(p => p.isCompleted).length;
    const progressPercentage = totalCriteria > 0 ? Math.round((completedCriteria / totalCriteria) * 100) : 0;
    
    // In GraphQL status is a string, check if it's completed (COMPLETED or all criteria are completed)
    const isCompleted = achievement.status === 'COMPLETED' || completedCriteria === totalCriteria;
    const statusColor = isCompleted ? primaryColor : borderColor;

    // Get localized achievement name and description (achievement.name is the key in the translations file)
    const achievementKey = getAchievementKey(achievement.achievement.name);
    const achievementName = t(`achievements.list.${achievementKey}.name`, { defaultValue: achievement.achievement.name });
    const achievementDescription = t(`achievements.list.${achievementKey}.description`, { 
        defaultValue: `Achievement: ${achievement.achievement.name}` 
    });

    return (
        <ThemedView style={[
            styles.achievementCard, 
            { backgroundColor: cardColor, borderColor: statusColor }
        ]}>
            <View style={styles.achievementHeader}>
                <View style={styles.achievementTitleContainer}>
                    <View style={[styles.achievementIcon, { backgroundColor: statusColor, justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="trophy-outline" size={24} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <ThemedText style={styles.achievementTitle}>{achievementName}</ThemedText>
                        <ThemedText style={styles.achievementDescription}>{achievementDescription}</ThemedText>
                    </View>
                </View>
            </View>
            { ! isCompleted && (
                <>
                    <View style={styles.progressBar}>
                        <View 
                            style={[
                                styles.progressFill, 
                                { width: `${progressPercentage}%`, backgroundColor: primaryColor }
                            ]} 
                        />
                    </View>
                
                    <View style={styles.criteriaList}>
                        {achievement.progress.map((progress) => (
                            <CriteriaItem 
                                key={progress.id} 
                                progress={progress} 
                                isCompleted={progress.isCompleted}
                            />
                        ))}
                    </View>
                </>
            )}
            {/*
            {isCompleted && achievement.unlockedAt && (
                <ThemedText style={styles.unlockedText}>
                    {t('achievements.unlockedOn')} {new Date(achievement.unlockedAt).toLocaleDateString()}
                </ThemedText>
            )}
            */}
        </ThemedView>
    );
};

interface CriteriaItemProps {
    progress: UserCriterionProgress;
    isCompleted: boolean;
}

const CriteriaItem: React.FC<CriteriaItemProps> = ({ progress, isCompleted }) => {
    const { t } = useTranslation();
    const primaryColor = useThemeColor({}, 'primary');
    const criterion = progress.criterion;
    
    // Get localized criteria name and description (criterion.criteriaType is the key in the translations file)
    const criteriaKey = getCriteriaKey(criterion.criteriaType);
    const criteriaName = t(`achievements.criteria.${criteriaKey}`, { 
        defaultValue: criterion.description || criterion.criteriaType 
    });
    
    return (
        <View style={styles.criteriaItem}>
            <View style={styles.criteriaTextContainer}>
                <Ionicons 
                    name={isCompleted ? "checkmark-circle" : "ellipse-outline"} 
                    size={moderateScale(18)} 
                    color={isCompleted ? primaryColor : undefined} 
                />
                <ThemedText style={[
                    styles.criteriaText,
                    isCompleted && { color: primaryColor }
                ]}>
                    {criteriaName}
                </ThemedText>
            </View>
            {!isCompleted && (
                <ThemedText style={styles.criteriaDetails}>
                    {t('achievements.progress')}: {progress.currentValue} / {criterion.criteriaValue}
                </ThemedText>
            )}
        </View>
    );
};

export interface UserAchievementsHandle {
    refresh: () => void;
}

interface UserAchievementsProps {
    userId: string;
}

export const UserAchievements = forwardRef<UserAchievementsHandle, UserAchievementsProps>(({ userId }, ref) => {
    const { t } = useTranslation();
    const { achievements, loading, error, refetch } = useUserAchievements(userId);
    
    const primaryColor = useThemeColor({}, 'primary');
    const errorColor = useThemeColor({}, 'error');
    
    // register component in the refresh system for pull-to-refresh
    useRefreshableData({
        key: `user-achievements-${userId}`,
        onRefresh: async () => {
            await refetch();
        },
        dependencies: [userId]
    });
    
    useImperativeHandle(ref, () => ({
        refresh: refetch
    }));

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={primaryColor} />
                <ThemedText style={{ marginTop: verticalScale(8) }}>
                    {t('achievements.loading')}
                </ThemedText>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <ThemedText style={{ color: errorColor }}>{error}</ThemedText>
            </View>
        );
    }
    
    if (achievements.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>{t('achievements.noAchievements')}</ThemedText>
            </View>
        );
    }

    // Sort by completion and progress (achievements with all criteria completed are first) 
    const sortedAchievements = [...achievements].sort((a, b) => {
        const aCompleted = a.status === 'COMPLETED';
        const bCompleted = b.status === 'COMPLETED';
        
        if (aCompleted && !bCompleted) {
            return -1;
        } 
        if (!aCompleted && bCompleted) {
            return 1;
        }

        const progressA = a.progress.filter(p => p.isCompleted).length / Math.max(a.progress.length, 1);
        const progressB = b.progress.filter(p => p.isCompleted).length / Math.max(b.progress.length, 1);
        
        return progressB - progressA;
    });

    return (
        <View>
            {sortedAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
        </View>
    );
});

const styles = StyleSheet.create({
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: moderateScale(20),
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: moderateScale(20),
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: moderateScale(40),
    },
    emptyText: {
        fontSize: moderateScale(16),
        opacity: 0.7,
    },
    achievementCard: {
        borderRadius: moderateScale(12),
        padding: moderateScale(16),
        marginBottom: verticalScale(16),
        borderWidth: 1,
    },
    achievementHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: verticalScale(12),
    },
    achievementTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    achievementIcon: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        marginRight: horizontalScale(12),
    },
    achievementTitle: {
        fontSize: moderateScale(16),
        fontWeight: '600',
    },
    achievementDescription: {
        fontSize: moderateScale(14),
        opacity: 0.7,
        //width: "85%",
        flexShrink: 1,
    },
    statusBadge: {
        paddingHorizontal: horizontalScale(8),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(12),
        alignSelf: 'flex-start',
    },
    statusText: {
        color: 'white',
        fontSize: moderateScale(12),
        fontWeight: '500',
    },
    progressBar: {
        height: verticalScale(8),
        backgroundColor: '#e0e0e0',
        borderRadius: moderateScale(4),
        overflow: 'hidden',
        marginBottom: verticalScale(16),
    },
    progressFill: {
        height: '100%',
    },
    criteriaList: {
        gap: verticalScale(12),
    },
    criteriaItem: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        gap: verticalScale(4),
    },
    
    criteriaTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(8),
    },
    
    criteriaText: {
        fontSize: moderateScale(14),
    },
    criteriaDetails: {
        fontSize: moderateScale(12),
        opacity: 0.7,
        marginTop: verticalScale(2),
    },
    unlockedText: {
        fontSize: moderateScale(12),
        opacity: 0.6,
        marginTop: verticalScale(12),
        textAlign: 'right',
        fontStyle: 'italic',
    },
    iconEmoji: {
        fontSize: moderateScale(24),
    },
});

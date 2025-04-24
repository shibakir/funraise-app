import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useUserAchievements, UserAchievement, CriterionProgress } from '@/lib/hooks/useUserAchievements';

const formatCriteriaType = (type: string): string => {
    switch (type) {
        case 'BIGGEST_BANK': return 'Bank Balance';
        case 'SIMULTANEOUS_PARTICIPATION': return 'Simultaneous Events';
        case 'PLATFORM_VETERAN': return 'Days on Platform';
        case 'DONATIONS_COUNT': return 'Donations Made';
        case 'DONATIONS_SUM': return 'Total Donated';
        case 'DAY_STREAK': return 'Daily Streak';
        default: return type;
    }
};

interface AchievementCardProps {
    achievement: UserAchievement;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'divider');
  const cardColor = useThemeColor({}, 'card');

  // compute progress of achivements
  const totalCriteria = achievement.progress.length;
  const completedCriteria = achievement.progress.filter(p => p.isCompleted).length;
  const progressPercentage = totalCriteria > 0 ? Math.round((completedCriteria / totalCriteria) * 100) : 0;
  
  const isCompleted = achievement.status === 'COMPLETED';
  const statusColor = isCompleted ? primaryColor : borderColor;

    return (
        <ThemedView style={[
            styles.achievementCard, 
            { backgroundColor: cardColor, borderColor: statusColor }
        ]}>
        <View style={styles.achievementHeader}>
            <View style={styles.achievementTitleContainer}>
                <View style={[styles.achievementIcon, { backgroundColor: statusColor, justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="trophy-outline" size={24}/>
                </View>
            <View>
                <ThemedText style={styles.achievementTitle}>{achievement.achievement.name}</ThemedText>
                <ThemedText style={styles.achievementDescription}>{achievement.achievement.description}</ThemedText>
            </View>
            </View>
        </View>
        
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
        
        {isCompleted && achievement.unlockedAt && (
            <ThemedText style={styles.unlockedText}>
            Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
            </ThemedText>
        )}
        </ThemedView>
    );
};

interface CriteriaItemProps {
    progress: CriterionProgress;
    isCompleted: boolean;
}

const CriteriaItem: React.FC<CriteriaItemProps> = ({ progress, isCompleted }) => {
    const primaryColor = useThemeColor({}, 'primary');
    const criterion = progress.criterion;
    
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
                    {criterion.description}
                </ThemedText>
            </View>
            {!isCompleted && (
                <ThemedText style={styles.criteriaDetails}>
                    {formatCriteriaType(criterion.criteriaType)}: {progress.currentValue} / {criterion.criteriaValue}
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
    const { achievements, loading, error, refresh } = useUserAchievements(userId);
    
    const primaryColor = useThemeColor({}, 'primary');
    const errorColor = useThemeColor({}, 'error');
    
    useImperativeHandle(ref, () => ({
        refresh
    }));

    if (loading) {
        return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
            <ThemedText style={{ marginTop: verticalScale(8) }}>
                Loading achievements...
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
            <ThemedText style={styles.emptyText}>No achievements found</ThemedText>
        </View>
        );
    }

    // sorty by completed and by progress
    const sortedAchievements = [...achievements].sort((a, b) => {
        if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return -1;
        if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return 1;
        
        const progressA = a.progress.filter(p => p.isCompleted).length / a.progress.length;
        const progressB = b.progress.filter(p => p.isCompleted).length / b.progress.length;
        
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
        width: "85%",
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
}); 
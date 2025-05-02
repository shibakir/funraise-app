import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useEventConditions } from '@/lib/hooks/useEventConditions';
import { Condition } from '@/lib/hooks/useEventDetails';
import { useTranslation } from 'react-i18next';

// Format parameter value (includes time)
const formatParameterValue = (name: string, value: string): string => {

    if (name.toLowerCase() === 'time') {

        // Check on special date format YYYYMMDDHHmmssSSS
        if (/^\d{17}$/.test(value)) {
            try {
                const year = parseInt(value.substring(0, 4));
                const month = parseInt(value.substring(4, 6)) - 1; // month in JS is 0-11
                const day = parseInt(value.substring(6, 8));
                const hour = parseInt(value.substring(8, 10));
                const minute = parseInt(value.substring(10, 12));
                //const second = parseInt(value.substring(12, 14));
                //const date = new Date(year, month, day, hour, minute, second);

                return `${day.toString().padStart(2, '0')}.${(month + 1).toString().padStart(2, '0')}.${year} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            } catch (e) {
                console.error('Error parsing date format:', e);
                return value;
            }
        } 
        // Check on normal date format
        else if (!isNaN(Date.parse(value))) {
            const date = new Date(value);
            const day = date.getDate();
            const month = date.getMonth() + 1; // month in JS from 0 to 11
            const year = date.getFullYear();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            return `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
    }
    return value;
};

interface ConditionGroupCardProps {
    group: {
        id: number;
        conditions: Condition[];
        progress: number;
    };
    index: number;
}

const ConditionGroupCard: React.FC<ConditionGroupCardProps> = ({ group, index }) => {
    
    const { t } = useTranslation();

    // Format operators to text view
    const formatOperator = (operator: string): string => {
        switch (operator) {
            case 'gte': 
                return t('event.operator.gte');
            case 'gt': 
                return t('event.operator.gt');
            case 'lt': 
                return t('event.operator.lt');
            case 'lte': 
                return t('event.operator.lte');
            default: 
                return operator;
        }
    };

    // Format parameter name
    const formatParameterName = (name: string): string => {
        switch (name.toLowerCase()) {
            case 'time': 
                return t('event.conditionType.time');
            case 'bank': 
                return t('event.conditionType.bank');
            case 'people': 
                return t('event.conditionType.people');
            default: 
                return name;
        }
    };

    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'divider');
    const cardColor = useThemeColor({}, 'card');

    return (
        <ThemedView style={[styles.conditionCard, { backgroundColor: cardColor, borderColor }]}>
            <View style={styles.conditionHeader}>
                <ThemedText style={styles.conditionTitle}>
                    {t('event.group')} {index + 1}
                </ThemedText>
                <ThemedText style={[styles.progressText, { color: primaryColor }]}>
                    {t('event.progress')}: {group.progress}%
                </ThemedText>
            </View>
            
            <View style={styles.progressBar}>
                <View 
                    style={[
                        styles.progressFill, 
                        { width: `${group.progress}%`, backgroundColor: primaryColor }
                    ]} 
                />
            </View>
            
            <View style={styles.conditionsList}>
                {group.conditions.map((condition) => (
                    <View key={condition.id} style={styles.conditionItem}>
                        <Ionicons 
                            name={condition.isCompleted ? "checkmark-circle" : "ellipse-outline"} 
                            size={moderateScale(18)} 
                            color={condition.isCompleted ? primaryColor : undefined} 
                        />
                        <ThemedText style={[
                                styles.conditionText,
                                condition.isCompleted && { color: primaryColor }
                            ]}
                        >
                        {formatParameterName(condition.parameterName)} {formatOperator(condition.operator)} {formatParameterValue(condition.parameterName, condition.value)}
                        </ThemedText>
                    </View>
                ))}
            </View>
        </ThemedView>
    );
};

export interface EventConditionsListHandle {
    refresh: () => void;
}

interface EventConditionsListProps {
    eventId: string;
}

export const EventConditionsList = forwardRef<EventConditionsListHandle, EventConditionsListProps>(({ eventId }, ref) => {
    const { t } = useTranslation();
    const { conditionGroups, loading, error, refresh } = useEventConditions(eventId);
    
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
                    {t('event.loading')}
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

    return (
        <View>
            <ThemedText style={styles.conditionsTitle}>{t('event.conditionsTitle')}</ThemedText>
            {conditionGroups.map((group, index) => (
                <ConditionGroupCard key={group.id} group={group} index={index} />
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
    conditionsTitle: {
        fontSize: moderateScale(18),
        fontWeight: '600',
        marginBottom: verticalScale(16),
    },
    conditionCard: {
        borderRadius: moderateScale(12),
        padding: moderateScale(16),
        marginBottom: verticalScale(16),
        borderWidth: 1,
    },
    conditionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    conditionTitle: {
        fontSize: moderateScale(16),
        fontWeight: '600',
    },
    progressText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
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
    conditionsList: {
        gap: verticalScale(8),
    },
    conditionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(8),
    },
    conditionText: {
        fontSize: moderateScale(14),
        flex: 1,
    },
});

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { useThemeColor } from '@/lib/hooks/ui';
import { horizontalScale, moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useTranslation } from 'react-i18next';
import { EventEndCondition, Operator, ConditionType } from '@/lib/graphql/types';

// Format parameter value (includes time)
const formatParameterValue = (name: ConditionType, value: string): string => {

    if (name === ConditionType.TIME) {

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

interface ProcessedCondition {
    id: string;
    parameterName: ConditionType;
    operator: Operator;
    value: string;
    isCompleted: boolean;
}

interface ConditionGroupCardProps {
    group: {
        id: number;
        conditions: ProcessedCondition[];
        progress: number;
    };
    index: number;
}

const ConditionGroupCard: React.FC<ConditionGroupCardProps> = ({ group, index }) => {
    
    const { t } = useTranslation();

    // Format operators to text view
    const formatOperator = (operator: Operator): string => {
        switch (operator) {
            case Operator.GREATER_EQUALS: 
                return t('event.operator.gte');
            case Operator.GREATER: 
                return t('event.operator.gt');
            case Operator.LESS: 
                return t('event.operator.lt');
            case Operator.LESS_EQUALS: 
                return t('event.operator.lte');
            case Operator.EQUALS:
                return t('event.operator.equals');
            default: 
                return operator;
        }
    };

    // Format parameter name
    const formatParameterName = (name: ConditionType): string => {
        switch (name) {
            case ConditionType.TIME: 
                return t('event.conditionType.time');
            case ConditionType.BANK: 
                return t('event.conditionType.bank');
            case ConditionType.PARTICIPATION: 
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
                        {formatParameterName(condition.parameterName as ConditionType)} {formatOperator(condition.operator as Operator)} {formatParameterValue(condition.parameterName as ConditionType, condition.value)}
                        </ThemedText>
                    </View>
                ))}
            </View>
        </ThemedView>
    );
};

interface EventConditionsListProps {
    endConditions: EventEndCondition[];
}

export const EventConditionsList: React.FC<EventConditionsListProps> = ({ endConditions }) => {
    const { t } = useTranslation();

    const processedConditionGroups = endConditions.map((endCondition) => {
        const totalConditions = endCondition.conditions?.length || 0;
        const completedConditions = endCondition.conditions?.filter(c => c.isCompleted).length || 0;
        const progress = totalConditions > 0 ? Math.round((completedConditions / totalConditions) * 100) : 0;
        
        return {
            id: endCondition.id,
            conditions: endCondition.conditions?.map(condition => ({
                id: condition.id.toString(),
                parameterName: condition.name as ConditionType,
                operator: condition.operator as Operator,
                value: condition.value,
                isCompleted: condition.isCompleted
            })) || [],
            progress
        };
    });

    return (
        <View>
            <ThemedText style={styles.conditionsTitle}>{t('event.conditionsTitle')}</ThemedText>
            {processedConditionGroups.map((group, index) => (
                <ConditionGroupCard key={group.id} group={group} index={index} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
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

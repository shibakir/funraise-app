import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useEventConditions } from '@/lib/hooks/useEventConditions';
import { Condition } from '@/lib/hooks/useEventDetails';

// Форматируем операторы в текстовый вид
const formatOperator = (operator: string): string => {
  switch (operator) {
    case 'gte': return 'greater or equal to';
    case 'gt': return 'greater than';
    case 'lt': return 'less than';
    case 'lte': return 'less or equal to';
    default: return operator;
  }
};

// Форматирует имя параметра
const formatParameterName = (name: string): string => {
  switch (name.toLowerCase()) {
    case 'time': return 'End time is';
    case 'bank': return 'Bank amount is';
    case 'people': return 'Number of participants is';
    default: return name;
  }
};

// Форматируем значение параметра (например для времени)
const formatParameterValue = (name: string, value: string): string => {
  if (name.toLowerCase() === 'time' && !isNaN(Date.parse(value))) {
    const date = new Date(value);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'divider');
  const cardColor = useThemeColor({}, 'card');

  return (
    <ThemedView style={[styles.conditionCard, { backgroundColor: cardColor, borderColor }]}>
      <View style={styles.conditionHeader}>
        <ThemedText style={styles.conditionTitle}>Group {index + 1}</ThemedText>
        <ThemedText style={[styles.progressText, { color: primaryColor }]}>
          Progress: {group.progress}%
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
            ]}>
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
          Loading conditions...
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
      <ThemedText style={styles.conditionsTitle}>Conditions</ThemedText>
      
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
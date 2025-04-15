import React, { useState, useRef } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { DateTimePickerModal } from './DateTimePickerModal';

// Типы условий
const conditionTypes = [
  { id: 'time', label: 'TIME', operator: 'TIME' },
  { id: 'bank', label: 'BANK', operator: 'BANK' },
  { id: 'people', label: 'PEOPLE', operator: 'PEOPLE' }
];

// Операторы сравнения
const operators = [
  { id: 'lt', label: 'less', symbol: '<' },
  { id: 'lte', label: 'less or equal', symbol: '<=' },
  { id: 'gt', label: 'greater', symbol: '>' },
  { id: 'gte', label: 'greater or equal', symbol: '>=' }
];

interface Condition {
  parameterName: string;
  operator: string;
  value: string;
  comparisonOp?: string;
}

interface GroupData {
  name: string;
  conditions: Condition[];
}

interface EventEndConditionsProps {
  groups: GroupData[];
  onGroupsChange: (groups: GroupData[]) => void;
}

export const EventEndConditions: React.FC<EventEndConditionsProps> = ({
    groups,
    onGroupsChange,
}) => {
    const textColor = useThemeColor({}, 'text');
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'divider');
    const placeholderColor = useThemeColor({}, 'placeholder');
    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const errorColor = useThemeColor({}, 'error');
    const accentColor = useThemeColor({}, 'primary');

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [activeCondition, setActiveCondition] = useState<{groupIndex: number, conditionIndex: number} | null>(null);

    // Добавление новой группы условий
    const addConditionGroup = () => {
        onGroupsChange([
        ...groups, 
        { 
            name: `Group ${groups.length + 1}`,
            conditions: []
        }
        ]);
    };

    // Обновление названия группы
    const updateGroupName = (groupIndex: number, newName: string) => {
        const newGroups = [...groups];
        newGroups[groupIndex].name = newName;
        onGroupsChange(newGroups);
    };

    // Удаление группы условий
    const removeConditionGroup = (groupIndex: number) => {
        if (groups.length <= 1) {
            Alert.alert('Attention', 'There must be at least one condition group');
            return;
        }
        
        const newGroups = [...groups];
        newGroups.splice(groupIndex, 1);
        onGroupsChange(newGroups);
    };

    // Добавление условия в группу
    const addConditionToGroup = (groupIndex: number, conditionType: string) => {
        const newGroups = [...groups];
        const typeInfo = conditionTypes.find(t => t.id === conditionType);
        
        if (!typeInfo) return;
        
        // Проверяем, что такого типа еще нет в группе
        const existingType = newGroups[groupIndex].conditions.find(
            c => c.parameterName === conditionType
        );
        
        if (existingType) {
            Alert.alert('Error', 'This condition type is already added to the group');
            return;
        }
        
        // Добавляем новое условие
        newGroups[groupIndex].conditions.push({
            parameterName: conditionType,
            operator: typeInfo.operator,
            value: conditionType === 'time' ? new Date().toISOString() : '0',
            comparisonOp: conditionType === 'time' ? undefined : 'gte'
        });
        onGroupsChange(newGroups);
    };

    // Проверка наличия условия в группе
    const hasConditionInGroup = (groupIndex: number, conditionType: string) => {
        return groups[groupIndex].conditions.some(
            condition => condition.parameterName === conditionType
        );
    };

    // Удаление условия из группы
    const removeCondition = (groupIndex: number, conditionIndex: number) => {
        const newGroups = [...groups];
        newGroups[groupIndex].conditions.splice(conditionIndex, 1);
        onGroupsChange(newGroups);
    };

    // Обновление значения условия
    const updateConditionValue = (groupIndex: number, conditionIndex: number, value: string) => {
        // check if the value is a number
        if (value === '' || /^\d+$/.test(value)) {
            const newGroups = [...groups];
            newGroups[groupIndex].conditions[conditionIndex].value = value;
            onGroupsChange(newGroups);
        }
    };

    // Обновление оператора сравнения
    const updateConditionOperator = (groupIndex: number, conditionIndex: number, operator: string) => {
        const newGroups = [...groups];
        newGroups[groupIndex].conditions[conditionIndex].comparisonOp = operator;
        onGroupsChange(newGroups);
    };

    const formatDateTime = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    };

    const styles = StyleSheet.create({
        section: {
            marginTop: moderateScale(8),
            marginBottom: moderateScale(8),
            flex: 1,
        },
        sectionTitle: {
            fontSize: moderateScale(18),
            fontWeight: '600',
            marginBottom: moderateScale(8),
        },
        groupContainer: {
            backgroundColor: sectionBackground,
            borderRadius: moderateScale(12),
            marginBottom: moderateScale(16),
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: borderColor,
        },
        groupHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: moderateScale(12),
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
            backgroundColor: `${primaryColor}20`,
        },
        groupNameInput: {
            flex: 1,
            color: textColor,
            fontSize: moderateScale(16),
            fontWeight: '600',
            padding: moderateScale(4),
            borderWidth: 0,
            borderRadius: moderateScale(4),
        },
        groupContent: {
            padding: moderateScale(12),
        },
        conditionTypeButton: {
            flex: 1,
            padding: moderateScale(10),
            alignItems: 'center',
            borderWidth: 1,
            marginHorizontal: moderateScale(4),
            borderRadius: moderateScale(8),
            backgroundColor: sectionBackground,
        },
        conditionTypeText: {
            fontSize: moderateScale(14),
            fontWeight: '500',
        },
        endConditionContainer: {
            backgroundColor: sectionBackground,
            padding: moderateScale(12),
            borderRadius: moderateScale(8),
            marginBottom: moderateScale(12),
            borderWidth: 1,
            borderColor: borderColor,
        },
        conditionRow: {
            flexDirection: 'row',
            marginBottom: moderateScale(8),
            width: '100%',
            justifyContent: 'space-between',
            gap: moderateScale(8),
        },
        conditionLabel: {
            fontSize: moderateScale(14),
            marginRight: moderateScale(8),
            flex: 1,
            width: '100%',
        },
        operatorLabel: {
            fontSize: moderateScale(14),
            marginRight: moderateScale(8),
            flex: 1,
            width: '100%',
        },
        conditionInput: {
            borderWidth: 1,
            borderColor: borderColor,
            borderRadius: moderateScale(6),
            padding: moderateScale(8),
            flex: 0.45,
            fontSize: moderateScale(14),
            color: textColor,
            backgroundColor: sectionBackground,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        dateInputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: sectionBackground,
            borderRadius: moderateScale(6),
            borderWidth: 1,
            borderColor: borderColor,
            padding: moderateScale(8),
        },
        dateInputText: {
            flex: 1,
            fontSize: moderateScale(14),
            color: textColor,
        },
        removeButton: {
            marginLeft: moderateScale(8),
        },
        addGroupButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: moderateScale(8),
            marginBottom: moderateScale(16),
            padding: moderateScale(8),
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: accentColor,
            borderRadius: moderateScale(8),
        },
        addGroupText: {
            color: accentColor,
            fontSize: moderateScale(14),
            marginLeft: moderateScale(4),
            fontWeight: '500',
        },
        operatorSelect: {
            flexDirection: 'row',
            borderWidth: 1,
            borderColor: borderColor,
            borderRadius: moderateScale(6),
            padding: moderateScale(8),
            justifyContent: 'center',
            flex: 0.45,
        },
        buttonsContainer: {
            flexDirection: 'row', 
            gap: moderateScale(8), 
            justifyContent: 'space-between',
            marginBottom: moderateScale(12),
        },
    });

  return (
    <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>End conditions</ThemedText>
        <ThemedText style={{ color: placeholderColor }}>
            Create one or more groups of conditions! The event will end as soon as one of the groups of conditions is met.
        </ThemedText>
        <ThemedText style={{ marginBottom: moderateScale(12), color: placeholderColor }}>
            You can set the amount of the bank, the number of participants or the end time
        </ThemedText>
        <ThemedText style={{ marginBottom: moderateScale(12), color: placeholderColor }}>
            Feel free to give each group its own name.
        </ThemedText>
      
        {groups.map((group, groupIndex) => (
            <View key={`group-${groupIndex}`} style={styles.groupContainer}>
                <View style={styles.groupHeader}>
                    <TextInput 
                        style={styles.groupNameInput}
                        value={group.name}
                        onChangeText={(text) => updateGroupName(groupIndex, text)}
                        placeholder="Group name"
                        placeholderTextColor={placeholderColor}
                    />
                    
                    <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => removeConditionGroup(groupIndex)}
                    >
                        <IconSymbol name="trash" size={20} color={errorColor} />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.groupContent}>
                    <ThemedText style={{ marginBottom: moderateScale(8), color: placeholderColor }}>
                        To complete, the conditions of one group must be met simultaneously
                    </ThemedText>
                    
                    {/* Кнопки добавления условий */}
                    <View style={styles.buttonsContainer}>
                        {conditionTypes.map(type => (
                            !hasConditionInGroup(groupIndex, type.id) && (
                            <TouchableOpacity
                                key={type.id}
                                style={[styles.conditionTypeButton, { flex: 1 }]}
                                onPress={() => addConditionToGroup(groupIndex, type.id)}
                            >
                                <ThemedText style={styles.conditionTypeText}>
                                {type.label}
                                </ThemedText>
                            </TouchableOpacity>
                            )
                        ))}
                    </View>
                    
                    {/* Список условий */}
                    {group.conditions.map((condition, conditionIndex) => (
                        <View key={`condition-${groupIndex}-${conditionIndex}`} style={styles.endConditionContainer}>
                            <View style={styles.conditionRow}>
                            <ThemedText style={styles.conditionLabel}>
                                {condition.parameterName === 'time' ? 'End date and time is:' : 
                                condition.parameterName === 'bank' ? 'Bank amount is:' : 'Number of participants is:'}
                            </ThemedText>
                            
                            <TouchableOpacity 
                                style={styles.removeButton}
                                onPress={() => removeCondition(groupIndex, conditionIndex)}
                            >
                                <IconSymbol name="xmark.circle.fill" size={22} color={errorColor} />
                            </TouchableOpacity>
                            </View>
                            
                            {condition.parameterName === 'time' ? (
                            <View>
                                <TouchableOpacity
                                    style={styles.dateInputContainer}
                                    onPress={() => {
                                        setActiveCondition({groupIndex, conditionIndex});
                                        setShowDatePicker(true);
                                    }}
                                >
                                    <ThemedText style={styles.dateInputText}>
                                        {formatDateTime(new Date(condition.value))}
                                    </ThemedText>
                                    <IconSymbol name="calendar" size={20} color={primaryColor} />
                                </TouchableOpacity>
                                <DateTimePickerModal
                                    visible={showDatePicker && activeCondition?.groupIndex === groupIndex && activeCondition?.conditionIndex === conditionIndex}
                                    onClose={() => setShowDatePicker(false)}
                                    value={new Date(condition.value)}
                                    onChange={(date) => {
                                        if (activeCondition) {
                                            const newGroups = [...groups];
                                            newGroups[activeCondition.groupIndex].conditions[activeCondition.conditionIndex].value = date.toISOString();
                                            onGroupsChange(newGroups);
                                        }
                                    }}
                                />
                            </View>
                            ) : (
                            <View style={styles.conditionRow}>
                                <TouchableOpacity 
                                    style={styles.operatorSelect}
                                    onPress={() => {
                                        const currentOp = condition.comparisonOp;
                                        const currentIndex = operators.findIndex(op => op.id === currentOp);
                                        const nextIndex = (currentIndex + 1) % operators.length;
                                        updateConditionOperator(groupIndex, conditionIndex, operators[nextIndex].id);
                                    }}
                                >
                                    <ThemedText>
                                        {operators.find(op => op.id === condition.comparisonOp)?.label}
                                    </ThemedText>
                                </TouchableOpacity>
                                
                                <TextInput
                                    style={styles.conditionInput}
                                    value={condition.value}
                                    onChangeText={(text) => updateConditionValue(groupIndex, conditionIndex, text)}
                                    placeholder={
                                        condition.parameterName === 'bank' ? 'Amount' : 'Number'
                                    }
                                    placeholderTextColor={placeholderColor}
                                    keyboardType="numeric"
                                    maxLength={9}
                                />
                            </View>
                            )}
                        </View>
                    ))}
                </View>
            </View>
        ))}

        <TouchableOpacity 
            style={styles.addGroupButton} 
            onPress={addConditionGroup}
        >
            <IconSymbol name="plus.circle.fill" size={20} color={accentColor} />
            <ThemedText style={styles.addGroupText}>Add an alternative condition group (OR)</ThemedText>
        </TouchableOpacity>
    </View>
  );
}; 
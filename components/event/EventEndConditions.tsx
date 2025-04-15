import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import DateTimePicker from '@react-native-community/datetimepicker';

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
    const [selectedDate, setSelectedDate] = useState(new Date());

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
        const newGroups = [...groups];
        newGroups[groupIndex].conditions[conditionIndex].value = value;
        onGroupsChange(newGroups);
    };

    // Обновление оператора сравнения
    const updateConditionOperator = (groupIndex: number, conditionIndex: number, operator: string) => {
        const newGroups = [...groups];
        newGroups[groupIndex].conditions[conditionIndex].comparisonOp = operator;
        onGroupsChange(newGroups);
    };

    // Обработка выбора даты
    const onDateChange = (event: any, date?: Date) => {
        setShowDatePicker(false);
        if (date) {
            setSelectedDate(date);
            // Находим условие с типом time и обновляем его значение
            const newGroups = [...groups];
            for (let groupIndex = 0; groupIndex < newGroups.length; groupIndex++) {
                const conditionIndex = newGroups[groupIndex].conditions.findIndex(
                    c => c.parameterName === 'time'
                );
                if (conditionIndex !== -1) {
                    newGroups[groupIndex].conditions[conditionIndex].value = date.toISOString();
                    break;
                }
            }
            onGroupsChange(newGroups);
        }
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
            backgroundColor: `${primaryColor}10`,
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
            backgroundColor: `${sectionBackground}80`,
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
            flex: 1,
            fontSize: moderateScale(14),
            color: textColor,
        },
        operatorSelect: {
            flexDirection: 'row',
            borderWidth: 1,
            borderColor: borderColor,
            borderRadius: moderateScale(6),
            padding: moderateScale(8),
            justifyContent: 'center',
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
    });

  return (
    <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>End conditions (OR groups)</ThemedText>
        <ThemedText style={{ marginBottom: moderateScale(12), color: placeholderColor }}>
            The event will end when ANY condition group is met
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
                        ALL conditions in this group must be met (AND)
                    </ThemedText>
                    
                    {/* Кнопки добавления условий */}
                    <View>
                        {conditionTypes.map(type => (
                            !hasConditionInGroup(groupIndex, type.id) && (
                            <TouchableOpacity
                                key={type.id}
                                style={styles.conditionTypeButton}
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
                                {condition.parameterName === 'time' ? 'End date and time:' : 
                                condition.parameterName === 'bank' ? 'Bank amount:' : 'Number of participants:'}
                            </ThemedText>
                            
                            <TouchableOpacity 
                                style={styles.removeButton}
                                onPress={() => removeCondition(groupIndex, conditionIndex)}
                            >
                                <IconSymbol name="xmark.circle.fill" size={22} color={errorColor} />
                            </TouchableOpacity>
                            </View>
                            
                            {condition.parameterName === 'time' ? (
                            <TouchableOpacity
                                style={styles.conditionInput}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <ThemedText>
                                {new Date(condition.value).toLocaleString()}
                                </ThemedText>
                            </TouchableOpacity>
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

        {showDatePicker && (
            <DateTimePicker
                value={selectedDate}
                mode="datetime"
                display="default"
                onChange={onDateChange}
            />
        )}
    </View>
  );
}; 
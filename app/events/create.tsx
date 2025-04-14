import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { CustomButton } from '@/components/custom/button';
import * as ImagePicker from 'expo-image-picker';
import { EventEndCondition, EndCondition } from '@/lib/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUserSearch } from '@/lib/hooks/useUserSearch';

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

interface GroupData {
  name: string;
  conditions: Array<{
    parameterName: string;
    operator: string;
    value: string;
    comparisonOp?: string;
  }>;
}

export default function CreateEventScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('DONATION');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [recipientId, setRecipientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [recipientName, setRecipientName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { users, isSearching, showUserList, searchUsers, resetSearch } = useUserSearch();

  // Для условий завершения события (множественные группы)
  const [groups, setGroups] = useState<GroupData[]>([
    { 
      name: 'First group',
      conditions: []
    }
  ]);

  // Получение цветов из темы
  //const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'divider');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const sectionBackground = useThemeColor({}, 'sectionBackground');
  const errorColor = useThemeColor({}, 'error');
  const accentColor = useThemeColor({}, 'primary');
  const textSecondary = useThemeColor({}, 'icon');

  // Выбор изображения
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Need access', 'Allow access to the photo gallery to select images');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Добавление новой группы условий
  const addConditionGroup = () => {
    setGroups([
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
    setGroups(newGroups);
  };

  // Удаление группы условий
  const removeConditionGroup = (groupIndex: number) => {
    if (groups.length <= 1) {
      Alert.alert('Attention', 'There must be at least one condition group');
      return;
    }
    
    const newGroups = [...groups];
    newGroups.splice(groupIndex, 1);
    setGroups(newGroups);
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
    
    setGroups(newGroups);
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
    setGroups(newGroups);
  };

  // Обновление значения условия
  const updateConditionValue = (groupIndex: number, conditionIndex: number, value: string) => {
    const newGroups = [...groups];
    newGroups[groupIndex].conditions[conditionIndex].value = value;
    setGroups(newGroups);
  };

  // Обновление оператора сравнения
  const updateConditionOperator = (groupIndex: number, conditionIndex: number, operator: string) => {
    const newGroups = [...groups];
    newGroups[groupIndex].conditions[conditionIndex].comparisonOp = operator;
    setGroups(newGroups);
  };

  // Обработка выбора даты
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      // Находим условие с типом time и обновляем его значение
      const newGroups = [...groups];
      for (let groupIndex = 0; groupIndex < newGroups.length; groupIndex++) {
        const conditionIndex = newGroups[groupIndex].conditions.findIndex(
          c => c.parameterName === 'time'
        );
        if (conditionIndex !== -1) {
          newGroups[groupIndex].conditions[conditionIndex].value = selectedDate.toISOString();
          break;
        }
      }
      setGroups(newGroups);
    }
  };

  // Выбор пользователя
  const selectUser = (user: {id: string, username: string}) => {
    setRecipientId(user.id);
    setRecipientName(user.username);
    setSearchQuery(user.username);
    resetSearch();
  };

  // Отправка формы
  const handleSubmit = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter the event name');
      return;
    }

    if ((type === 'DONATION' || type === 'FUNDRAISING') && !recipientId) {
      Alert.alert('Error', 'For donations and fundraising, you must specify a recipient');
      return;
    }

    setLoading(true);

    // Преобразуем группы в формат, ожидаемый API
    const endConditions: EventEndCondition[] = groups.map(group => ({
      name: group.name,
      conditions: group.conditions.map(cond => ({
        parameterName: cond.parameterName,
        operator: cond.comparisonOp ? `${cond.comparisonOp.toUpperCase()}_${cond.operator}` : cond.operator,
        value: cond.value
      }))
    }));

    // Здесь будет вызов API для создания события
    console.log('Submitting with end conditions:', endConditions);
    
    // Сейчас просто симулируем задержку и успешное создание
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success',
        'Event created successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 1000);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      //backgroundColor: backgroundColor,
    },
    content: {
      padding: moderateScale(16),
      paddingTop: verticalScale(40),
      paddingBottom: verticalScale(120),
      flexGrow: 1,
    },
    section: {
      marginTop: moderateScale(8),
      marginBottom: moderateScale(8),
      flex: 1,
    },
    doubleSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: moderateScale(16),
      marginBottom: moderateScale(16),
    },
    sectionTitle: {
      fontSize: moderateScale(18),
      fontWeight: '600',
      marginBottom: moderateScale(8),
    },
    input: {
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: moderateScale(8),
      padding: moderateScale(12),
      fontSize: moderateScale(16),
      color: textColor,
      backgroundColor: sectionBackground,
      marginBottom: moderateScale(16),
    },
    largeInput: {
      height: moderateScale(120),
      textAlignVertical: 'top',
    },
    imageContainer: {
      alignItems: 'flex-start',
      aspectRatio: 1,
    },
    imagePlaceholder: {
      width: moderateScale(170),
      height: moderateScale(170),
      borderRadius: moderateScale(8),
      backgroundColor: sectionBackground,
      borderWidth: 1,
      borderColor: borderColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedImage: {
      width: moderateScale(150),
      height: moderateScale(150),
      borderRadius: moderateScale(8),
    },
    imageText: {
      fontSize: moderateScale(14),
      color: placeholderColor,
      marginTop: moderateScale(8),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: moderateScale(16),
      width: '100%',
    },
    typeContainer: {
      width: moderateScale(150),
      height: moderateScale(150),
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-end',
      alignSelf: 'flex-end',
      gap: moderateScale(12),
    },
    typeTitleContainer: {
      width: '100%',
      alignItems: 'flex-end',
    },
    typeTitle: {
      textAlign: 'center',
      width: '100%',
    },
    typeButton: {
      flex: 1,
      width: '90%',
      padding: moderateScale(10),
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: moderateScale(8),
      minHeight: moderateScale(40),
    },
    selectedType: {
      backgroundColor: primaryColor,
    },
    typeText: {
      fontWeight: '500',
    },
    selectedTypeText: {
      color: 'white',
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
    submitButton: {
      marginTop: moderateScale(20),
      marginBottom: moderateScale(20),
      width: '100%',
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
    searchContainer: {
      position: 'relative',
      marginBottom: moderateScale(8),
    },
    searchIndicator: {
      position: 'absolute',
      right: moderateScale(8),
      top: moderateScale(8),
    },
    userList: {
      maxHeight: moderateScale(200),
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: moderateScale(8),
      overflow: 'hidden',
    },
    userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: moderateScale(12),
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
    },
    userAvatarContainer: {
      marginRight: moderateScale(12),
    },
    userAvatar: {
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: moderateScale(20),
    },
    userAvatarPlaceholder: {
      backgroundColor: primaryColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    userAvatarText: {
      color: 'white',
      fontSize: moderateScale(18),
      fontWeight: 'bold',
    },
    userName: {
      flex: 1,
      fontSize: moderateScale(16),
    },
    noResults: {
      padding: moderateScale(12),
      textAlign: 'center',
      color: placeholderColor,
    },
  });

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Create event',
          headerShown: true,
          headerBackTitle: 'Back',
        }} 
      />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          
          <View style={styles.doubleSection}>

            {/* Изображение */}
            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Your event clicker!</ThemedText>
                <View style={styles.imageContainer}>
                <TouchableOpacity onPress={pickImage}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.selectedImage} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                        <IconSymbol name="photo" size={40} color={placeholderColor} />
                    </View>
                    )}
                    <ThemedText style={styles.imageText}>
                    {imageUri ? "Click to change" : "Click to choose image"}
                    </ThemedText>
                </TouchableOpacity>
                </View>
            </View>
            {/* Тип события */}
            <View style={styles.section}>
                <View style={styles.typeTitleContainer}>
                    <ThemedText style={styles.sectionTitle}>Event type</ThemedText>
                </View>
                <View style={styles.typeContainer} >
                <TouchableOpacity
                    style={[
                    styles.typeButton,
                    type === 'DONATION' && styles.selectedType,
                    { borderColor: type === 'DONATION' ? primaryColor : borderColor }
                    ]}
                    onPress={() => setType('DONATION')}
                >
                    <ThemedText 
                    style={[
                        styles.typeText, 
                        type === 'DONATION' && styles.selectedTypeText
                    ]}
                    >
                    Donation
                    </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[
                    styles.typeButton,
                    type === 'FUNDRAISING' && styles.selectedType,
                    { borderColor: type === 'FUNDRAISING' ? primaryColor : borderColor }
                    ]}
                    onPress={() => setType('FUNDRAISING')}
                >
                    <ThemedText 
                    style={[
                        styles.typeText, 
                        type === 'FUNDRAISING' && styles.selectedTypeText
                    ]}
                    >
                    Fundraising
                    </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[
                    styles.typeButton,
                    type === 'JACKPOT' && styles.selectedType,
                    { borderColor: type === 'JACKPOT' ? primaryColor : borderColor }
                    ]}
                    onPress={() => setType('JACKPOT')}
                >
                    <ThemedText 
                    style={[
                        styles.typeText, 
                        type === 'JACKPOT' && styles.selectedTypeText
                    ]}
                    >
                    Jackpot
                    </ThemedText>
                </TouchableOpacity>
                </View>
            </View>

          </View>

          {/* Получатель средств (только для DONATION и FUNDRAISING) */}
          {(type === 'DONATION' || type === 'FUNDRAISING') && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Recipient</ThemedText>
              <ThemedText style={{ marginBottom: moderateScale(8), color: placeholderColor }}>
                This type of event requires a recipient. Select the recipient in the field above:
              </ThemedText>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.input}
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    searchUsers(text);
                  }}
                  placeholder="Search recipient..."
                  placeholderTextColor={placeholderColor}
                  keyboardType="default"
                />
                {isSearching && (
                  <ActivityIndicator style={styles.searchIndicator} color={primaryColor} />
                )}
              </View>
              {showUserList && users.length > 0 && (
                <View style={styles.userList}>
                  {users.map((user) => (
                    <TouchableOpacity
                      key={user.id}
                      style={styles.userItem}
                      onPress={() => selectUser(user)}
                    >
                      <View style={styles.userAvatarContainer}>
                        {user.image ? (
                          <Image 
                            source={{ uri: user.image }} 
                            style={styles.userAvatar} 
                          />
                        ) : (
                          <View style={[styles.userAvatar, styles.userAvatarPlaceholder]}>
                            <ThemedText style={styles.userAvatarText}>
                              {user.username.charAt(0).toUpperCase()}
                            </ThemedText>
                          </View>
                        )}
                      </View>
                      <ThemedText style={styles.userName}>{user.username}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {showUserList && users.length === 0 && !isSearching && (
                <ThemedText style={styles.noResults}>No users found</ThemedText>
              )}
            </View>
          )}

          {/* Название события */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Event name</ThemedText>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter event name"
              placeholderTextColor={placeholderColor}
            />
          </View>
          
          {/* Описание */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Description</ThemedText>
            <TextInput
              style={[styles.input, styles.largeInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter event description"
              placeholderTextColor={placeholderColor}
              multiline
            />
          </View>
          
          
          {/* Условия окончания события */}
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
                  <View style={styles.row}>
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
          </View>
          
          {/* Кнопка создания */}
          <CustomButton 
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText style={{ color: 'white', fontWeight: '600', fontSize: moderateScale(16) }}>
                    Create event
              </ThemedText>
            )}
          </CustomButton>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="datetime"
          display="default"
          onChange={onDateChange}
        />
      )}
    </>
  );
} 
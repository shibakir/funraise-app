import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { CustomButton } from '@/components/custom/button';

import { EventEndCondition } from '@/lib/types';
import DateTimePicker from '@react-native-community/datetimepicker';

import { EventImageSection } from '@/components/event/EventImageSection';
import { EventTypeSection } from '@/components/event/EventTypeSection';
import { EventEndConditions } from '@/components/event/EventEndConditions';
import { GroupData, EventType } from '@/types/event';

export default function CreateEventScreen() {
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'divider');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const sectionBackground = useThemeColor({}, 'sectionBackground');

  const [eventType, setEventType] = useState<EventType>('DONATION');
  const [recipient, setRecipient] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Для условий завершения события (множественные группы)
  const [groups, setGroups] = useState<GroupData[]>([
    { 
      name: 'First group',
      conditions: []
    }
  ]);

  // Обработка выбора даты
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  // Выбор типа события
  const handleEventTypeChange = (type: EventType) => {
    setEventType(type);
  };

  // Выбор получателя
  const handleRecipientChange = (name: string) => {
    setRecipient(name);
  };

  // Изменение имени получателя
  const handleRecipientNameChange = (name: string) => {
    //setName(name);
  };

  // Выбор изображения
  const handleImageChange = (uri: string | null) => {
    console.log('Image changed:', uri); // Добавим логирование
    setImageUri(uri);
  };

  // Отправка формы
  const handleSubmit = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter the event name');
      return;
    }
    if ((eventType === 'DONATION' || eventType === 'FUNDRAISING') && !recipient) {
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
      marginBottom: moderateScale(32),
      gap: moderateScale(32),
    },
    sectionTitle: {
      fontSize: moderateScale(18),
      fontWeight: '600',
      marginBottom: moderateScale(8),
    },
    sectionDescription: {
      fontSize: moderateScale(14),
      color: placeholderColor,
      marginBottom: moderateScale(8),
      marginTop: moderateScale(8),
      lineHeight: moderateScale(20),
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
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: moderateScale(16),
      width: '100%',
    },
    submitButton: {
      marginTop: moderateScale(20),
      marginBottom: moderateScale(20),
      width: '100%',
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
      <KeyboardAvoidingView style={{ flex: 1 }} >
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {/* Изображение */}
          <View style={styles.doubleSection}>
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Your event clicker!</ThemedText>
              <EventImageSection 
                imageUri={imageUri}
                onImageChange={handleImageChange}
              />
            </View>    
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Creating new event</ThemedText>
              <ThemedText style={styles.sectionDescription}>
                You are on the page for creating a new event. 
                Here you need to set up its type, name and description. 
                Set up a clicker image and set up one or more conditions for its end.
              </ThemedText>
            </View>   
          </View>

          {/* Тип события */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Event type</ThemedText>
            <EventTypeSection 
              selectedType={eventType}
              onTypeChange={handleEventTypeChange}
              recipientId={recipient}
              onRecipientChange={handleRecipientChange}
              recipientName={recipient}
              onRecipientNameChange={handleRecipientNameChange}
            />
          </View>
          
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
          <EventEndConditions
            groups={groups}
            onGroupsChange={setGroups}
          />
        
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
          value={selectedDate || new Date()}
          mode="datetime"
          display="default"
          onChange={onDateChange}
        />
      )}
    </>
  );
} 
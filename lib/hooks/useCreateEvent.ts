import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { EventType, GroupData } from '@/types/event';
import { EventEndCondition } from '@/lib/types';

interface CreateEventParams {
  name: string;
  description: string;
  eventType: EventType;
  creatorId: string;
  recipientId?: string;
  imageUri?: string | null;
  imageFile?: { uri: string; type: string; name: string } | null;
  groups: GroupData[];
}

export const useCreateEvent = () => {
  const [loading, setLoading] = useState(false);

  const createEvent = async ({
    name,
    description,
    eventType,
    creatorId,
    recipientId,
    imageUri,
    imageFile,
    groups
  }: CreateEventParams) => {
    
    if (!imageUri || !imageFile) {
        Alert.alert('Oops!', 'Please set a clicker image for the event');
        return;
    }
    if (!name) {
        Alert.alert('Oops!', 'Please enter the event name');
        return;
    }
    if ((eventType === 'DONATION' || eventType === 'FUNDRAISING') && !recipientId) {
        Alert.alert('Oops!', 'For donations and fundraising, you must specify a recipient');
        return;
    }

    // Проверяем, есть ли хотя бы одна группа с условиями
    const hasValidGroups = groups.some(group => group.conditions.length > 0);
    if (!hasValidGroups) {
        Alert.alert('Oops!', 'At least one of the condition groups must have at least one condition');
        return;
    }

    // Проверяем, что все значения условий больше или равны 2
    const hasInvalidValues = groups.some(group => 
        group.conditions.some(condition => {
            // Проверяем только числовые значения (исключаем временные условия)
            if (condition.parameterName !== 'time') {
                const value = parseFloat(condition.value);
                return !isNaN(value) && value < 2;
            }
            return false;
        })
    );

    if (hasInvalidValues) {
        Alert.alert('Oops!', 'All condition values must be at least 2');
        return;
    }

    setLoading(true);
    try {
      // Преобразуем группы в формат, ожидаемый API
      const endConditions: EventEndCondition[] = groups
        .filter(group => group.conditions.length > 0) // dont send empty groups
        .map(group => ({
            name: group.name,
            conditions: group.conditions.map(cond => ({
            parameterName: cond.parameterName,
            operator: cond.comparisonOp ? cond.comparisonOp : "",
            value: cond.value
            }))
        }));

        // Создаем FormData для отправки файла
        const formData = new FormData();
        formData.append('name', name);
        formData.append('type', eventType);
        formData.append('creatorId', creatorId);
        if (recipientId) {
            formData.append('recipientId', recipientId);
        }
        formData.append('description', description);
        formData.append('image', imageFile as any);
        formData.append('endConditions', JSON.stringify(endConditions));

        console.log('formData', formData);

        // Отправляем запрос на сервер
        const response = await fetch('http://localhost:3000/events', {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create new event');
        }

        const data = await response.json();
        console.log('Event created:', data);

        Alert.alert(
            'Success',
            'Event created successfully',
            [{ text: 'OK', onPress: () => router.back() }]
        );
    } catch (error) {
        Alert.alert('Error', 'Failed to create event. Please try again later.');
        console.error('Error creating event:', error);
    } finally {
        setLoading(false);
    }
  };

  return {
    createEvent,
    loading
  };
}; 
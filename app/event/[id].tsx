import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity, Vibration, Text, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useEventDetails, ConditionGroup } from '@/lib/hooks/useEventDetails';

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

export default function EventScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { event, loading, error, refresh } = useEventDetails(id as string);
  
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Анимация для изображения
  const scale = useSharedValue(1);
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });
  
  // Обработчик нажатия на изображение
  const handleImagePress = () => {
    // Включаем вибрацию
    Vibration.vibrate(50);
    
    // Анимация уменьшения и возвращения размера
    scale.value = withSpring(0.95, { damping: 10 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 10 });
    }, 150);
  };

  // Цвета темы
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const sectionBackground = useThemeColor({}, 'sectionBackground');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'divider');
  //const secondaryTextColor = useThemeColor({}, 'secondaryText');
  const errorColor = useThemeColor({}, 'error');
  const cardColor = useThemeColor({}, 'card');

  // Компонент для отображения группы условий
  const ConditionGroupCard = ({ group, index }: { group: ConditionGroup, index: number }) => {
    return (
        <>
        <ThemedView style={styles.conditionCard}>
            <View style={styles.conditionHeader}>
            <ThemedText style={styles.conditionTitle}>Group {index + 1}</ThemedText>
            <ThemedText style={styles.progressText}>Progress: {group.progress}%</ThemedText>
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
                    color={condition.isCompleted ? primaryColor : ""} 
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
      </>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    imageContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: verticalScale(20),
      paddingHorizontal: horizontalScale(20),
    },
    eventImageWrapper: {
      width: '80%',
      aspectRatio: 1,
      borderRadius: moderateScale(16),
      borderWidth: moderateScale(3),
      borderColor: primaryColor,
      overflow: 'hidden',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    eventImage: {
      width: '100%',
      height: '100%',
    },
    contentContainer: {
      padding: moderateScale(16),
    },
    descriptionContainer: {
      marginBottom: verticalScale(24),
      padding: moderateScale(16),
      borderRadius: moderateScale(12),
      backgroundColor: cardColor,
    },
    descriptionTitle: {
      fontSize: moderateScale(18),
      fontWeight: '600',
      marginBottom: verticalScale(8),
    },
    descriptionText: {
      fontSize: moderateScale(16),
      lineHeight: moderateScale(24),
    },
    bankContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(24),
      padding: moderateScale(16),
      borderRadius: moderateScale(12),
      backgroundColor: cardColor,
    },
    bankLabel: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      marginRight: horizontalScale(8),
    },
    bankAmount: {
      fontSize: moderateScale(20),
      fontWeight: 'bold',
      color: primaryColor,
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
      borderColor: borderColor,
      backgroundColor: cardColor,
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
      color: primaryColor,
    },
    progressBar: {
      height: verticalScale(8),
      backgroundColor: borderColor,
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: moderateScale(20),
    },
    errorText: {
      fontSize: moderateScale(16),
      color: errorColor,
      textAlign: 'center',
    },
    headerTitle: {
      fontSize: moderateScale(18),
      fontWeight: '600',
    },
    headerButton: {
      padding: moderateScale(8),
    }
  });

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText style={{ marginTop: verticalScale(16) }}>Loading event details...</ThemedText>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={[styles.errorContainer, { backgroundColor }]}>
        <Ionicons name="alert-circle-outline" size={moderateScale(48)} color={errorColor} />
        <ThemedText style={styles.errorText}>
          {error || 'Event not found'}
        </ThemedText>
        <TouchableOpacity 
          style={[styles.headerButton, { marginTop: verticalScale(16) }]}
          onPress={() => router.back()}
        >
          <ThemedText style={{ color: primaryColor }}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: event.name,
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />      
      <ScrollView style={styles.scrollView} contentContainerStyle={{ flexGrow: 1 }}>

        <View style={styles.contentContainer}>
          <View style={styles.bankContainer}>
            <ThemedText style={styles.bankLabel}>Current Bank Amount:</ThemedText>
            <ThemedText style={styles.bankAmount}>${event.bankAmount.toFixed(2)}</ThemedText>
          </View>
        </View>
        
        {event.imageUrl && (
          <View style={styles.imageContainer}>
            <TouchableOpacity activeOpacity={0.9} onPress={handleImagePress}>
              <Animated.View style={[styles.eventImageWrapper, animatedStyles]}>
                <ExpoImage
                  source={{ uri: event.imageUrl }}
                  style={styles.eventImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={300}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.contentContainer}>
          <View style={styles.descriptionContainer}>
            <ThemedText style={styles.descriptionTitle}>Description</ThemedText>
            <ThemedText style={styles.descriptionText}>{event.description}</ThemedText>
          </View>
          
          <ThemedText style={styles.conditionsTitle}>Conditions</ThemedText>
          
          {event.conditionGroups.map((group, index) => (
            <ConditionGroupCard key={group.id} group={group} index={index} />
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
} 
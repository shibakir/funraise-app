import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import type { SearchFilters } from '@/lib/hooks/useEventSearch';
import Slider from '@react-native-community/slider';

interface SearchFilterPanelProps {
    filters: SearchFilters;
    onApplyFilters: (filters: Partial<SearchFilters>) => void;
    id?: string;
    isVisible?: boolean;
    onClose?: () => void;
}

// Типы событий
const EVENT_TYPES = [
  { id: 'DONATION', label: 'Donation' },
  { id: 'FUNDRAISING', label: 'Fundraising' },
  { id: 'JACKPOT', label: 'Jackpot' }
];

// Опции сортировки
const SORT_OPTIONS = [
  { sortBy: 'name', sortOrder: 'asc', label: 'By event name ascending (A-Z)' },
  { sortBy: 'name', sortOrder: 'desc', label: 'By event name descending(Z-A)' },
  { sortBy: 'createdAt', sortOrder: 'desc', label: 'By date descending (new first)' },
  { sortBy: 'createdAt', sortOrder: 'asc', label: 'By date ascending (old first)' },
  { sortBy: 'progress', sortOrder: 'desc', label: 'By progress descending' },
  { sortBy: 'progress', sortOrder: 'asc', label: 'By progress ascending' }
];

export const SearchFilterPanel: React.FC<SearchFilterPanelProps> = ({
    filters,
    onApplyFilters,
    id,
    isVisible,
    onClose
}) => {
    const [showFilters, setShowFilters] = useState(false);
    const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
    
    const primaryColor = useThemeColor({}, 'primary');
    const surfaceColor = useThemeColor({}, 'surface');
    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const dividerColor = useThemeColor({}, 'divider');
    const lightBgColor = useThemeColor({}, 'surfaceHighlight');
    
    // Синхронизируем внутреннее состояние с внешним
    useEffect(() => {
        if (isVisible !== undefined) {
        setShowFilters(isVisible);
        }
    }, [isVisible]);
    
    // Уведомляем родителя о закрытии
    const handleClose = () => {
        setShowFilters(false);
        if (onClose) {
        onClose();
        }
    };
    
    // Обработка изменения типов событий
    const toggleEventType = (type: string) => {
        setLocalFilters(prev => {
        const newTypes = prev.types.includes(type)
            ? prev.types.filter(t => t !== type)
            : [...prev.types, type];
        
        return {
            ...prev,
            types: newTypes
        };
        });
    };
  
    // Обработка изменения параметров прогресса
    const handleProgressChange = (values: [number, number]) => {
        setLocalFilters(prev => ({
        ...prev,
        minProgress: values[0],
        maxProgress: values[1]
        }));
    };
        
    // Обработка изменения параметров сортировки
    const handleSortChange = (sortBy: 'name' | 'createdAt' | 'progress', sortOrder: 'asc' | 'desc') => {
        setLocalFilters(prev => ({
        ...prev,
        sortBy,
        sortOrder
        }));
    };
    
    // Применение фильтров
    const applyFilters = () => {
        onApplyFilters(localFilters);
        setShowFilters(false);
        if (onClose) {
        onClose();
        }
    };
        
    // Сброс фильтров
    const resetFilters = () => {
        const resetState: SearchFilters = {
        types: [],
        minProgress: 0,
        maxProgress: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc'
        };
        
        setLocalFilters(resetState);
        onApplyFilters(resetState);
    };
    
    // Проверка, выбран ли тип события
    const isTypeSelected = (type: string) => localFilters.types.includes(type);
    
    // Проверка, выбран ли параметр сортировки
    const isSortSelected = (sortBy: string, sortOrder: string) => 
        localFilters.sortBy === sortBy && localFilters.sortOrder === sortOrder;

    const styles = StyleSheet.create({
        modalOverlay: {
          flex: 1,
          justifyContent: 'flex-end',
        },
        modalContent: {
          borderTopLeftRadius: moderateScale(20),
          borderTopRightRadius: moderateScale(20),
          paddingVertical: verticalScale(16),
          paddingBottom: verticalScale(50),
          maxHeight: '70%',
        },
        modalHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: horizontalScale(16),
          paddingBottom: verticalScale(16),
        },
        modalTitle: {
          fontSize: moderateScale(18),
          fontWeight: 'bold',
        },
        modalBody: {
          padding: moderateScale(16),
        },
        filterSection: {
          marginBottom: verticalScale(16),
        },
        sectionTitle: {
          fontSize: moderateScale(16),
          fontWeight: 'bold',
          marginBottom: verticalScale(8),
        },
        typeButtonsContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginTop: verticalScale(8),
        },
        typeButton: {
          paddingVertical: verticalScale(8),
          paddingHorizontal: horizontalScale(12),
          borderRadius: moderateScale(16),
          marginRight: horizontalScale(8),
          marginBottom: verticalScale(8),
          borderWidth: 1,
        },
        typeButtonText: {
          fontSize: moderateScale(14),
        },
        divider: {
          height: 1,
          marginVertical: verticalScale(12),
        },
        progressContainer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginVertical: verticalScale(8),
        },
        sliderContainer: {
          marginTop: verticalScale(8),
        },
        slider: {
          width: '100%',
          height: verticalScale(40),
        },
        sortOptionsContainer: {
          marginTop: verticalScale(8),
        },
        sortOption: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: verticalScale(12),
          paddingHorizontal: horizontalScale(16),
          borderRadius: moderateScale(8),
          
        },
        sortOptionText: {
          fontSize: moderateScale(14),
        },
        modalFooter: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: horizontalScale(16),
          paddingTop: verticalScale(12),
        },
        footerButton: {
          paddingVertical: verticalScale(10),
          paddingHorizontal: horizontalScale(16),
          borderRadius: moderateScale(8),
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        resetButton: {
          marginRight: horizontalScale(8),
          borderWidth: 1,
        },
        resetButtonText: {
          fontWeight: '500',
        },
        applyButton: {
          marginLeft: horizontalScale(8),
        },
        applyButtonText: {
          fontWeight: '600',
        },
    });
    
    return (
        <>
            {!isVisible && (
                <TouchableOpacity
                style={[{ backgroundColor: sectionBackground }]}
                onPress={() => setShowFilters(true)}
                >
                <IconSymbol name="line.3.horizontal.decrease.circle" size={moderateScale(24)} color={primaryColor} />
                </TouchableOpacity>
            )}
            
            <Modal
                visible={showFilters}
                animationType="slide"
                transparent={true}
                onRequestClose={() => handleClose()}
            >
                <View style={styles.modalOverlay}>
                    <ThemedView style={[styles.modalContent, { backgroundColor: cardColor }]}>
                        <View style={styles.modalHeader}>
                            <ThemedText style={styles.modalTitle}>Search filters</ThemedText>
                            <TouchableOpacity onPress={() => handleClose()}>
                                <IconSymbol name="xmark.circle.fill" size={moderateScale(24)} color={textColor} />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.modalBody}>
                        {/* Фильтр по типам событий */}
                        <View style={styles.filterSection}>
                            <ThemedText style={styles.sectionTitle}>Event type</ThemedText>
                            <View style={styles.typeButtonsContainer}>
                                {EVENT_TYPES.map((eventType) => (
                                    <TouchableOpacity
                                        key={eventType.id}
                                        style={[
                                            styles.typeButton,
                                            isTypeSelected(eventType.id) && { backgroundColor: primaryColor }
                                        ]}
                                        onPress={() => toggleEventType(eventType.id)}
                                    >
                                        <ThemedText
                                            style={[
                                                styles.typeButtonText,
                                                isTypeSelected(eventType.id) && { color: surfaceColor }
                                            ]}
                                        >
                                            {eventType.label}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        
                        {/* Разделитель */}
                        <View style={[styles.divider, { backgroundColor: dividerColor }]} />
                        
                        {/* Фильтр по прогрессу */}
                        <View style={styles.filterSection}>
                            <ThemedText style={styles.sectionTitle}>Current event progress</ThemedText>
                            <View style={styles.progressContainer}>
                            <ThemedText>Min: {localFilters.minProgress}%</ThemedText>
                            <ThemedText>Max: {localFilters.maxProgress}%</ThemedText>
                            </View>
                            
                            <View style={styles.sliderContainer}>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={100}
                                step={1}
                                value={localFilters.minProgress}
                                onValueChange={(value) => setLocalFilters(prev => ({ ...prev, minProgress: value }))}
                                minimumTrackTintColor={primaryColor}
                                maximumTrackTintColor={dividerColor}
                                thumbTintColor={primaryColor}
                            />
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={100}
                                step={1}
                                value={localFilters.maxProgress}
                                onValueChange={(value) => setLocalFilters(prev => ({ ...prev, maxProgress: value }))}
                                minimumTrackTintColor={primaryColor}
                                maximumTrackTintColor={dividerColor}
                                thumbTintColor={primaryColor}
                            />
                            </View>
                        </View>
                        
                        {/* Разделитель */}
                        <View style={[styles.divider, { backgroundColor: dividerColor }]} />
                        
                        {/* Фильтр по сортировке */}
                        <View style={styles.filterSection}>
                            <ThemedText style={styles.sectionTitle}>Sort by</ThemedText>
                            <View style={styles.sortOptionsContainer}>
                                {SORT_OPTIONS.map((option, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.sortOption,
                                            isSortSelected(option.sortBy, option.sortOrder) && { backgroundColor: lightBgColor }
                                        ]}
                                        onPress={() => handleSortChange(option.sortBy as any, option.sortOrder as any)}
                                    >
                                        <ThemedText style={styles.sortOptionText}>{option.label}</ThemedText>
                                        {isSortSelected(option.sortBy, option.sortOrder) && (
                                            <IconSymbol name="checkmark" size={moderateScale(16)} color={primaryColor} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        </ScrollView>
                        
                        <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[styles.footerButton, styles.resetButton]}
                            onPress={resetFilters}
                        >
                            <ThemedText style={styles.resetButtonText}>Reset</ThemedText>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[styles.footerButton, styles.applyButton, { backgroundColor: primaryColor }]}
                            onPress={applyFilters}
                        >
                            <ThemedText style={styles.applyButtonText}>Apply</ThemedText>
                        </TouchableOpacity>
                        </View>
                    </ThemedView>
                </View>
            </Modal>
        </>
    );
};


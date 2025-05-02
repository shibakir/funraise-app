import React from 'react';
import { StyleSheet, View, TouchableOpacity, Modal } from 'react-native';
import { ThemedText } from '@/components/themed/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { moderateScale } from '@/lib/utilities/Metrics';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateTimePickerModalProps {
    visible: boolean;
    onClose: () => void;
    value: Date;
    onChange: (date: Date) => void;
}

export const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
    visible,
    onClose,
    value,
    onChange,
}) => {
    const textColor = useThemeColor({}, 'text');
    const sectionBackground = useThemeColor({}, 'sectionBackground');

    const styles = StyleSheet.create({
        modalContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        },
        modalContent: {
            backgroundColor: sectionBackground,
            borderRadius: moderateScale(12),
            padding: moderateScale(16),
            width: '90%',
            alignItems: 'center',
            zIndex: 1,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginBottom: moderateScale(16),
        },
        modalTitle: {
            fontSize: moderateScale(18),
            fontWeight: '600',
            color: textColor,
        },
        closeButton: {
            padding: moderateScale(8),
        },
    });

    return (
        <Modal
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            animationType="fade"
        >
            <View style={styles.modalContainer}>
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <ThemedText style={styles.modalTitle}>Select date and time</ThemedText>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <IconSymbol name="xmark" size={24} color={textColor} />
                        </TouchableOpacity>
                    </View>
                    <DateTimePicker
                        value={value}
                        mode="datetime"
                        display="spinner"
                        onChange={(event, date) => {
                            if (date) {
                                const dateWithZeroSeconds = new Date(date);
                                dateWithZeroSeconds.setSeconds(0);
                                onChange(dateWithZeroSeconds);
                            }
                        }}
                        textColor={textColor}
                        minimumDate={new Date()}
                        maximumDate={new Date(2101, 1, 1)}
                    />
                </View>
            </View>
        </Modal>
    );
}; 
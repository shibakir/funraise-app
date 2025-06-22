import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/lib/hooks/ui';
import { horizontalScale, moderateScale } from '@/lib/utilities/Metrics';
import { useTranslation } from 'react-i18next';
interface CreateEventSectionProps {
    onPress?: () => void;
}

export function CreateEventSection({ onPress }: CreateEventSectionProps) {

    const { t } = useTranslation();

    const textSecondary = useThemeColor({}, 'icon');
    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const primaryColor = useThemeColor({}, 'primary');

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            router.push('/events/create');
        }
    };

    return (
        <ThemedView style={[styles.createEventSection, { backgroundColor: sectionBackground }]}>
            <TouchableOpacity 
                style={styles.createEventButton}
                onPress={handlePress}
                activeOpacity={1}
                onPressIn={(e) => e.preventDefault()}
            >
                <View style={[styles.createEventIcon, { backgroundColor: primaryColor }]}>
                    <IconSymbol name="plus" size={24} color="white" />
                </View>
                <ThemedText style={styles.createEventText}>{t('else.createNewEvent')}</ThemedText>
                <IconSymbol name="chevron.right" size={20} color={textSecondary} />
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    createEventSection: {
        borderRadius: moderateScale(14),
        overflow: 'hidden',
    },
    createEventButton: {
        padding: moderateScale(16),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    createEventIcon: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        alignItems: 'center',
        justifyContent: 'center',
    },
    createEventText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        flex: 1,
        marginLeft: horizontalScale(12),
    },
}); 
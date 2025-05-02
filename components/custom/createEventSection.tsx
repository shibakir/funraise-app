import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, moderateScale, verticalScale } from '@/lib/utilities/Metrics';

interface CreateEventSectionProps {
    title?: string;
    onPress?: () => void;
}

export function CreateEventSection({ title = 'Create New Event', onPress }: CreateEventSectionProps) {

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
                activeOpacity={0.7}
            >
                <View style={[styles.createEventIcon, { backgroundColor: primaryColor }]}>
                <IconSymbol name="plus" size={24} color="white" />
                </View>
                <ThemedText style={styles.createEventText}>{title}</ThemedText>
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
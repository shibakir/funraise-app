import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { useThemeColor } from '@/lib/hooks/ui';
import { moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useTranslation } from 'react-i18next';
interface EventDescriptionProps {
    description: string;
}

export const EventDescription: React.FC<EventDescriptionProps> = ({ description }) => {
    const { t } = useTranslation();
    const cardColor = useThemeColor({}, 'card');
    
    return (
        <ThemedView style={[styles.container, { backgroundColor: cardColor }]}>
            <ThemedText style={styles.title}>{t('event.description')}</ThemedText>
            <ThemedText style={styles.text}>{description}</ThemedText>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: moderateScale(16),
        borderRadius: moderateScale(12),
        marginBottom: verticalScale(24),
    },
    title: {
        fontSize: moderateScale(18),
        fontWeight: '600',
        marginBottom: verticalScale(8),
    },
    text: {
        fontSize: moderateScale(16),
        lineHeight: moderateScale(24),
    },
}); 
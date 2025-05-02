import React, { useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed/ThemedText';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useTranslation } from 'react-i18next';

export interface EventInterface {
    id: string;
    name: string;
    status?: 'active' | 'inactive';
    imageUrl?: string;
    conditionsProgress: number[];
    avgProgress?: number;
}

export function EventCard({ event }: { event: EventInterface }) {
    const { t } = useTranslation();
    
    const borderColor = useThemeColor({}, 'divider');
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
    const surfaceColor = useThemeColor({}, 'surface');
    const successColor = useThemeColor({}, 'success');

    // animation for active indicator
    const opacity = useSharedValue(1);
    
    useEffect(() => {
        if (event.status === 'active') {
            opacity.value = withRepeat(
                withTiming(0.4, { duration: 1000 }),
                -1,
                true
            );
        } else {
            opacity.value = 0.6; // inactive indicator
        }
    }, [event.status]);
    
    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    // Рассчитываем общий прогресс как среднее значение всех условий
    const totalProgress = event.avgProgress || (event.conditionsProgress.length > 0 
        ? Math.round(event.conditionsProgress.reduce((a, b) => a + b, 0) / event.conditionsProgress.length)
        : 0);
    
    return (
        <TouchableOpacity 
            style={styles.eventCard(borderColor)}
            onPress={() => router.push({
                    pathname: '/event/[id]',
                    params: { id: event.id }
                })
            }
            activeOpacity={0.7}
        >
            <View style={styles.eventInfo()}>
                {event.status === 'active' && (
                    <Animated.View style={[styles.activeNowContainer(), { opacity: opacity }]}>
                        <Animated.View 
                            style={[
                                styles.statusIndicator(),
                                styles.activeIndicator(primaryColor),
                                animatedStyle
                            ]} 
                        />
                        <Animated.Text style={[styles.activeNowText(successColor), animatedStyle]}>
                            {t('eventCard.activeNow')}
                        </Animated.Text>
                    </Animated.View>
                )}
                <ThemedText style={styles.eventName()} numberOfLines={2}>{event.name}</ThemedText>
                
                <View style={styles.progressContainer(borderColor)}>
                    <View style={[styles.progressBar(primaryColor), { width: `${totalProgress}%` }]} />
                </View>
                <ThemedText style={styles.progressText(textColor)}>{`${t('eventCard.progress')}: ${totalProgress}%`}</ThemedText>
            </View>
        
            {event.imageUrl && (
                <ExpoImage 
                    source={{ uri: event.imageUrl }}
                    style={styles.eventImage(primaryColor, surfaceColor)}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={200}
                />
            )}
        </TouchableOpacity>
    );
};

const styles = {
    activeIndicator: (primaryColor?: string | null) => ({
        backgroundColor: primaryColor || undefined,
    }),
    eventName: () => ({
        fontSize: moderateScale(16),
        fontWeight: '600' as const,
        flex: 1,
    }),
    progressContainer: (borderColor?: string | null) => ({
        width: '70%' as any,
        height: moderateScale(8),
        backgroundColor: borderColor || undefined,
        borderRadius: moderateScale(4),
        marginTop: verticalScale(8),
        overflow: 'hidden' as const,
    }),
    progressBar: (primaryColor?: string | null) => ({
        height: '100%' as any,
        backgroundColor: primaryColor || undefined,
    }),
    eventCard: (borderColor?: string | null) => ({
        flexDirection: 'row' as const,
        padding: moderateScale(16),
        borderBottomWidth: 1,
        borderBottomColor: borderColor || undefined,
    }),
    eventInfo: () => ({
        flex: 1,
        marginRight: horizontalScale(12),
    }),
    activeNowContainer: () => ({
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginBottom: verticalScale(8),
    }),
    statusIndicator: () => ({
        width: moderateScale(8),
        height: moderateScale(8),
        borderRadius: moderateScale(4),
        marginRight: horizontalScale(8),
    }),
    activeNowText: (successColor?: string | null) => ({
        fontSize: moderateScale(12),
        color: successColor || undefined,
    }),
    progressText: (textColor?: string | null) => ({
        fontSize: moderateScale(12),
        color: textColor || undefined,
        marginTop: verticalScale(4),
    }),
    eventImage: (primaryColor?: string | null, surfaceColor?: string | null) => ({
        width: moderateScale(80),
        height: moderateScale(80),
        borderRadius: moderateScale(8),
        backgroundColor: surfaceColor || undefined,
        borderWidth: 3,
        borderColor: primaryColor || undefined,
        shadowColor: primaryColor || undefined,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }),
}; 
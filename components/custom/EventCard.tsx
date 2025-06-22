import React, { useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed/ThemedText';
import { useThemeColor } from '@/lib/hooks/ui';
import { horizontalScale, moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useTranslation } from 'react-i18next';
import { EventStatus } from '@/lib/graphql/types';
import type { Event } from '@/lib/graphql/types';

export type EventCardProps = {
    event: Event;
};

export function EventCard({ event }: EventCardProps) {
    const { t } = useTranslation();
    
    const borderColor = useThemeColor({}, 'divider');
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
    const surfaceColor = useThemeColor({}, 'surface');
    const successColor = useThemeColor({}, 'success');

    const opacity = useSharedValue(1);

    const totalProgress = React.useMemo(() => {
        let progress = 0;
        
        if (event.endConditions && Array.isArray(event.endConditions) && event.endConditions.length > 0) {
            let totalConditions = 0;
            let completedConditions = 0;
            
            event.endConditions.forEach(endConditionGroup => {
                if (endConditionGroup && endConditionGroup.conditions && Array.isArray(endConditionGroup.conditions)) {
                    endConditionGroup.conditions.forEach(condition => {
                        if (condition) {
                            totalConditions++;
                            if (condition.isCompleted) {
                                completedConditions++;
                            }
                        }
                    });
                }
            });
            
            if (totalConditions > 0) {
                progress = (completedConditions / totalConditions) * 100;
            } else {
                // If there are no conditions, use the status of the event
                progress = event.status === EventStatus.FINISHED ? 100 : event.status === EventStatus.IN_PROGRESS ? 50 : 0;
            }
        } else {
            progress = event.status === EventStatus.FINISHED ? 100 : event.status === EventStatus.IN_PROGRESS ? 50 : 0;
        }
        
        return Math.round(progress);
    }, [event]);

    const isActive = event.status === EventStatus.IN_PROGRESS;
    
    useEffect(() => {
        if (isActive) {
            opacity.value = withRepeat(
                withTiming(0.4, { duration: 1000 }),
                -1,
                true
            );
        } else {
            opacity.value = 0; // inactive indicator
        }
    }, [isActive]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    return (
        <TouchableOpacity 
            style={styles.eventCard(borderColor)}
            onPress={() => router.push({
                    pathname: '/event/[id]',
                    params: { id: String(event.id) }
                })
            }
            activeOpacity={0.7}
        >
            <View style={styles.eventInfo()}>
                {isActive && (
                    <Animated.View style={[styles.activeNowContainer(), { opacity: opacity}]}>
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
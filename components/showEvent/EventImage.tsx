import React from 'react';
import { StyleSheet, View, TouchableOpacity, Vibration } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, moderateScale, verticalScale } from '@/lib/utilities/Metrics';

interface EventImageProps {
    imageUrl: string | undefined;
    onPress: () => void;
    disabled?: boolean;
}

export const EventImage: React.FC<EventImageProps> = ({ 
    imageUrl, 
    onPress,
    disabled = false 
}) => {
    const primaryColor = useThemeColor({}, 'primary');
    const disabledColor = useThemeColor({}, 'divider');
    
    // image press animation
    const scale = useSharedValue(1);
    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }]
        };
    });
    
    const handleImagePress = () => {
        if (disabled) return;
        
        Vibration.vibrate(50);
        
        scale.value = withSpring(0.80, { damping: 10 });
        setTimeout(() => {
            scale.value = withSpring(1, { damping: 10 });
        }, 100);
        
        onPress();
    };
  
    if (!imageUrl) {
        return null;
    }
    
    return (
        <View style={styles.container}>
            <TouchableOpacity 
                activeOpacity={0.9} 
                onPress={handleImagePress}
                disabled={disabled}
                style={styles.touchable}
            >
                <Animated.View 
                    style={[
                        styles.imageWrapper, 
                        animatedStyles, 
                        { borderColor: disabled ? disabledColor : primaryColor }
                    ]}
                >
                <ExpoImage
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={300}
                />
                {disabled && (
                    <View style={styles.disabledOverlay} />
                )}
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: verticalScale(20),
        paddingHorizontal: horizontalScale(20),
    },
    touchable: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageWrapper: {
        width: '80%',
        aspectRatio: 1,
        borderRadius: moderateScale(16),
        borderWidth: moderateScale(3),
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    disabledOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
}); 
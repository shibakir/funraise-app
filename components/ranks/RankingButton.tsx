import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { moderateScale } from '@/lib/utilities/Metrics';
import { useThemeColor } from '@/lib/hooks/ui';

interface RankingButtonProps {
    title: string;
    isActive: boolean;
    onPress: () => void;
}

export default function RankingButton({ 
    title, 
    isActive, 
    onPress,
}: RankingButtonProps) {

    const primaryColor = useThemeColor({}, 'primary');
    const surfaceColor = useThemeColor({}, 'surface');
    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const textColor = useThemeColor({}, 'text');

    return (
        <TouchableOpacity
            style={[
                styles.rankingButton,
                { backgroundColor: isActive ? primaryColor : sectionBackground }
            ]}
            onPress={onPress}
        >
            <Text style={[styles.rankingButtonText, { color: isActive ? surfaceColor : textColor }]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    rankingButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: moderateScale(10),
        paddingVertical: moderateScale(10),
        marginTop: moderateScale(4),
    },
    rankingButtonText: {
        fontSize: moderateScale(16),
        fontWeight: '500',
    },
});

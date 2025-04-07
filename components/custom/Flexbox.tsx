import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColor } from '@/lib/hooks/useThemeColor';

interface FlexboxProps {
    children: React.ReactNode;
    direction?: 'row' | 'column';
    justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
    align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    style?: ViewStyle;
}

export const Flexbox = ({ 
    children, 
    direction = 'column',
    justify = 'space-around',
    align = 'stretch',
    style 
}: FlexboxProps) => {
    const backgroundColor = useThemeColor({}, 'surface');
    
    return (
        <View 
            style={[
                styles.container, 
                { 
                    backgroundColor,
                    flexDirection: direction,
                    justifyContent: justify,
                    alignItems: align
                },
                style
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
});
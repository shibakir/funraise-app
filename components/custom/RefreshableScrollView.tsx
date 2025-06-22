import React from 'react';
import { ScrollView, RefreshControl, ScrollViewProps } from 'react-native';
import { useRefresh } from '@/lib/context/RefreshContext';
import { useThemeColor } from '@/lib/hooks/ui';

interface RefreshableScrollViewProps extends ScrollViewProps {
    children: React.ReactNode;
}

export function RefreshableScrollView({ children, ...scrollViewProps }: RefreshableScrollViewProps) {
    const { isRefreshing, onRefresh } = useRefresh();
    const primaryColor = useThemeColor({}, 'primary');

    return (
        <ScrollView
            {...scrollViewProps}
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    tintColor={primaryColor}
                    colors={[primaryColor]}
                    progressBackgroundColor="transparent"
                />
            }
        >
        {children}
        </ScrollView>
    );
} 
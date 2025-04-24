import React, { useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useEventBank } from '@/lib/hooks/useEventBank';

export interface EventBankInfoHandle {
  refresh: () => void;
}

interface EventBankInfoProps {
  eventId: string;
}

export const EventBankInfo = forwardRef<EventBankInfoHandle, EventBankInfoProps>(({ eventId }, ref) => {
  const { bankAmount, loading, error, refresh } = useEventBank(eventId);
  
  const primaryColor = useThemeColor({}, 'primary');
  const cardColor = useThemeColor({}, 'card');
  const errorColor = useThemeColor({}, 'error');
  
  useImperativeHandle(ref, () => ({
    refresh
  }));

  if (error) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: cardColor }]}>
        <ThemedText style={{ color: errorColor }}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardColor }]}>
      <View style={styles.infoRow}>
        <ThemedText style={styles.label}>Current Bank Amount:</ThemedText>
        <ThemedText style={[styles.value, { color: primaryColor }]}>
          ${bankAmount.toFixed(2) || '0.00'}
        </ThemedText>
      </View>
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: verticalScale(80),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  value: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
  },
}); 
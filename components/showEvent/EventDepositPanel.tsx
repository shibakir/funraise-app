import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useAuth } from '@/lib/context/AuthContext';
import { useUserBalance } from '@/lib/hooks/useUserBalance';
import { useCreateParticipation } from '@/lib/hooks/useCreateParticipation';
import { useUserParticipation } from '@/lib/hooks/useUserParticipation';
import { useUpdateParticipation } from '@/lib/hooks/useUpdateParticipation';
import { useTranslation } from 'react-i18next';

export interface EventDepositPanelHandle {
    handleCreateParticipation: () => Promise<void>;
    handleUpdateParticipation: () => Promise<void>;
    hasParticipation: boolean;
}

interface EventDepositPanelProps {
    eventId: string;
    onDepositChange: (value: number) => void;
    onParticipationUpdated: () => void;
}

export const EventDepositPanel = forwardRef<EventDepositPanelHandle, EventDepositPanelProps>(({ 
    eventId, 
    onDepositChange,
    onParticipationUpdated 
}, ref) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { balance, loading: balanceLoading, error: balanceError, refresh: refreshBalance } = useUserBalance(user?.id.toString() || null);
    const { participation, loading: participationLoading, error: participationError, refresh: refreshParticipation } = useUserParticipation(user?.id.toString() || null, eventId);
    const { createParticipation, loading: createLoading } = useCreateParticipation();
    const { updateParticipation, loading: updateLoading } = useUpdateParticipation();
    
    const [depositAmount, setDepositAmount] = useState(1);
    const [depositing, setDepositing] = useState(false);
    
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'divider');
    const mutedTextColor = useThemeColor({}, 'tabIconDefault');
    const cardColor = useThemeColor({}, 'card');
    const errorColor = useThemeColor({}, 'error');
        
    // calculate the maximum value for the slider (either 50, or the user's balance)
    const maxDepositAmount = user && balance ? Math.min(50, balance) : 50;
    
    // check and correct the depositAmount value when balance changes
    useEffect(() => {
        if (user && balance !== null && depositAmount > maxDepositAmount) {
            setDepositAmount(maxDepositAmount);
        }
    }, [balance, maxDepositAmount, user]);
    
    // export methods through ref for use in the parent component
    useImperativeHandle(ref, () => ({
        handleCreateParticipation: async () => {
            await handleCreateParticipation();
        },
        handleUpdateParticipation: async () => {
            await handleUpdateParticipation();
        },
        hasParticipation: !!participation
    }));
    
    // update the parent component when the selected amount changes
    useEffect(() => {
        onDepositChange(depositAmount);
    }, [depositAmount, onDepositChange]);
    
    // handler for creating participation
    const handleCreateParticipation = async () => {
        if (!user) {
            Alert.alert('Error', 'You must be logged in to participate');
            return;
        }
        
        if (balance === 0 || balance === null) {
            Alert.alert('Ooops...', 'Insufficient balance. Please top up your balance to continue');
            return;
        }
        
        // check and correct the depositAmount value before creating participation
        const actualDepositAmount = Math.min(depositAmount, maxDepositAmount);
        if (actualDepositAmount !== depositAmount) {
            setDepositAmount(actualDepositAmount);
        }
        
        setDepositing(true);
        
        const result = await createParticipation({
            userId: user.id.toString(),
            eventId: eventId,
            deposit: actualDepositAmount
        });
        
        setDepositing(false);
        
        if (result.success) {
            Alert.alert('Success', 'You have successfully joined this event');
            refreshBalance();
            refreshParticipation();
            onParticipationUpdated();
        }
    };

    // handler for updating participation
    const handleUpdateParticipation = async () => {
        if (!user || !participation) {
            return;
        }
        
        if (balance === 0 || balance === null) {
            Alert.alert('Ooops...', 'Insufficient balance. Please top up your balance to continue');
            return;
        }
        
        // Проверяем и корректируем значение depositAmount перед обновлением участия
        const actualDepositAmount = Math.min(depositAmount, maxDepositAmount);
        if (actualDepositAmount !== depositAmount) {
            setDepositAmount(actualDepositAmount);
        }
        
        setDepositing(true);
        
        const result = await updateParticipation({
            id: participation.id.toString(),
            deposit: actualDepositAmount
        });
        
        setDepositing(false);
        
        if (result.success) {
            refreshBalance();
            refreshParticipation();
            onParticipationUpdated();
        }
    };
    
    return (
        <ThemedView style={[styles.container, { backgroundColor: cardColor }]}>
            <ThemedText style={styles.title}>{t('event.selectAmount')}</ThemedText>
            
            {balanceError ? (
                <ThemedText style={{ color: errorColor }}>{balanceError}</ThemedText>
            ) : (
                <View>
                <ThemedText style={[styles.balanceText, { color: mutedTextColor }]}>
                    {t('event.balance')}: ${balance?.toFixed(2) || '0.00'}
                </ThemedText>
                
                {participation && (
                    <ThemedText style={[styles.participationInfo, { color: primaryColor }]}>
                    {t('event.yourCurrentDeposit')}: ${participation.deposit.toFixed(2)}
                    </ThemedText>
                )}
                
                {!participation && (
                    <ThemedText style={[styles.balanceText, { color: mutedTextColor }]}>
                        {t('event.clickOnTheImageToJoinTheEvent')}
                    </ThemedText>
                )}
                </View>
            )}
        
            <View style={styles.sliderContainer}>
                <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={maxDepositAmount}
                    value={depositAmount}
                    onValueChange={setDepositAmount}
                    step={1}
                    minimumTrackTintColor={primaryColor}
                    maximumTrackTintColor={borderColor}
                    thumbTintColor={primaryColor}
                    disabled={balance === 0 || !user || depositing || createLoading || updateLoading}
                />
                <ThemedText style={[styles.depositAmountText, { color: primaryColor }]}>
                    ${depositAmount.toFixed(2)}
                </ThemedText>
            </View>
        </ThemedView>
    );
});

const styles = StyleSheet.create({
    container: {
        padding: moderateScale(16),
        borderRadius: moderateScale(12),
        marginBottom: verticalScale(16),
    },
    title: {
        fontSize: moderateScale(18),
        fontWeight: '600',
        marginBottom: verticalScale(8),
    },
    balanceText: {
        fontSize: moderateScale(14),
        marginBottom: verticalScale(8),
    },
    participationInfo: {
        marginTop: verticalScale(4),
        fontSize: moderateScale(14),
        fontWeight: '600',
        marginBottom: verticalScale(8),
    },
    sliderContainer: {
        marginTop: verticalScale(8),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    slider: {
        flex: 1,
        height: verticalScale(40),
        marginRight: horizontalScale(10),
    },
    depositAmountText: {
        fontSize: moderateScale(24),
        fontWeight: 'bold',
        minWidth: horizontalScale(80),
        textAlign: 'right',
    },
});

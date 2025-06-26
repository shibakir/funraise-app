import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { useThemeColor } from '@/lib/hooks/ui';
import { horizontalScale, moderateScale, verticalScale } from '@/lib/utilities/Metrics';
import { useAuth } from '@/lib/context/AuthContext';
import { useUserBalance } from '@/lib/hooks/users';
import { useParticipation } from '@/lib/hooks/events';
import { useTranslation } from 'react-i18next';

export interface EventDepositPanelHandle {
    handleUpsertParticipation: () => Promise<void>;
    hasParticipation: boolean;
}

interface EventDepositPanelProps {
    eventId: string;
    isEventActive: boolean; // Add prop for event status
    onDepositChange: (value: number) => void;
    onParticipationUpdated: () => void;
}

export const EventDepositPanel = forwardRef<EventDepositPanelHandle, EventDepositPanelProps>(({ 
    eventId,
    isEventActive, 
    onDepositChange,
    onParticipationUpdated 
}, ref) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { balance, loading: balanceLoading, error: balanceError, refetch: refreshBalance } = useUserBalance({ userId: user?.id.toString() || null });
    const { participation, loading: participationLoading, error: participationError, refetch: refreshParticipation, upsertParticipation } = useParticipation(user?.id.toString() || null, eventId);
    
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
        if (user && balance !== null) {
            setDepositAmount(prevAmount => {
                const correctedAmount = Math.max(1, Math.min(prevAmount, maxDepositAmount));
                if (correctedAmount !== prevAmount) {
                    //console.log(`Slider value corrected: ${prevAmount} -> ${correctedAmount} (max: ${maxDepositAmount})`);
                }
                return correctedAmount;
            });
        }
    }, [balance, maxDepositAmount, user]);
    
    // export methods through ref for use in the parent component
    useImperativeHandle(ref, () => ({
        handleUpsertParticipation: async () => {
            await handleUpsertParticipation();
        },
        hasParticipation: !!participation
    }));
    
    // update the parent component when the selected amount changes
    useEffect(() => {
        onDepositChange(depositAmount);
    }, [depositAmount, onDepositChange]);
    
    // handler for creating or updating participation (unified operation)
    const handleUpsertParticipation = async () => {
        if (!user) {
            Alert.alert(t('auth.error'), t('alerts.mustBeLoggedIn'));
            return;
        }
        
        if (balance === 0 || balance === null) {
            Alert.alert(t('alerts.attention'), t('alerts.insufficientBalance'));
            return;
        }
        
        // check and correct the depositAmount value before operation
        const actualDepositAmount = Math.min(depositAmount, maxDepositAmount);
        if (actualDepositAmount !== depositAmount) {
            setDepositAmount(actualDepositAmount);
        }
        
        setDepositing(true);
        
        const result = await upsertParticipation({
            userId: user.id.toString(),
            eventId: eventId,
            deposit: actualDepositAmount
        });
        
        setDepositing(false);
        
        if (result.success) {
            refreshBalance(); // This will update the balance and automatically correct the slider through useEffect
            refreshParticipation();
            onParticipationUpdated();
        }
    };

    // Don't show the deposit panel for inactive events
    if (!isEventActive) {
        return null;
    }

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
                    disabled={balance === 0 || !user || depositing || participationLoading || !isEventActive}
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

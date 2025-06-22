import { useQuery, useSubscription, useMutation } from '@apollo/client';
import { GET_USER_BALANCE, BALANCE_UPDATED_SUBSCRIPTION, CREATE_TRANSACTION } from '@/lib/graphql';
import { User } from '@/lib/graphql';
import { useState, useCallback } from 'react';

interface UseUserBalanceProps {
    userId: string | null;
    enableSubscription?: boolean;
    onBalanceUpdated?: (user: User) => void;
}

interface CreateTransactionInput {
    amount: number;
    type: string;
    userId: number;
}

interface UpdateBalanceResponse {
    success: boolean;
    newBalance?: number;
}

export const useUserBalance = ({ 
    userId, 
    enableSubscription = true, 
    onBalanceUpdated 
}: UseUserBalanceProps) => {
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    const { 
        data: balanceData, 
        loading: balanceLoading, 
        error: balanceError, 
        refetch 
    } = useQuery(GET_USER_BALANCE, {
        variables: { userId: userId ? parseInt(userId) : 0 },
        skip: !userId,
        errorPolicy: 'all',
        fetchPolicy: 'cache-and-network', // preserve cache issue
        notifyOnNetworkStatusChange: true,
    });

    // check balance in live
    const { 
        data: subscriptionData, 
        loading: subscriptionLoading, 
        error: subscriptionError 
    } = useSubscription(BALANCE_UPDATED_SUBSCRIPTION, {
        variables: { userId: userId ? parseInt(userId) : 0 },
        skip: !userId || !enableSubscription,
        onData: ({ data }) => {
            if (data.data?.balanceUpdated && onBalanceUpdated) {
                onBalanceUpdated(data.data.balanceUpdated);
            }
        }
    });

    const [createTransaction] = useMutation(CREATE_TRANSACTION);

    const updateBalance = useCallback(async (amount: number): Promise<UpdateBalanceResponse> => {
        if (!userId) {
            setUpdateError('User ID is required');
            return { success: false };
        }

        if (isNaN(amount) || amount <= 0) {
            setUpdateError('Please enter a valid positive amount');
            return { success: false };
        }

        setUpdateLoading(true);
        setUpdateError(null);

        try {
            const input: CreateTransactionInput = {
                amount: amount,
                type: 'BALANCE_INCOME',
                userId: parseInt(userId)
            };

            const result = await createTransaction({
                variables: { input },
                refetchQueries: ['GetUserBalance'],
                awaitRefetchQueries: true
            });

            if (result.data?.createTransaction) {
                return { success: true };
            } else {
                throw new Error('Transaction creation failed');
            }
        } catch (err: any) {
            console.error('Error updating balance:', err);
            setUpdateError(err.message || 'Failed to update balance. Please try again later.');
            return { success: false };
        } finally {
            setUpdateLoading(false);
        }
    }, [createTransaction, userId]);

    return {
        // Balance data
        balance: balanceData?.userBalance ?? null,
        
        // Loading states
        loading: balanceLoading || (enableSubscription && subscriptionLoading),
        updateLoading,
        
        // Errors
        error: balanceError?.message || subscriptionError?.message || updateError || null,
        
        // Methods
        refetch,
        updateBalance,
        
        // Subscription data
        subscriptionData: subscriptionData?.balanceUpdated || null,
    };
}; 
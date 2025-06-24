import { useQuery, useSubscription, useMutation } from '@apollo/client';
import { GET_USER_BALANCE, BALANCE_UPDATED_SUBSCRIPTION, CREATE_TRANSACTION } from '@/lib/graphql';
import { User } from '@/lib/graphql';
import { useState, useCallback } from 'react';

/**
 * Configuration props for the user balance hook.
 * Defines user ID, subscription preferences, and callback functions.
 */
interface UseUserBalanceProps {
    /** ID of the user to monitor balance for (null if not authenticated) */
    userId: string | null;
    /** Whether to enable real-time balance subscriptions (default: true) */
    enableSubscription?: boolean;
    /** Callback function triggered when balance is updated via subscription */
    onBalanceUpdated?: (user: User) => void;
}

/**
 * Input structure for creating balance update transactions.
 * Defines the transaction parameters for balance modifications.
 */
interface CreateTransactionInput {
    /** Amount to add or subtract from balance */
    amount: number;
    /** Type of transaction (BALANCE_INCOME, BALANCE_OUTCOME, etc.) */
    type: string;
    /** ID of the user receiving the transaction */
    userId: number;
}

/**
 * Response structure for balance update operations.
 * Indicates success status and optionally returns new balance value.
 */
interface UpdateBalanceResponse {
    /** Whether the balance update was successful */
    success: boolean;
    /** New balance value after the update (optional) */
    newBalance?: number;
}

/**
 * Custom hook for managing user balance with real-time updates.
 * Provides comprehensive balance management including fetching, monitoring,
 * and updating user balances with subscription support.
 * 
 * @param {UseUserBalanceProps} props - Configuration object
 * @param {string|null} props.userId - User ID to monitor (null if not authenticated)
 * @param {boolean} [props.enableSubscription=true] - Enable real-time subscriptions
 * @param {Function} [props.onBalanceUpdated] - Callback for balance updates
 * 
 * @returns {Object} Balance data and operations
 * @returns {number|null} balance - Current user balance or null
 * @returns {boolean} loading - Combined loading state for queries and subscriptions
 * @returns {boolean} updateLoading - Loading state for balance update operations
 * @returns {string|null} error - Current error message or null
 * @returns {Function} refetch - Function to manually refetch balance data
 * @returns {Function} updateBalance - Function to update user balance
 * @returns {User|null} subscriptionData - Latest user data from subscriptions
 * 
 */
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

    /**
     * Updates the user's balance by creating a BALANCE_INCOME transaction.
     * Validates input, executes the mutation, and handles errors gracefully.
     * 
     * @param {number} amount - Amount to add to the user's balance (must be positive)
     * @returns {Promise<UpdateBalanceResponse>} Result indicating success/failure
     */
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
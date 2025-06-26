import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing';
import { useUserBalance } from '@/lib/hooks/users/useUserBalance';
import { GET_USER_BALANCE, BALANCE_UPDATED_SUBSCRIPTION, CREATE_TRANSACTION } from '@/lib/graphql';

const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    balance: 1000,
};

// successful balance query mock
const mocksBalanceSuccess = [
    {
        request: {
            query: GET_USER_BALANCE,
            variables: { userId: 1 },
        },
        result: {
            data: {
                userBalance: 1000,
            },
        },
    },
];

// subscription mock
const mocksSubscription = [
    {
        request: {
            query: BALANCE_UPDATED_SUBSCRIPTION,
            variables: { userId: 1 },
        },
        result: {
            data: {
                balanceUpdated: {
                    ...mockUser,
                    balance: 1500,
                },
            },
        },
    },
];

// transaction creation mock
const mocksCreateTransaction = [
    {
        request: {
            query: CREATE_TRANSACTION,
            variables: {
                input: {
                    amount: 500,
                    type: 'BALANCE_INCOME',
                    userId: 1,
                },
            },
        },
        result: {
            data: {
                createTransaction: {
                    id: 1,
                    amount: 500,
                    type: 'BALANCE_INCOME',
                    userId: 1,
                },
            },
        },
    },
];

// error mocks
const mocksBalanceError = [
    {
        request: {
            query: GET_USER_BALANCE,
            variables: { userId: 1 },
        },
        error: {
            graphQLErrors: [{ message: 'Failed to fetch balance' }],
            networkError: null,
            message: 'Failed to fetch balance',
        },
    },
];

const mocksTransactionError = [
    {
        request: {
            query: CREATE_TRANSACTION,
            variables: {
                input: {
                    amount: 500,
                    type: 'BALANCE_INCOME',
                    userId: 1,
                },
            },
        },
        error: {
            graphQLErrors: [{ message: 'Transaction failed' }],
            networkError: null,
            message: 'Transaction failed',
        },
    },
];

// Default subscription mock for tests that don't use it
const defaultSubscriptionMock = {
    request: {
        query: BALANCE_UPDATED_SUBSCRIPTION,
        variables: { userId: 1 },
    },
    result: {
        data: {
            balanceUpdated: null,
        },
    },
};

const renderUseUserBalance = (
    mocks: any[],
    props: {
        userId: string | null;
        enableSubscription?: boolean;
        onBalanceUpdated?: (user: any) => void;
    } = { userId: '1' }
) => {
    // Add default subscription mock if not provided and subscription is enabled
    const finalMocks = props.enableSubscription !== false
        ? [...mocks, defaultSubscriptionMock]
        : mocks;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockedProvider mocks={finalMocks} addTypename={false}>
            {children}
        </MockedProvider>
    );

    return renderHook(() => useUserBalance(props), { wrapper });
};

describe('useUserBalance', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return initial state', () => {
        const { result } = renderUseUserBalance([], { userId: '1', enableSubscription: false });

        expect(result.current.balance).toBeNull();
        expect(result.current.loading).toBe(true);
        expect(result.current.updateLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(typeof result.current.updateBalance).toBe('function');
        expect(typeof result.current.refetch).toBe('function');
    });

    it('should skip query when userId is null', () => {
        const { result } = renderUseUserBalance([], { userId: null, enableSubscription: false });

        expect(result.current.balance).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    it('should fetch balance successfully', async () => {
        const { result } = renderUseUserBalance(mocksBalanceSuccess, { userId: '1', enableSubscription: false });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.balance).toBe(1000);
        expect(result.current.error).toBeNull();
    });

    it('should handle balance fetch error', async () => {
        const { result } = renderUseUserBalance(mocksBalanceError, { userId: '1', enableSubscription: false });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.balance).toBeNull();
        expect(result.current.error).toBe('Failed to fetch balance');
    });

    it('should update balance successfully', async () => {
        const refinedTransactionMock = {
            request: {
                query: CREATE_TRANSACTION,
                variables: {
                    input: {
                        amount: 500,
                        type: 'BALANCE_INCOME',
                        userId: 1,
                    },
                },
            },
            result: {
                data: {
                    createTransaction: {
                        id: 1,
                        amount: 500,
                        type: 'BALANCE_INCOME',
                        userId: 1,
                        createdAt: new Date().toISOString(),
                    },
                },
            },
        };

        const combinedMocks = [...mocksBalanceSuccess, refinedTransactionMock];
        const { result } = renderUseUserBalance(combinedMocks, { userId: '1', enableSubscription: false });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        let updateResult;
        await act(async () => {
            updateResult = await result.current.updateBalance(500);
        });

        await waitFor(() => {
            expect(result.current.updateLoading).toBe(false);
        });

        expect(updateResult).toEqual({ success: true });
    });

    it('should handle update balance with invalid amount', async () => {
        const { result } = renderUseUserBalance(mocksBalanceSuccess, { userId: '1', enableSubscription: false });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        let updateResult;
        await act(async () => {
            updateResult = await result.current.updateBalance(0);
        });

        expect(updateResult).toEqual({ success: false });
        expect(result.current.error).toBe('Please enter a valid positive amount');
    });

    it('should handle update balance without userId', async () => {
        const { result } = renderUseUserBalance([], { userId: null, enableSubscription: false });

        let updateResult;
        await act(async () => {
            updateResult = await result.current.updateBalance(500);
        });

        expect(updateResult).toEqual({ success: false });
        expect(result.current.error).toBe('User ID is required');
    });

    it('should handle transaction creation error', async () => {
        const combinedMocks = [...mocksBalanceSuccess, ...mocksTransactionError];
        const { result } = renderUseUserBalance(combinedMocks, { userId: '1', enableSubscription: false });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        let updateResult;
        await act(async () => {
            updateResult = await result.current.updateBalance(500);
        });

        expect(updateResult).toEqual({ success: false });
        expect(result.current.error).toBe('Transaction failed');
    });

    it('should show update loading state', async () => {
        const combinedMocks = [...mocksBalanceSuccess, ...mocksCreateTransaction];
        const { result } = renderUseUserBalance(combinedMocks, { userId: '1', enableSubscription: false });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        act(() => {
            result.current.updateBalance(500);
        });

        expect(result.current.updateLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.updateLoading).toBe(false);
        });
    });

    it('should handle subscription updates', async () => {
        const onBalanceUpdated = jest.fn();
        const combinedMocks = [...mocksBalanceSuccess, ...mocksSubscription];

        const { result } = renderUseUserBalance(combinedMocks, {
            userId: '1',
            enableSubscription: true,
            onBalanceUpdated,
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // subscription data should be available
        await waitFor(() => {
            expect(result.current.subscriptionData).toBeDefined();
        });
    });

    it('should disable subscription when enableSubscription is false', () => {
        const { result } = renderUseUserBalance(mocksBalanceSuccess, {
            userId: '1',
            enableSubscription: false,
        });

        expect(result.current.subscriptionData).toBeNull();
    });

    it('should handle NaN amount in updateBalance', async () => {
        const { result } = renderUseUserBalance(mocksBalanceSuccess, { userId: '1', enableSubscription: false });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        let updateResult;
        await act(async () => {
            updateResult = await result.current.updateBalance(NaN);
        });

        expect(updateResult).toEqual({ success: false });
        expect(result.current.error).toBe('Please enter a valid positive amount');
    });

    it('should handle negative amount in updateBalance', async () => {
        const { result } = renderUseUserBalance(mocksBalanceSuccess, { userId: '1', enableSubscription: false });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        let updateResult;
        await act(async () => {
            updateResult = await result.current.updateBalance(-100);
        });

        expect(updateResult).toEqual({ success: false });
        expect(result.current.error).toBe('Please enter a valid positive amount');
    });
}); 
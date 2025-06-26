import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing';
import { useParticipation } from '@/lib/hooks/events/useParticipation';
import { UPSERT_PARTICIPATION, GET_USER_PARTICIPATION, GET_USER_BALANCE } from '@/lib/graphql';
import { Alert } from 'react-native';

// mock React Native Alert only
jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    return {
        ...RN,
        Alert: {
            alert: jest.fn(),
        },
    };
});

const mockParticipation = {
    id: 1,
    deposit: 100,
    userId: 1,
    eventId: 1,
    user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
    },
    event: {
        id: 1,
        name: 'Test Event',
        description: 'Test Description',
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
};

// successful participation query mock
const mocksParticipationSuccess = [
    {
        request: {
            query: GET_USER_PARTICIPATION,
            variables: { userId: 1, eventId: 1 },
        },
        result: {
            data: {
                userParticipation: mockParticipation,
            },
        },
    },
];

// empty participation query mock
const mocksParticipationEmpty = [
    {
        request: {
            query: GET_USER_PARTICIPATION,
            variables: { userId: 1, eventId: 1 },
        },
        result: {
            data: {
                userParticipation: null,
            },
        },
    },
];

// upsert participation mock (new participation)
const mocksUpsertNew = [
    {
        request: {
            query: UPSERT_PARTICIPATION,
            variables: {
                input: {
                    userId: 1,
                    eventId: 1,
                    deposit: 200,
                },
            },
        },
        result: {
            data: {
                upsertParticipation: {
                    participation: {
                        ...mockParticipation,
                        deposit: 200,
                    },
                    isNewParticipation: true,
                    transaction: {
                        id: 1,
                        amount: -200,
                        type: 'EVENT_OUTCOME',
                        userId: 1,
                    },
                },
            },
        },
    },
];

// upsert participation mock (update existing)
const mocksUpsertUpdate = [
    {
        request: {
            query: UPSERT_PARTICIPATION,
            variables: {
                input: {
                    userId: 1,
                    eventId: 1,
                    deposit: 300,
                },
            },
        },
        result: {
            data: {
                upsertParticipation: {
                    participation: {
                        ...mockParticipation,
                        deposit: 300,
                    },
                    isNewParticipation: false,
                    transaction: {
                        id: 2,
                        amount: -100, // difference
                        type: 'EVENT_OUTCOME',
                        userId: 1,
                    },
                },
            },
        },
    },
];

// error mocks
const mocksParticipationError = [
    {
        request: {
            query: GET_USER_PARTICIPATION,
            variables: { userId: 1, eventId: 1 },
        },
        error: {
            graphQLErrors: [{ message: 'Failed to fetch participation' }],
            networkError: null,
            message: 'Failed to fetch participation',
        },
    },
];

const mocksUpsertError = [
    {
        request: {
            query: UPSERT_PARTICIPATION,
            variables: {
                input: {
                    userId: 1,
                    eventId: 1,
                    deposit: 200,
                },
            },
        },
        error: {
            graphQLErrors: [{ message: 'Insufficient balance' }],
            networkError: null,
            message: 'Insufficient balance',
        },
    },
];

const renderUseParticipation = (
    mocks: any[],
    userId: string | null = '1',
    eventId: string | null = '1'
) => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockedProvider mocks={mocks} addTypename={false}>
            {children}
        </MockedProvider>
    );

    return renderHook(() => useParticipation(userId, eventId), { wrapper });
};

describe('useParticipation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (Alert.alert as jest.Mock).mockClear();
    });

    it('should return initial state', () => {
        const { result } = renderUseParticipation([]);

        expect(result.current.participation).toBeNull();
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBeNull();
        expect(typeof result.current.upsertParticipation).toBe('function');
        expect(typeof result.current.refetch).toBe('function');
    });

    it('should skip query when userId or eventId is null', () => {
        const { result: resultNoUser } = renderUseParticipation([], null, '1');
        const { result: resultNoEvent } = renderUseParticipation([], '1', null);

        expect(resultNoUser.current.participation).toBeNull();
        expect(resultNoUser.current.loading).toBe(false);

        expect(resultNoEvent.current.participation).toBeNull();
        expect(resultNoEvent.current.loading).toBe(false);
    });

    it('should fetch participation successfully', async () => {
        const { result } = renderUseParticipation(mocksParticipationSuccess);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.participation).toEqual(mockParticipation);
        expect(result.current.error).toBeNull();
    });

    it('should handle empty participation result', async () => {
        const { result } = renderUseParticipation(mocksParticipationEmpty);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.participation).toBeNull();
        expect(result.current.error).toBeNull();
    });

    it('should handle participation fetch error', async () => {
        const { result } = renderUseParticipation(mocksParticipationError);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.participation).toBeNull();
        expect(result.current.error).toBe('Failed to fetch participation');
    });

    it('should create new participation successfully', async () => {
        const combinedMocks = [...mocksParticipationEmpty, ...mocksUpsertNew];
        const { result } = renderUseParticipation(combinedMocks);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        let upsertResult;
        await act(async () => {
            upsertResult = await result.current.upsertParticipation({
                userId: '1',
                eventId: '1',
                deposit: 200,
            });
        });

        expect(upsertResult).toEqual({ success: true, result: expect.any(Object) });
        expect(Alert.alert).toHaveBeenCalledWith('Success', 'You have successfully joined this event');
    });

    it('should update existing participation successfully', async () => {
        const combinedMocks = [...mocksParticipationSuccess, ...mocksUpsertUpdate];
        const { result } = renderUseParticipation(combinedMocks);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        let upsertResult;
        await act(async () => {
            upsertResult = await result.current.upsertParticipation({
                userId: '1',
                eventId: '1',
                deposit: 300,
            });
        });

        expect(upsertResult).toEqual({ success: true, result: expect.any(Object) });
        // Should not show success alert for updates (only for new participations)
        expect(Alert.alert).not.toHaveBeenCalledWith('Success', expect.any(String));
    });

    it('should handle missing userId in upsert', async () => {
        const { result } = renderUseParticipation(mocksParticipationEmpty);

        let upsertResult;
        await act(async () => {
            upsertResult = await result.current.upsertParticipation({
                userId: '',
                eventId: '1',
                deposit: 200,
            });
        });

        expect(upsertResult).toEqual({ success: false });
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'User is required');
    });

    it('should handle missing eventId in upsert', async () => {
        const { result } = renderUseParticipation(mocksParticipationEmpty);

        let upsertResult;
        await act(async () => {
            upsertResult = await result.current.upsertParticipation({
                userId: '1',
                eventId: '',
                deposit: 200,
            });
        });

        expect(upsertResult).toEqual({ success: false });
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Event is required');
    });

    it('should handle invalid deposit amount', async () => {
        const { result } = renderUseParticipation(mocksParticipationEmpty);

        let upsertResult;
        await act(async () => {
            upsertResult = await result.current.upsertParticipation({
                userId: '1',
                eventId: '1',
                deposit: 0,
            });
        });

        expect(upsertResult).toEqual({ success: false });
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid positive deposit amount');
    });

    it('should handle NaN deposit amount', async () => {
        const { result } = renderUseParticipation(mocksParticipationEmpty);

        let upsertResult;
        await act(async () => {
            upsertResult = await result.current.upsertParticipation({
                userId: '1',
                eventId: '1',
                deposit: NaN,
            });
        });

        expect(upsertResult).toEqual({ success: false });
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid positive deposit amount');
    });

    it('should handle negative deposit amount', async () => {
        const { result } = renderUseParticipation(mocksParticipationEmpty);

        let upsertResult;
        await act(async () => {
            upsertResult = await result.current.upsertParticipation({
                userId: '1',
                eventId: '1',
                deposit: -100,
            });
        });

        expect(upsertResult).toEqual({ success: false });
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid positive deposit amount');
    });

    it('should handle upsert mutation error', async () => {
        const combinedMocks = [...mocksParticipationEmpty, ...mocksUpsertError];
        const { result } = renderUseParticipation(combinedMocks);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        let upsertResult;
        await act(async () => {
            upsertResult = await result.current.upsertParticipation({
                userId: '1',
                eventId: '1',
                deposit: 200,
            });
        });

        expect(upsertResult).toEqual({ success: false });
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Insufficient balance');
    });

    it('should show loading state during upsert', async () => {
        const combinedMocks = [...mocksParticipationEmpty, ...mocksUpsertNew];
        const { result } = renderUseParticipation(combinedMocks);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        act(() => {
            result.current.upsertParticipation({
                userId: '1',
                eventId: '1',
                deposit: 200,
            });
        });

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
    });

    it('should handle missing upsert response data', async () => {
        const mocksNoData = [
            {
                request: {
                    query: UPSERT_PARTICIPATION,
                    variables: {
                        input: {
                            userId: 1,
                            eventId: 1,
                            deposit: 200,
                        },
                    },
                },
                result: {
                    data: null,
                },
            },
        ];

        const combinedMocks = [...mocksParticipationEmpty, ...mocksNoData];
        const { result } = renderUseParticipation(combinedMocks);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        let upsertResult;
        await act(async () => {
            upsertResult = await result.current.upsertParticipation({
                userId: '1',
                eventId: '1',
                deposit: 200,
            });
        });

        expect(upsertResult).toEqual({ success: false });
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to upsert participation');
    });
}); 
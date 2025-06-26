import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing';
import { useEvents } from '@/lib/hooks/events/useEvents';
import { GET_EVENTS } from '@/lib/graphql';
import { mockEvent } from '../../../test-utils';

// mock for GET_EVENTS request
const mocksSuccess = [
    {
        request: {
            query: GET_EVENTS,
        },
        result: {
            data: {
                events: [
                    mockEvent,
                    {
                        ...mockEvent,
                        id: 2,
                        name: 'Second Event',
                        status: 'FINISHED',
                    }
                ]
            }
        }
    }
];

const mocksError = [
    {
        request: {
            query: GET_EVENTS,
        },
        error: {
            graphQLErrors: [{ message: 'Network error' }],
            networkError: null,
            message: 'Network error',
        },
    }
];

const mocksEmpty = [
    {
        request: {
            query: GET_EVENTS,
        },
        result: {
            data: {
                events: []
            }
        }
    }
];

// helper for rendering hook with MockedProvider
const renderUseEvents = (mocks: any[]) => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockedProvider mocks={mocks} addTypename={false}>
            {children}
        </MockedProvider>
    );

    return renderHook(() => useEvents(), { wrapper });
};

describe('useEvents', () => {
    it('should return initial state', () => {
        const { result } = renderUseEvents(mocksSuccess);

        expect(result.current.events).toEqual([]);
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBeNull();
    });

    it('should load events successfully', async () => {
        const { result } = renderUseEvents(mocksSuccess);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.events).toHaveLength(2);
        expect(result.current.events[0].name).toBe('Test Event');
        expect(result.current.events[1].name).toBe('Second Event');
        expect(result.current.error).toBeNull();
    });

    it('should handle network errors', async () => {
        const { result } = renderUseEvents(mocksError);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.events).toEqual([]);
        expect(result.current.error).toBe('Network error');
    });

    it('should return empty array when there are no events', async () => {
        const { result } = renderUseEvents(mocksEmpty);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.events).toEqual([]);
        expect(result.current.error).toBeNull();
    });

    it('should provide refetch function', () => {
        const { result } = renderUseEvents(mocksSuccess);

        expect(typeof result.current.refetch).toBe('function');
    });

    it('should have correct event structure', async () => {
        const { result } = renderUseEvents(mocksSuccess);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const event = result.current.events[0];

        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('name');
        expect(event).toHaveProperty('description');
        expect(event).toHaveProperty('status');
        expect(event).toHaveProperty('type');
        expect(event).toHaveProperty('bankAmount');
    });
}); 
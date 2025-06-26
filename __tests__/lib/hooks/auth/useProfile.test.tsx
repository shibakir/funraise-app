import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing';
import { useProfile } from '@/lib/hooks/auth/useProfile';
import { UPDATE_USER } from '@/lib/graphql';

// mock AuthContext
const mockUpdateUserData = jest.fn();
jest.mock('@/lib/context/AuthContext', () => ({
    useAuth: () => ({
        updateUserData: mockUpdateUserData,
    }),
}));

const mockUser = {
    id: 1,
    username: 'updated_user',
    email: 'updated@example.com',
    balance: 1500,
    image: 'https://example.com/new-avatar.jpg',
};

// successful update mock
const mocksSuccess = [
    {
        request: {
            query: UPDATE_USER,
            variables: {
                id: 1,
                input: {
                    username: 'new_username',
                    email: 'new@example.com',
                },
            },
        },
        result: {
            data: {
                updateUser: mockUser,
            },
        },
    },
];

// GraphQL error mock
const mocksError = [
    {
        request: {
            query: UPDATE_USER,
            variables: {
                id: 1,
                input: {
                    username: 'invalid_username',
                },
            },
        },
        error: {
            graphQLErrors: [{ message: 'Username already exists' }],
            networkError: null,
            message: 'Username already exists',
        },
    },
];

// network error mock
const mocksNetworkError = [
    {
        request: {
            query: UPDATE_USER,
            variables: {
                id: 1,
                input: {
                    username: 'test',
                },
            },
        },
        networkError: new Error('Network error'),
    },
];

const renderUseProfile = (mocks: any[]) => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockedProvider mocks={mocks} addTypename={false}>
            {children}
        </MockedProvider>
    );

    return renderHook(() => useProfile(), { wrapper });
};

describe('useProfile', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return initial state', () => {
        const { result } = renderUseProfile([]);

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(typeof result.current.updateProfile).toBe('function');
    });

    it('should update profile successfully', async () => {
        const { result } = renderUseProfile(mocksSuccess);

        let updateResult;
        await act(async () => {
            updateResult = await result.current.updateProfile(1, {
                username: 'new_username',
                email: 'new@example.com',
            });
        });

        expect(updateResult).toEqual(mockUser);
        expect(mockUpdateUserData).toHaveBeenCalledWith({
            username: 'updated_user',
            email: 'updated@example.com',
            balance: 1500,
            image: 'https://example.com/new-avatar.jpg',
        });
    });

    it('should handle GraphQL errors', async () => {
        const { result } = renderUseProfile(mocksError);

        await act(async () => {
            try {
                await result.current.updateProfile(1, {
                    username: 'invalid_username',
                });
            } catch (error) {
                // The error should contain the GraphQL error message
                expect(error.message).toContain('Username already exists');
            }
        });

        expect(result.current.error).toContain('Username already exists');
        expect(mockUpdateUserData).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
        const { result } = renderUseProfile(mocksNetworkError);

        await act(async () => {
            try {
                await result.current.updateProfile(1, {
                    username: 'test',
                });
            } catch (error) {
                expect(error.message).toBe('Network error. Please check your connection.');
            }
        });

        expect(result.current.error).toBe('Network error. Please check your connection.');
    });

    it('should show loading state during update', async () => {
        const { result } = renderUseProfile(mocksSuccess);

        let updatePromise;
        act(() => {
            updatePromise = result.current.updateProfile(1, { username: 'new_username' });
        });

        expect(result.current.loading).toBe(true);

        await act(async () => {
            await updatePromise;
        });

        expect(result.current.loading).toBe(false);
    });

    it('should handle missing data response', async () => {
        const mocksNoData = [
            {
                request: {
                    query: UPDATE_USER,
                    variables: {
                        id: 1,
                        input: { username: 'test' },
                    },
                },
                result: {
                    data: null,
                },
            },
        ];

        const { result } = renderUseProfile(mocksNoData);

        await act(async () => {
            try {
                await result.current.updateProfile(1, { username: 'test' });
            } catch (error) {
                expect(error.message).toBe('No data returned from update');
            }
        });
    });

    it('should update profile with all fields', async () => {
        const mocksAllFields = [
            {
                request: {
                    query: UPDATE_USER,
                    variables: {
                        id: 1,
                        input: {
                            username: 'new_username',
                            email: 'new@example.com',
                            currentPassword: 'old_password',
                            newPassword: 'new_password',
                        },
                    },
                },
                result: {
                    data: {
                        updateUser: mockUser,
                    },
                },
            },
        ];

        const { result } = renderUseProfile(mocksAllFields);

        await act(async () => {
            await result.current.updateProfile(1, {
                username: 'new_username',
                email: 'new@example.com',
                currentPassword: 'old_password',
                newPassword: 'new_password',
            });
        });

        expect(mockUpdateUserData).toHaveBeenCalledWith({
            username: 'updated_user',
            email: 'updated@example.com',
            balance: 1500,
            image: 'https://example.com/new-avatar.jpg',
        });
    });
}); 
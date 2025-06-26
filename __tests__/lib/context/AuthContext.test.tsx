import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth, User } from '@/lib/context/AuthContext';
import AuthService from '@/services/AuthService';
import { TokenManager } from '@/lib/utils/TokenManager';
import { router } from 'expo-router';
import { Alert } from 'react-native';

// Mock all dependencies
jest.mock('@/services/AuthService');
jest.mock('@/lib/utils/TokenManager');
jest.mock('expo-router', () => ({
    router: {
        replace: jest.fn(),
    },
}));
jest.mock('react-native', () => ({
    Alert: {
        alert: jest.fn(),
    },
}));
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));
jest.mock('expo-auth-session', () => ({
    makeRedirectUri: jest.fn(),
    AuthRequest: jest.fn(),
    ResponseType: {
        Code: 'code',
    },
}));
jest.mock('@/lib/graphql/client', () => ({
    apolloClient: {
        mutate: jest.fn(),
        clearStore: jest.fn(),
    },
}));

const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;
const mockTokenManager = TokenManager as jest.Mocked<typeof TokenManager>;
const mockRouter = router as jest.Mocked<typeof router>;
const mockAlert = Alert as jest.Mocked<typeof Alert>;

const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    balance: 1000,
    image: 'https://example.com/avatar.jpg',
    isActivated: true,
    createdAt: '2023-01-01T00:00:00Z',
    accounts: [
        {
            id: '123',
            provider: 'discord',
            providerUsername: 'TestUser#1234',
        },
    ],
};

const renderUseAuth = () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
    );
    return renderHook(() => useAuth(), { wrapper });
};

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Default mocks
        mockTokenManager.isAuthenticated.mockResolvedValue(false);
        mockTokenManager.getCurrentUser.mockResolvedValue(null);
        mockTokenManager.onTokensCleared.mockImplementation(() => {});
        mockTokenManager.removeTokensClearedCallback.mockImplementation(() => {});
        mockTokenManager.updateStoredUser.mockResolvedValue();
    });

    describe('useAuth hook', () => {
        it('should throw error when used outside AuthProvider', () => {
            // Suppress console.error for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            expect(() => {
                renderHook(() => useAuth());
            }).toThrow('useAuth must be used within AuthProvider');

            consoleSpy.mockRestore();
        });
    });

    describe('AuthProvider initialization', () => {
        it('should initialize with default state', async () => {
            const { result } = renderUseAuth();

            expect(result.current.user).toBeNull();
            expect(result.current.isAuthenticated).toBe(false);
            expect(result.current.error).toBeNull();
            expect(result.current.isLoading).toBe(true);

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
        });

        it('should load authenticated user on initialization', async () => {
            mockTokenManager.isAuthenticated.mockResolvedValue(true);
            mockTokenManager.getCurrentUser.mockResolvedValue(mockUser);

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.user).toEqual(mockUser);
            expect(result.current.isAuthenticated).toBe(true);
        });

        it('should handle initialization errors gracefully', async () => {
            mockTokenManager.isAuthenticated.mockRejectedValue(new Error('Token error'));

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.user).toBeNull();
            expect(result.current.isAuthenticated).toBe(false);
        });

        it('should handle token cleared events', async () => {
            mockTokenManager.isAuthenticated.mockResolvedValue(true);
            mockTokenManager.getCurrentUser.mockResolvedValue(mockUser);

            let tokensClearedCallback: (() => void) | undefined;
            mockTokenManager.onTokensCleared.mockImplementation((callback) => {
                tokensClearedCallback = callback;
            });

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.user).toEqual(mockUser);
            });

            // Simulate tokens being cleared
            act(() => {
                tokensClearedCallback?.();
            });

            expect(result.current.user).toBeNull();
            expect(result.current.error).toBeNull();
        });
    });

    describe('login', () => {
        it('should login successfully', async () => {
            mockAuthService.login.mockResolvedValue({
                data: { user: mockUser },
            });

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                await result.current.login('test@example.com', 'password123');
            });

            expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
            expect(result.current.user).toEqual(mockUser);
            expect(result.current.isAuthenticated).toBe(true);
            expect(mockRouter.replace).toHaveBeenCalledWith('/(app)/(tabs)/home');
        });

        it('should handle login errors', async () => {
            const errorMessage = 'Invalid credentials';
            mockAuthService.login.mockRejectedValue(new Error(errorMessage));

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                try {
                    await result.current.login('test@example.com', 'wrongpassword');
                } catch (error: any) {
                    expect(error.message).toBe(errorMessage);
                }
            });

            expect(result.current.error).toBe(errorMessage);
            expect(result.current.user).toBeNull();
        });
    });

    describe('register', () => {
        it('should register successfully', async () => {
            mockAuthService.registration.mockResolvedValue({
                data: { user: mockUser },
            });

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                await result.current.register('testuser', 'test@example.com', 'password123');
            });

            expect(mockAuthService.registration).toHaveBeenCalledWith(
                'test@example.com',
                'testuser',
                'password123'
            );
            expect(result.current.user).toEqual(mockUser);
            expect(result.current.isAuthenticated).toBe(true);
        });

        it('should handle registration errors', async () => {
            const errorMessage = 'Email already exists';
            mockAuthService.registration.mockRejectedValue(new Error(errorMessage));

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                try {
                    await result.current.register('testuser', 'test@example.com', 'password123');
                } catch (error: any) {
                    expect(error.message).toBe(errorMessage);
                }
            });

            expect(result.current.error).toBe(errorMessage);
            expect(result.current.user).toBeNull();
        });
    });

    describe('loginWithDiscord', () => {
        it('should login with Discord successfully', async () => {
            mockAuthService.loginWithDiscord.mockResolvedValue({
                data: { user: mockUser },
            });

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                await result.current.loginWithDiscord();
            });

            expect(mockAuthService.loginWithDiscord).toHaveBeenCalled();
            expect(result.current.user).toEqual(mockUser);
            expect(mockRouter.replace).toHaveBeenCalledWith('/(app)/(tabs)/home');
        });

        it('should handle Discord login errors', async () => {
            const errorMessage = 'Discord login failed';
            mockAuthService.loginWithDiscord.mockRejectedValue(new Error(errorMessage));

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                try {
                    await result.current.loginWithDiscord();
                } catch (error: any) {
                    expect(error.message).toBe(errorMessage);
                }
            });

            expect(result.current.error).toBe(errorMessage);
        });
    });

    describe('linkDiscord', () => {
        it('should link Discord account successfully', async () => {
            const updatedUser = { ...mockUser, accounts: [...mockUser.accounts!, { id: '456', provider: 'discord' }] };

            // First mock login to set user
            mockAuthService.login.mockResolvedValue({
                data: { user: mockUser as any },
            });

            mockAuthService.linkDiscordAccount.mockResolvedValue({
                success: true,
                message: 'Discord account linked successfully',
                user: updatedUser as any,
            });

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Login first to set user
            await act(async () => {
                await result.current.login('test@example.com', 'password123');
            });

            // Clear login mock calls before testing linkDiscord
            jest.clearAllMocks();

            await act(async () => {
                await result.current.linkDiscord();
            });

            expect(mockAuthService.linkDiscordAccount).toHaveBeenCalled();
            expect(result.current.user).toEqual(updatedUser);
            expect(mockAlert.alert).toHaveBeenCalledWith('alerts.success', 'Discord account linked successfully');
        });

        it('should handle Discord linking business logic errors', async () => {
            // Setup user first
            mockAuthService.login.mockResolvedValue({
                data: { user: mockUser },
            });

            mockAuthService.linkDiscordAccount.mockResolvedValue({
                success: false,
                message: 'Discord account already linked to another user',
            });

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Login first to set user
            await act(async () => {
                await result.current.login('test@example.com', 'password123');
            });

            jest.clearAllMocks();

            await act(async () => {
                await result.current.linkDiscord();
            });

            expect(mockAlert.alert).toHaveBeenCalledWith('auth.error', 'Discord account already linked to another user');
        });

        it('should handle Discord linking technical errors', async () => {
            const errorMessage = 'Network error';

            // Setup user first
            mockAuthService.login.mockResolvedValue({
                data: { user: mockUser },
            });

            mockAuthService.linkDiscordAccount.mockRejectedValue(new Error(errorMessage));

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Login first to set user
            await act(async () => {
                await result.current.login('test@example.com', 'password123');
            });

            jest.clearAllMocks();

            await act(async () => {
                await result.current.linkDiscord();
            });

            expect(result.current.error).toBe(errorMessage);
            expect(mockAlert.alert).toHaveBeenCalledWith('auth.error', 'alerts.technicalError');
        });

        it('should throw error when user is not authenticated', async () => {
            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                await result.current.linkDiscord();
            });

            expect(result.current.error).toBe('You must be logged in to link Discord account');
        });
    });

    describe('logout', () => {
        it('should logout successfully', async () => {
            mockAuthService.logout.mockResolvedValue();

            // Login first
            mockAuthService.login.mockResolvedValue({
                data: { user: mockUser },
            });

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Login first to set user
            await act(async () => {
                await result.current.login('test@example.com', 'password123');
            });

            jest.clearAllMocks();

            await act(async () => {
                await result.current.logout();
            });

            expect(mockAuthService.logout).toHaveBeenCalled();
            expect(result.current.user).toBeNull();
            expect(result.current.isAuthenticated).toBe(false);
        });

        it('should handle logout errors gracefully', async () => {
            mockAuthService.logout.mockRejectedValue(new Error('Logout failed'));

            // Login first
            mockAuthService.login.mockResolvedValue({
                data: { user: mockUser },
            });

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Login first to set user
            await act(async () => {
                await result.current.login('test@example.com', 'password123');
            });

            jest.clearAllMocks();

            await act(async () => {
                await result.current.logout();
            });

            expect(result.current.user).toBeNull();
            expect(result.current.error).toBe('Error during logout');
        });
    });

    describe('updateProfile', () => {
        it('should handle updateProfile', async () => {
            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                await result.current.updateProfile({
                    username: 'newusername',
                    email: 'newemail@example.com',
                });
            });

            expect(result.current.error).toBeNull();
        });
    });

    describe('updateUserData', () => {
        it('should update user data and store it', async () => {
            // Login first to set user
            mockAuthService.login.mockResolvedValue({
                data: { user: mockUser },
            });

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Login first to set user
            await act(async () => {
                await result.current.login('test@example.com', 'password123');
            });

            const updatedData = { username: 'newusername', balance: 2000 };

            await act(async () => {
                await result.current.updateUserData(updatedData);
            });

            expect(result.current.user).toEqual({ ...mockUser, ...updatedData });
            expect(mockTokenManager.updateStoredUser).toHaveBeenCalledWith({ ...mockUser, ...updatedData });
        });

        it('should not update when user is null', async () => {
            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                await result.current.updateUserData({ username: 'newusername' });
            });

            expect(result.current.user).toBeNull();
            expect(mockTokenManager.updateStoredUser).not.toHaveBeenCalled();
        });
    });

    describe('Edge cases and additional scenarios', () => {
        it('should handle login with undefined user in response', async () => {
            mockAuthService.login.mockResolvedValue({
                data: { user: undefined } as any,
            });

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                try {
                    await result.current.login('test@example.com', 'password123');
                } catch (error: any) {
                    expect(error.message).toBe('Email or password is incorrect');
                }
            });

            expect(result.current.user).toBeNull();
        });

        it('should handle registration with undefined user in response', async () => {
            mockAuthService.registration.mockResolvedValue({
                data: { user: undefined } as any,
            });

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                try {
                    await result.current.register('testuser', 'test@example.com', 'password123');
                } catch (error: any) {
                    expect(error.message).toBe('Registration failed. Please check your data.');
                }
            });

            expect(result.current.user).toBeNull();
        });

        it('should handle login with network error', async () => {
            mockAuthService.login.mockRejectedValue({ message: undefined });

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                try {
                    await result.current.login('test@example.com', 'password123');
                } catch (error: any) {
                    expect(error.message).toBe('Email or password is incorrect');
                }
            });

            expect(result.current.error).toBe('Email or password is incorrect');
        });

        it('should handle registration with network error', async () => {
            mockAuthService.registration.mockRejectedValue({ message: undefined });

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                try {
                    await result.current.register('testuser', 'test@example.com', 'password123');
                } catch (error: any) {
                    expect(error.message).toBe('Registration failed. Please check your data.');
                }
            });

            expect(result.current.error).toBe('Registration failed. Please check your data.');
        });

        it('should handle Discord login with undefined user in response', async () => {
            mockAuthService.loginWithDiscord.mockResolvedValue({
                data: { user: undefined } as any,
            });

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                try {
                    await result.current.loginWithDiscord();
                } catch (error: any) {
                    expect(error.message).toBe('Discord login failed');
                }
            });

            expect(result.current.user).toBeNull();
        });

        it('should handle Discord login with network error', async () => {
            mockAuthService.loginWithDiscord.mockRejectedValue({ message: undefined });

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                try {
                    await result.current.loginWithDiscord();
                } catch (error: any) {
                    expect(error.message).toBe('Discord login failed');
                }
            });

            expect(result.current.error).toBe('Discord login failed');
        });

        it('should handle linkDiscord when linkResult is undefined', async () => {
            // Login first
            mockAuthService.login.mockResolvedValue({
                data: { user: mockUser },
            });

            mockAuthService.linkDiscordAccount.mockResolvedValue(undefined as any);

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Login first to set user
            await act(async () => {
                await result.current.login('test@example.com', 'password123');
            });

            jest.clearAllMocks();

            await act(async () => {
                await result.current.linkDiscord();
            });

            expect(result.current.error).toBe('Failed to link Discord account');
        });

        it('should handle multiple rapid login attempts', async () => {
            mockAuthService.login.mockResolvedValue({
                data: { user: mockUser },
            });

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Make multiple rapid login calls
            await act(async () => {
                const promise1 = result.current.login('test1@example.com', 'password1');
                const promise2 = result.current.login('test2@example.com', 'password2');

                await Promise.all([promise1, promise2]);
            });

            expect(mockAuthService.login).toHaveBeenCalledTimes(2);
            expect(result.current.user).toEqual(mockUser);
        });

        it('should handle TokenManager.updateStoredUser failure gracefully', async () => {
            mockTokenManager.updateStoredUser.mockRejectedValue(new Error('Storage error'));
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            // Login first
            mockAuthService.login.mockResolvedValue({
                data: { user: mockUser },
            });

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Login first to set user
            await act(async () => {
                await result.current.login('test@example.com', 'password123');
            });

            const updatedData = { username: 'newusername', balance: 2000 };

            await act(async () => {
                await result.current.updateUserData(updatedData);
            });

            // User state should still be updated even if storage fails
            expect(result.current.user).toEqual({ ...mockUser, ...updatedData });

            consoleSpy.mockRestore();
        });

        it('should clear error when starting new login after failed login', async () => {
            // First login fails
            mockAuthService.login.mockRejectedValueOnce(new Error('Invalid credentials'));

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // First failed login
            await act(async () => {
                try {
                    await result.current.login('wrong@example.com', 'wrongpassword');
                } catch (error: any) {
                    // Expected error
                }
            });

            expect(result.current.error).toBe('Invalid credentials');

            // Second successful login should clear error
            mockAuthService.login.mockResolvedValue({
                data: { user: mockUser },
            });

            await act(async () => {
                await result.current.login('test@example.com', 'password123');
            });

            expect(result.current.error).toBeNull();
            expect(result.current.user).toEqual(mockUser);
        });

        it('should handle cleanup on component unmount', async () => {
            mockTokenManager.isAuthenticated.mockResolvedValue(true);
            mockTokenManager.getCurrentUser.mockResolvedValue(mockUser);

            let removeTokensClearedCallback: jest.Mock;
            mockTokenManager.removeTokensClearedCallback.mockImplementation((callback) => {
                removeTokensClearedCallback = callback;
            });

            const { result, unmount } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.user).toEqual(mockUser);
            });

            // Unmount component
            unmount();

            // Should have called cleanup
            expect(mockTokenManager.removeTokensClearedCallback).toHaveBeenCalled();
        });

        it('should handle updateProfile error without message', async () => {
            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Mock updateProfile to throw error without message
            const originalUpdateProfile = result.current.updateProfile;
            const mockUpdateProfile = jest.fn().mockRejectedValue({});

            await act(async () => {
                try {
                    await mockUpdateProfile({
                        username: 'newusername',
                    });
                } catch (error: any) {
                    expect(error.message).toBe('Error updating profile');
                }
            });
        });

        it('should handle isAuthenticated computed property correctly', async () => {
            // Login to set user
            mockAuthService.login.mockResolvedValue({
                data: { user: mockUser },
            });

            const { result } = renderUseAuth();

            // Initially not authenticated
            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(false);
            });

            // Set user - should be authenticated
            await act(async () => {
                await result.current.login('test@example.com', 'password123');
            });

            expect(result.current.isAuthenticated).toBe(true);

            // Clear user - should not be authenticated
            await act(async () => {
                await result.current.logout();
            });

            expect(result.current.isAuthenticated).toBe(false);
        });

        it('should handle initialization when getCurrentUser returns null but isAuthenticated is true', async () => {
            mockTokenManager.isAuthenticated.mockResolvedValue(true);
            mockTokenManager.getCurrentUser.mockResolvedValue(null);

            const { result } = renderUseAuth();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.user).toBeNull();
            expect(result.current.isAuthenticated).toBe(false);
        });
    });
}); 
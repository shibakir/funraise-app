import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '@/services/AuthService';
import { TokenManager } from '@/lib/utils/TokenManager';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

/**
 * User interface representing the authenticated user data structure.
 * Contains essential user information and linked accounts.
 */
export interface User {
    /** Unique user identifier */
    id: number;
    /** User's email address */
    email: string;
    /** User's display name */
    username: string;
    /** User's current balance */
    balance: number;
    /** Optional profile image URL */
    image?: string;
    /** Whether the user's account is activated */
    isActivated?: boolean;
    /** Account creation timestamp */
    createdAt?: string;
    /** Array of linked external accounts (Discord, etc.) */
    accounts?: Array<{
        id: string;
        provider: string;
        providerUsername?: string;
        providerAvatar?: string;
        providerEmail?: string;
        providerDiscriminator?: string;
    }>;
}

/**
 * Interface for profile update data.
 * Defines optional fields that can be updated in user profile.
 */
interface UpdateProfileData {
    /** New username */
    username?: string;
    /** New email address */
    email?: string;
    /** Current password for verification */
    currentPassword?: string;
    /** New password to set */
    newPassword?: string;
}

/**
 * Authentication context interface defining all available auth-related functionality.
 * Provides state management and operations for user authentication.
 */
interface AuthContextType {
    /** Current authenticated user or null if not authenticated */
    user: User | null;
    /** Loading state for async operations */
    isLoading: boolean;
    /** Current error message or null if no error */
    error: string | null;
    /** Computed boolean indicating if user is authenticated */
    isAuthenticated: boolean;
    /** Login function with email and password */
    login: (email: string, password: string) => Promise<void>;
    /** Register new user account */
    register: (username: string, email: string, password: string) => Promise<void>;
    /** Login using Discord OAuth */
    loginWithDiscord: () => Promise<void>;
    /** Link Discord account to existing user */
    linkDiscord: () => Promise<void>;
    /** Logout current user */
    logout: () => Promise<void>;
    /** Update user profile information */
    updateProfile: (data: UpdateProfileData) => Promise<void>;
    /** Update user data in local state and storage */
    updateUserData: (userData: Partial<User>) => Promise<void>;
}

// create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication provider component that manages global authentication state.
 * Provides authentication context to all child components and handles
 * token management, user state persistence, and authentication operations.
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to wrap with auth context
 * @returns {JSX.Element} Provider component with authentication context
 */
export function AuthProvider({ children }: { children: ReactNode }) {

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();
    
    // Computed property to determine if user is authenticated
    const isAuthenticated = !!user;

    // check authentication status on app load
    useEffect(() => {
        const loadAuthState = async () => {
            try {
                const isAuth = await TokenManager.isAuthenticated();
                
                if (isAuth) {
                    const storedUser = await TokenManager.getCurrentUser();

                    if (storedUser) {
                        setUser(storedUser);
                    }
                }
            } catch (error) {
                console.error('Error loading auth state:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAuthState();

        // Subscribe to token cleared events
        const handleTokensCleared = () => {
            console.log('AuthContext: Tokens were cleared, performing local logout');
            setUser(null);
            setError(null);
        };

        TokenManager.onTokensCleared(handleTokensCleared);

        // Cleanup subscription on unmount
        return () => {
            TokenManager.removeTokensClearedCallback(handleTokensCleared);
        };
    }, []);

    /**
     * Authenticates user with email and password credentials.
     * Redirects to home screen on successful login.
     * 
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @throws {Error} When login fails due to invalid credentials or network issues
     */
    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await AuthService.login(email, password);
            const { user } = response.data;

            // update state
            setUser(user);

            router.replace('/(app)/(tabs)/home');
            //console.log('Login successful');

        } catch (error: any) {
            const message = error.message || 'Email or password is incorrect';
            setError(message);
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Registers a new user account with provided credentials.
     * Automatically authenticates the user after successful registration.
     * 
     * @param {string} username - Desired username
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @throws {Error} When registration fails due to validation errors or duplicate accounts
     */
    const register = async (username: string, email: string, password: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await AuthService.registration(email, username, password);
            const { user } = response.data;

            // update state
            setUser(user);

            //console.log('Registration successful');
        } catch (error: any) {
            const message = error.message || 'Registration failed. Please check your data.';
            setError(message);
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Updates user profile information.
     * Currently placeholder implementation for future profile update functionality.
     * 
     * @param {UpdateProfileData} data - Profile data to update
     * @throws {Error} When profile update fails
     */
    const updateProfile = async (data: UpdateProfileData) => {
        try {
            setIsLoading(true);
            setError(null);
            
            //console.log('Profile update requested:', data);
        } catch (error: any) {
            const message = error.message || 'Error updating profile';
            setError(message);
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Updates user data in local state and secure storage.
     * Merges provided data with existing user data.
     * 
     * @param {Partial<User>} userData - Partial user data to update
     */
    const updateUserData = async (userData: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            // Update stored user data using TokenManager
            await TokenManager.updateStoredUser(updatedUser);
        }
    };

    /**
     * Initiates Discord OAuth login flow.
     * Opens Discord authorization, handles callback, and authenticates user.
     * Redirects to home screen on successful login.
     * 
     * @throws {Error} When Discord login fails or is cancelled
     */
    const loginWithDiscord = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await AuthService.loginWithDiscord();
            const { user } = response.data;

            // update state
            setUser(user);

            router.replace('/(app)/(tabs)/home');
            //console.log('Discord login successful');

        } catch (error: any) {
            const message = error.message || 'Discord login failed';
            setError(message);
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Links a Discord account to the currently authenticated user.
     * Shows success/error alerts based on the result.
     * Updates user data if linking is successful.
     * 
     * @throws {Error} When user is not authenticated or technical errors occur
     */
    const linkDiscord = async () => {
        try {
            setIsLoading(true);
            setError(null);

            if (!user) {
                throw new Error('You must be logged in to link Discord account');
            }

            const linkResult = await AuthService.linkDiscordAccount();

            if (linkResult.success) {
                const updatedUser = linkResult.user;

                if (updatedUser) {
                    // Update user in state
                    setUser(updatedUser);
                }

                //console.log('Discord account linked successfully');
                Alert.alert(t('alerts.success'), linkResult.message);
            } else {
                //console.log('Discord linking failed:', linkResult.message);
                Alert.alert(t('auth.error'), linkResult.message);
                return; // Don't throw error, just return
            }

        } catch (error: any) {
            // Only show alert for network/technical errors, not business logic errors
            const message = error.message || 'Failed to link Discord account';
            //console.error('Discord linking technical error:', message);
            setError(message);
            Alert.alert(t('auth.error'), t('alerts.technicalError'));
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Logs out the current user by clearing tokens and user state.
     * Handles errors gracefully and ensures local state is cleared.
     */
    const logout = async () => {
        try {
            setIsLoading(true);

            await AuthService.logout();

            // update state
            setUser(null);

            //console.log('Logout successful');
        } catch (error) {
            console.error('Error during logout:', error);
            setError('Error during logout');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                error,
                isAuthenticated,
                login,
                register,
                loginWithDiscord,
                logout,
                updateProfile,
                updateUserData,
                linkDiscord
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Custom hook to access the authentication context.
 * Must be used within an AuthProvider component.
 * 
 * @returns {AuthContextType} Authentication context with user state and auth operations
 * @throws {Error} When used outside of AuthProvider
 */
export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
} 
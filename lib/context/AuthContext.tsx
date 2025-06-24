import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '@/services/AuthService';
import { TokenManager } from '@/lib/utils/TokenManager';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

// user interface
export interface User {
    id: number;
    email: string;
    username: string;
    balance: number;
    image?: string;
    isActivated?: boolean;
    createdAt?: string;
    accounts?: Array<{
        id: string;
        provider: string;
        providerUsername?: string;
        providerAvatar?: string;
        providerEmail?: string;
        providerDiscriminator?: string;
    }>;
}

// update profile interface
interface UpdateProfileData {
    username?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
}

// auth context interface
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    loginWithDiscord: () => Promise<void>;
    linkDiscord: () => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: UpdateProfileData) => Promise<void>;
    updateUserData: (userData: Partial<User>) => Promise<void>;
}

// create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// auth provider
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

    // login function
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

    // register function
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

    // update profile function
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

    // update user data function
    const updateUserData = async (userData: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            // Update stored user data using TokenManager
            await TokenManager.updateStoredUser(updatedUser);
        }
    };

    // Discord OAuth login function
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

    // Link Discord account to existing user
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

    // logout function
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

// auth context hook
export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
} 
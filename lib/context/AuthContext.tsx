import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';
import AuthService from '@/services/AuthService';
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
    token: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    loginWithDiscord: () => Promise<void>;
    linkDiscord: () => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: UpdateProfileData) => Promise<void>;
    updateUserData: (userData: Partial<User>) => void;
}

// create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// auth provider
export function AuthProvider({ children }: { children: ReactNode }) {

    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();
    
    // Computed property to determine if user is authenticated
    const isAuthenticated = !!user && !!token;

    // check token presence on app load
    useEffect(() => {
        const loadToken = async () => {
            try {
                const storedToken = await SecureStore.getItemAsync('authToken');
                const storedUser = await SecureStore.getItemAsync('authUser');

                if (storedToken && storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setToken(storedToken);
                    setUser(parsedUser);

                    //console.log('Loaded stored auth data from SecureStore');
                } else {
                    //console.log('No stored auth data found in SecureStore');
                }
            } catch (error) {
                console.error('Error loading auth data from SecureStore:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadToken();
    }, []);

    // login function
    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await AuthService.login(email, password);
            const { accessToken, refreshToken, user } = response.data;

            const typedUser: User = {
                ...user,
                id: typeof user.id === 'string' ? parseInt(user.id) : user.id
            };

            // save data to SecureStore
            await Promise.all([
                SecureStore.setItemAsync('authToken', accessToken),
                SecureStore.setItemAsync('refreshToken', refreshToken),
                SecureStore.setItemAsync('authUser', JSON.stringify(typedUser))
            ]);

            // update state
            setUser(typedUser);
            setToken(accessToken);

            router.replace('/(app)/(tabs)/home');
            //console.log('Login successful, saved auth data to SecureStore');

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
            const { accessToken, refreshToken, user } = response.data;

            const typedUser: User = {
                ...user,
                id: typeof user.id === 'string' ? parseInt(user.id) : user.id
            };

            // save data to SecureStore
            await Promise.all([
                SecureStore.setItemAsync('authToken', accessToken),
                SecureStore.setItemAsync('refreshToken', refreshToken),
                SecureStore.setItemAsync('authUser', JSON.stringify(typedUser))
            ]);

            // update state
            setUser(typedUser);
            setToken(accessToken);

            //router.replace('/(app)/(tabs)/home');
            //console.log('Registration successful, saved auth data to SecureStore');
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
            
            if (!user) {
                throw new Error('User is not authenticated');
            }

            // TODO: Реализовать GraphQL мутацию для обновления профиля
            console.log('Profile update requested:', data);
            
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
            // Update stored user data in SecureStore
            await SecureStore.setItemAsync('authUser', JSON.stringify(updatedUser));
        }
    };

    // Discord OAuth login function
    const loginWithDiscord = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Discord OAuth configuration
            const discovery = {
                authorizationEndpoint: 'https://discord.com/api/oauth2/authorize',
                tokenEndpoint: 'https://discord.com/api/oauth2/token',
            };

            const redirectUri = AuthSession.makeRedirectUri({
                scheme: 'funraise',
            });

            const request = new AuthSession.AuthRequest({
                clientId: process.env.EXPO_PUBLIC_DISCORD_CLIENT_ID!,
                scopes: ['identify', 'email', 'openid'],
                responseType: AuthSession.ResponseType.Code,
                redirectUri,
                usePKCE: true,
            });

            const result = await request.promptAsync(discovery);
            //console.log('OAuth result:', result);

            if (result.type === 'success' && result.params.code) {
                //console.log('Got authorization code:', result.params.code);
                //console.log('Code verifier:', request.codeVerifier);
                
                const response = await AuthService.discordAuthCode(
                    result.params.code,
                    redirectUri,
                    request.codeVerifier! // Передаём code verifier
                );
                const { accessToken, refreshToken, user } = response.data;

                const typedUser: User = {
                    ...user,
                    id: typeof user.id === 'string' ? parseInt(user.id) : user.id
                };

                // save data to SecureStore
                await Promise.all([
                    SecureStore.setItemAsync('authToken', accessToken),
                    SecureStore.setItemAsync('refreshToken', refreshToken),
                    SecureStore.setItemAsync('authUser', JSON.stringify(typedUser))
                ]);

                // update state
                setUser(typedUser);
                setToken(accessToken);

                router.replace('/(app)/(tabs)/home');
                //console.log('Discord login successful, saved auth data to SecureStore');
            } else if (result.type === 'cancel') {
                //console.log('User cancelled Discord authorization');
                throw new Error('Discord authorization was cancelled');
            } else if (result.type === 'error') {
                //console.error('OAuth error:', result.error);
                throw new Error(result.error?.message || 'Discord authorization failed');
            } else {
                //console.error('Unexpected OAuth result:', result);
                throw new Error('Discord authorization failed with unexpected result');
            }

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

            // Discord OAuth configuration
            const discovery = {
                authorizationEndpoint: 'https://discord.com/api/oauth2/authorize',
                tokenEndpoint: 'https://discord.com/api/oauth2/token',
            };

            const redirectUri = AuthSession.makeRedirectUri({
                scheme: 'funraise',
            });

            const request = new AuthSession.AuthRequest({
                clientId: process.env.EXPO_PUBLIC_DISCORD_CLIENT_ID!,
                scopes: ['identify', 'email', 'openid'],
                responseType: AuthSession.ResponseType.Code,
                redirectUri,
                usePKCE: true,
            });

            // Perform OAuth flow
            const result = await request.promptAsync(discovery);
            //console.log('Link Discord - OAuth result:', result);

            if (result.type === 'success' && result.params.code) {
                //console.log('Link Discord - Got authorization code:', result.params.code);
                //console.log('Link Discord - Code verifier:', request.codeVerifier);
                
                // Send code to backend for linking
                const response = await AuthService.linkDiscordAccount(
                    result.params.code,
                    redirectUri,
                    request.codeVerifier!
                );

                const linkResult = response.data;

                if (linkResult.success) {
                    const updatedUser = linkResult.user;

                    // Convert user to the correct type
                    const typedUser: User = {
                        ...updatedUser,
                        id: typeof updatedUser.id === 'string' ? parseInt(updatedUser.id) : updatedUser.id
                    };

                    // Update user in state and SecureStore
                    setUser(typedUser);
                    await SecureStore.setItemAsync('authUser', JSON.stringify(typedUser));

                    //console.log('Discord account linked successfully');
                    Alert.alert(t('alerts.success'), linkResult.message);
                } else {
                    //console.log('Discord linking failed:', linkResult.message);
                    Alert.alert(t('auth.error'), linkResult.message);
                    return; // Don't throw error, just return
                }
            } else if (result.type === 'cancel') {
                //console.log('User cancelled Discord linking');
                throw new Error('Discord linking was cancelled');
            } else if (result.type === 'error') {
                //console.error('OAuth error:', result.error);
                throw new Error(result.error?.message || 'Discord linking failed');
            } else {
                //console.error('Unexpected OAuth result:', result);
                throw new Error('Discord linking failed with unexpected result');
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

            // remove data from SecureStore
            await Promise.all([
                SecureStore.deleteItemAsync('authToken'),
                SecureStore.deleteItemAsync('refreshToken'),
                SecureStore.deleteItemAsync('authUser')
            ]);

            // update state
            setUser(null);
            setToken(null);

            //console.log('Logout successful, removed auth data from SecureStore');
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
                token,
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
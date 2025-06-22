import { client } from "@/lib/graphql/client";
import { LOGIN_MUTATION, REGISTER_MUTATION, DISCORD_AUTH_MUTATION, DISCORD_AUTH_CODE_MUTATION, LINK_DISCORD_ACCOUNT_MUTATION, REFRESH_TOKEN_MUTATION, LOGOUT_MUTATION } from "@/lib/graphql/queries";
import { AuthResponse } from "@/lib/graphql/types";
import * as SecureStore from 'expo-secure-store';

export default class AuthService {

    static async login(email: string, password: string): Promise<{ data: AuthResponse }> {
        try {
            const response = await client.mutate({
                mutation: LOGIN_MUTATION,
                variables: { email, password }
            });

            if (response.data?.login) {
                // Save tokens to SecureStore
                await SecureStore.setItemAsync('accessToken', response.data.login.accessToken);
                await SecureStore.setItemAsync('refreshToken', response.data.login.refreshToken);
                await SecureStore.setItemAsync('user', JSON.stringify(response.data.login.user));

                return {
                    data: {
                        accessToken: response.data.login.accessToken,
                        refreshToken: response.data.login.refreshToken,
                        user: response.data.login.user
                    }
                };
            } else {
                throw new Error('Login failed');
            }
        } catch (error: any) {
            console.error('AuthService login error:', error);
            throw new Error(error.message || 'Login failed');
        }
    }

    static async registration(email: string, username: string, password: string): Promise<{ data: AuthResponse }> {
        try {
            const response = await client.mutate({
                mutation: REGISTER_MUTATION,
                variables: { username, email, password }
            });

            if (response.data?.register) {
                // Save tokens to SecureStore
                await SecureStore.setItemAsync('accessToken', response.data.register.accessToken);
                await SecureStore.setItemAsync('refreshToken', response.data.register.refreshToken);
                await SecureStore.setItemAsync('user', JSON.stringify(response.data.register.user));

                return {
                    data: {
                        accessToken: response.data.register.accessToken,
                        refreshToken: response.data.register.refreshToken,
                        user: response.data.register.user
                    }
                };
            } else {
                throw new Error('Registration failed');
            }
        } catch (error: any) {
            console.error('AuthService registration error:', error);
            throw new Error(error.message || 'Registration failed');
        }
    }

    static async discordAuth(accessToken: string): Promise<{ data: AuthResponse }> {
        try {
            const response = await client.mutate({
                mutation: DISCORD_AUTH_MUTATION,
                variables: { accessToken }
            });

            if (response.data?.discordAuth) {
                // Save tokens to SecureStore
                await SecureStore.setItemAsync('accessToken', response.data.discordAuth.accessToken);
                await SecureStore.setItemAsync('refreshToken', response.data.discordAuth.refreshToken);
                await SecureStore.setItemAsync('user', JSON.stringify(response.data.discordAuth.user));

                return {
                    data: {
                        accessToken: response.data.discordAuth.accessToken,
                        refreshToken: response.data.discordAuth.refreshToken,
                        user: response.data.discordAuth.user
                    }
                };
            } else {
                throw new Error('Discord authentication failed');
            }
        } catch (error: any) {
            console.error('AuthService Discord auth error:', error);
            throw new Error(error.message || 'Discord authentication failed');
        }
    }

    static async discordAuthCode(code: string, redirectUri: string, codeVerifier?: string): Promise<{ data: AuthResponse }> {
        try {
            const response = await client.mutate({
                mutation: DISCORD_AUTH_CODE_MUTATION,
                variables: { code, redirectUri, codeVerifier }
            });

            if (response.data?.discordAuthCode) {
                // Save tokens to SecureStore
                await SecureStore.setItemAsync('accessToken', response.data.discordAuthCode.accessToken);
                await SecureStore.setItemAsync('refreshToken', response.data.discordAuthCode.refreshToken);
                await SecureStore.setItemAsync('user', JSON.stringify(response.data.discordAuthCode.user));

                return {
                    data: {
                        accessToken: response.data.discordAuthCode.accessToken,
                        refreshToken: response.data.discordAuthCode.refreshToken,
                        user: response.data.discordAuthCode.user
                    }
                };
            } else {
                throw new Error('Discord authentication failed');
            }
        } catch (error: any) {
            console.error('AuthService Discord auth code error:', error);
            throw new Error(error.message || 'Discord authentication failed');
        }
    }

    static async linkDiscordAccount(code: string, redirectUri: string, codeVerifier?: string) {
        try {
            const response = await client.mutate({
                mutation: LINK_DISCORD_ACCOUNT_MUTATION,
                variables: { code, redirectUri, codeVerifier }
            });

            if (response.data?.linkDiscordAccount) {
                return {
                    data: response.data.linkDiscordAccount
                };
            } else {
                throw new Error('Failed to link Discord account');
            }
        } catch (error: any) {
            console.error('AuthService link Discord account error:', error);
            throw new Error(error.message || 'Failed to link Discord account');
        }
    }

    static async logout(): Promise<boolean> {
        try {
            // Get refresh token from SecureStore
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            
            if (refreshToken) {
                // Send request to server to invalidate token
                await client.mutate({
                    mutation: LOGOUT_MUTATION,
                    variables: { refreshToken }
                });
            }

            // Delete tokens from SecureStore
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            await SecureStore.deleteItemAsync('user');
            
            // Clear Apollo Client cache
            await client.clearStore();
            
            return true;
        } catch (error) {
            console.error('AuthService logout error:', error);
            // Even if the request to the server fails, clear local data
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            await SecureStore.deleteItemAsync('user');
            await client.clearStore();
            return true;
        }
    }

    static async refreshToken(refreshToken: string): Promise<{ data: AuthResponse }> {
        try {
            const response = await client.mutate({
                mutation: REFRESH_TOKEN_MUTATION,
                variables: { refreshToken }
            });

            if (response.data?.refreshToken) {
                // Save new tokens to SecureStore
                await SecureStore.setItemAsync('accessToken', response.data.refreshToken.accessToken);
                await SecureStore.setItemAsync('refreshToken', response.data.refreshToken.refreshToken);
                await SecureStore.setItemAsync('user', JSON.stringify(response.data.refreshToken.user));

                return {
                    data: {
                        accessToken: response.data.refreshToken.accessToken,
                        refreshToken: response.data.refreshToken.refreshToken,
                        user: response.data.refreshToken.user
                    }
                };
            } else {
                throw new Error('Token refresh failed');
            }
        } catch (error: any) {
            console.error('AuthService refresh token error:', error);
            
            // If there is an error updating the token, delete the old tokens
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            await SecureStore.deleteItemAsync('user');
            
            throw new Error(error.message || 'Token refresh failed');
        }
    }

    /**
     * Check if the user is authenticated
     * @returns {Promise<boolean>} true if the user is authenticated
     */
    static async isAuthenticated(): Promise<boolean> {
        try {
            const accessToken = await SecureStore.getItemAsync('accessToken');
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            return !!(accessToken && refreshToken);
        } catch (error) {
            console.error('Error checking authentication status:', error);
            return false;
        }
    }

    /**
     * Get tokens from SecureStore
     * @returns {Promise<{accessToken: string | null, refreshToken: string | null}>}
     */
    static async getTokens(): Promise<{ accessToken: string | null, refreshToken: string | null }> {
        try {
            const accessToken = await SecureStore.getItemAsync('accessToken');
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            return { accessToken, refreshToken };
        } catch (error) {
            console.error('Error getting tokens:', error);
            return { accessToken: null, refreshToken: null };
        }
    }

    /**
     * Get user data from SecureStore
     * @returns {Promise<any>} user data or null
     */
    static async getCurrentUser(): Promise<any> {
        try {
            const userString = await SecureStore.getItemAsync('user');
            return userString ? JSON.parse(userString) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    /**
     * Proactive token refresh if it is about to expire
     * @returns {Promise<boolean>} true if the token was refreshed
     */
    static async refreshTokenIfNeeded(): Promise<boolean> {
        //console.log('AuthService.refreshTokenIfNeeded() called');
        try {
            const { accessToken, refreshToken } = await this.getTokens();
            
            if (!accessToken || !refreshToken) {
                return false;
            }

            try {
                const result = await this.refreshToken(refreshToken);
                return true;
            } catch (error: any) {
                if (error.message?.includes('Invalid refresh token') ||
                    error.message?.includes('Refresh token expired') ||
                    error.message?.includes('Refresh token not found')) {

                    await SecureStore.deleteItemAsync('accessToken');
                    await SecureStore.deleteItemAsync('refreshToken');
                    await SecureStore.deleteItemAsync('user');
                }
                return false;
            }
        } catch (error) {
            console.error('Error while proactive token refresh:', error);
            return false;
        }
    }

    /**
     * Safe execution of an operation with automatic token refresh
     * @param operation - function to execute
     * @returns result of the operation
     */
    static async executeWithTokenRefresh<T>(operation: () => Promise<T>): Promise<T> {
        try {
            return await operation();
        } catch (error: any) {
            // If the error is related to authorization, try to refresh the token
            const isAuthError = error.message?.includes('Unauthorized') ||
                               error.message?.includes('Invalid token') ||
                               error.message?.includes('Token expired');

            if (isAuthError) {
                console.log('Auth error detected, attempting token refresh...');
                
                const refreshed = await this.refreshTokenIfNeeded();
                if (refreshed) {
                    console.log('Token refreshed, retrying operation...');
                    return await operation();
                }
            }
            
            throw error;
        }
    }
}   
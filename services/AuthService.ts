import { apolloClient as client } from "@/lib/graphql/client";
import { LOGIN_MUTATION, REGISTER_MUTATION, DISCORD_AUTH_MUTATION, DISCORD_AUTH_CODE_MUTATION, LINK_DISCORD_ACCOUNT_MUTATION, REFRESH_TOKEN_MUTATION, LOGOUT_MUTATION } from "@/lib/graphql/queries";
import { AuthResponse } from "@/lib/graphql/types";
import { TokenManager } from "@/lib/utils/TokenManager";
import * as AuthSession from 'expo-auth-session';

export default class AuthService {

    static async login(email: string, password: string): Promise<{ data: AuthResponse }> {
        try {
            const response = await client.mutate({
                mutation: LOGIN_MUTATION,
                variables: { email, password }
            });

            if (response.data?.login) {
                const { accessToken, refreshToken, user } = response.data.login;

                // Save tokens to SecureStore using TokenManager
                await TokenManager.saveTokens(accessToken, refreshToken, user);

                return {
                    data: {
                        accessToken,
                        refreshToken,
                        user
                    }
                };
            } else {
                throw new Error('Login failed');
            }
        } catch (error: any) {
            //console.error('AuthService login error:', error);
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
                const { accessToken, refreshToken, user } = response.data.register;

                // Save tokens to SecureStore using TokenManager
                await TokenManager.saveTokens(accessToken, refreshToken, user);

                return {
                    data: {
                        accessToken,
                        refreshToken,
                        user
                    }
                };
            } else {
                throw new Error('Registration failed');
            }
        } catch (error: any) {
            //console.error('AuthService registration error:', error);
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
                const { accessToken: newAccessToken, refreshToken, user } = response.data.discordAuth;

                // Save tokens to SecureStore using TokenManager
                await TokenManager.saveTokens(newAccessToken, refreshToken, user);

                return {
                    data: {
                        accessToken: newAccessToken,
                        refreshToken,
                        user
                    }
                };
            } else {
                throw new Error('Discord authentication failed');
            }
        } catch (error: any) {
            //console.error('AuthService Discord auth error:', error);
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
                const { accessToken, refreshToken, user } = response.data.discordAuthCode;

                // Save tokens to SecureStore using TokenManager
                await TokenManager.saveTokens(accessToken, refreshToken, user);

                return {
                    data: {
                        accessToken,
                        refreshToken,
                        user
                    }
                };
            } else {
                throw new Error('Discord authentication failed');
            }
        } catch (error: any) {
            //console.error('AuthService Discord auth code error:', error);
            throw new Error(error.message || 'Discord authentication failed');
        }
    }

    /**
     * Discord OAuth login with full flow handling
     */
    static async loginWithDiscord(): Promise<{ data: AuthResponse }> {
        try {
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

            if (result.type === 'success' && result.params.code) {
                return await this.discordAuthCode(
                    result.params.code,
                    redirectUri,
                    request.codeVerifier!
                );
            } else if (result.type === 'cancel') {
                throw new Error('Discord authorization was cancelled');
            } else if (result.type === 'error') {
                throw new Error(result.error?.message || 'Discord authorization failed');
            } else {
                throw new Error('Discord authorization failed with unexpected result');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Discord login failed');
        }
    }

    /**
     * Link Discord account to existing user with full flow handling
     */
    static async linkDiscordAccount(): Promise<{ success: boolean; message: string; user?: any }> {
        try {
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

            if (result.type === 'success' && result.params.code) {
                // Send code to backend for linking
                const response = await client.mutate({
                    mutation: LINK_DISCORD_ACCOUNT_MUTATION,
                    variables: { 
                        code: result.params.code,
                        redirectUri,
                        codeVerifier: request.codeVerifier!
                    }
                });

                const linkResult = response.data?.linkDiscordAccount;

                if (linkResult?.success) {
                    // Update stored user data if linking was successful
                    const currentUser = await TokenManager.getCurrentUser();
                    if (currentUser && linkResult.user) {
                        await TokenManager.updateStoredUser(linkResult.user);
                    }
                }

                return linkResult;
            } else if (result.type === 'cancel') {
                throw new Error('Discord linking was cancelled');
            } else if (result.type === 'error') {
                throw new Error(result.error?.message || 'Discord linking failed');
            } else {
                throw new Error('Discord linking failed with unexpected result');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Failed to link Discord account');
        }
    }

    static async logout(): Promise<boolean> {
        try {
            // Get refresh token from SecureStore using TokenManager
            const refreshToken = await TokenManager.getRefreshToken();
            
            // Only try to invalidate token on server if we have a valid refresh token
            if (refreshToken) {
                //console.log('Attempting to invalidate refresh token on server');
                try {
                    await client.mutate({
                        mutation: LOGOUT_MUTATION,
                        variables: { refreshToken }
                    });
                    //console.log('Successfully invalidated refresh token on server');
                } catch (error) {
                    // Don't throw error if server logout fails - still clear local data
                    //console.warn('Failed to invalidate token on server, but continuing with local logout:', error);
                }
            } else {
                //console.log('No refresh token found, skipping server invalidation');
            }

            // Delete tokens from SecureStore using TokenManager
            await TokenManager.clearTokens();
            
            // Clear Apollo Client cache
            await client.clearStore();
            
            //console.log('Logout completed successfully');
            return true;
        } catch (error) {
            //console.error('AuthService logout error:', error);
            // Even if the request to the server fails, clear local data
            await TokenManager.clearTokens();
            await client.clearStore();
            return true;
        }
    }

    static async refreshToken(refreshToken: string): Promise<{ data: AuthResponse }> {

        //console.log('call AuthService.refreshToken() refreshToken', refreshToken);

        try {
            const response = await client.mutate({
                mutation: REFRESH_TOKEN_MUTATION,
                variables: { refreshToken }
            });

            if (response.data?.refreshToken) {

                //console.log('AuthService.refreshToken() response', response);

                const { accessToken, refreshToken: newRefreshToken, user } = response.data.refreshToken;

                // Save new tokens to SecureStore using TokenManager
                await TokenManager.saveTokens(accessToken, newRefreshToken, user);

                return {
                    data: {
                        accessToken,
                        refreshToken: newRefreshToken,
                        user
                    }
                };
            } else {
                throw new Error('Token refresh failed');
            }
        } catch (error: any) {
            //console.error('AuthService refresh token error:', error);
            
            // If there is an error updating the token, delete the old tokens using TokenManager
            await TokenManager.clearTokens();
            
            throw new Error(error.message || 'Token refresh failed');
        }
    }
}   
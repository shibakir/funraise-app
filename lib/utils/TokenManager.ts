import * as SecureStore from 'expo-secure-store';

/**
 * TokenManager - centralized token and user data management
 * 
 * This class provides a single point of control for managing authentication tokens
 * and user data stored in SecureStore. It is used by AuthService and Apollo Client
 * to ensure consistent token management across the application.
 * 
 * Features:
 * - Save/retrieve access and refresh tokens
 * - Manage user data in secure storage
 * - Check authentication status
 * - Notify components when tokens are cleared
 * 
 * @class TokenManager
 */
export class TokenManager {
    /** Key for storing access token in SecureStore */
    private static readonly ACCESS_TOKEN_KEY = 'authToken';
    /** Key for storing refresh token in SecureStore */
    private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
    /** Key for storing user data in SecureStore */
    private static readonly USER_KEY = 'authUser';

    /** Callback functions to notify when tokens are cleared */
    private static onTokensClearedCallbacks: (() => void)[] = [];

    /**
     * Register a callback to be called when tokens are cleared
     * 
     * @param {() => void} callback - Function to call when tokens are cleared
     * @memberof TokenManager
     * @static
     */
    static onTokensCleared(callback: () => void): void {
        this.onTokensClearedCallbacks.push(callback);
    }

    /**
     * Remove a previously registered callback
     * 
     * @param {() => void} callback - The callback function to remove
     * @memberof TokenManager
     * @static
     */
    static removeTokensClearedCallback(callback: () => void): void {
        this.onTokensClearedCallbacks = this.onTokensClearedCallbacks.filter(cb => cb !== callback);
    }

    /**
     * Notify all registered callbacks that tokens were cleared
     * 
     * @private
     * @memberof TokenManager
     * @static
     */
    private static notifyTokensCleared(): void {
        //console.log('Notifying components that tokens were cleared');
        this.onTokensClearedCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                //console.error('Error in tokens cleared callback:', error);
            }
        });
    }

    /**
     * Save access token, refresh token, and user data to SecureStore
     * 
     * @param {string} accessToken - The access token to save
     * @param {string} refreshToken - The refresh token to save
     * @param {any} user - The user data object to save
     * @returns {Promise<void>}
     * @memberof TokenManager
     * @static
     */
    static async saveTokens(accessToken: string, refreshToken: string, user: any): Promise<void> {
        await Promise.all([
            SecureStore.setItemAsync(this.ACCESS_TOKEN_KEY, accessToken),
            SecureStore.setItemAsync(this.REFRESH_TOKEN_KEY, refreshToken),
            SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(user))
        ]);
    }

    /**
     * Retrieve the access token from SecureStore
     * 
     * @returns {Promise<string | null>} The access token or null if not found
     * @memberof TokenManager
     * @static
     */
    static async getAccessToken(): Promise<string | null> {

        //console.log('getAccessToken');
        try {
            return await SecureStore.getItemAsync(this.ACCESS_TOKEN_KEY);
        } catch (error) {
            //console.error('Error getting access token:', error);
            return null;
        }
    }

    /**
     * Retrieve the refresh token from SecureStore
     * 
     * @returns {Promise<string | null>} The refresh token or null if not found
     * @memberof TokenManager
     * @static
     */
    static async getRefreshToken(): Promise<string | null> {

        //console.log('getRefreshToken');
        try {
            return await SecureStore.getItemAsync(this.REFRESH_TOKEN_KEY);
        } catch (error) {
            //console.error('Error getting refresh token:', error);
            return null;
        }
    }

    /**
     * Retrieve both access and refresh tokens from SecureStore
     * 
     * @returns {Promise<{accessToken: string | null, refreshToken: string | null}>} Object containing both tokens
     * @memberof TokenManager
     * @static
     */
    static async getTokens(): Promise<{ accessToken: string | null, refreshToken: string | null }> {
        try {
            const [accessToken, refreshToken] = await Promise.all([
                SecureStore.getItemAsync(this.ACCESS_TOKEN_KEY),
                SecureStore.getItemAsync(this.REFRESH_TOKEN_KEY)
            ]);
            return { accessToken, refreshToken };
        } catch (error) {
            //console.error('Error getting tokens:', error);
            return { accessToken: null, refreshToken: null };
        }
    }

    /**
     * Retrieve the current user data from SecureStore
     * 
     * @returns {Promise<any | null>} The user data object or null if not found
     * @memberof TokenManager
     * @static
     */
    static async getCurrentUser(): Promise<any | null> {
        try {
            const userString = await SecureStore.getItemAsync(this.USER_KEY);
            return userString ? JSON.parse(userString) : null;
        } catch (error) {
            //console.error('Error getting current user:', error);
            return null;
        }
    }

    /**
     * Update the stored user data with new information
     * 
     * @param {any} userData - Partial user data to merge with existing data
     * @returns {Promise<void>}
     * @memberof TokenManager
     * @static
     */
    static async updateStoredUser(userData: any): Promise<void> {
        try {
            const currentUser = await this.getCurrentUser();
            if (currentUser) {
                const updatedUser = { ...currentUser, ...userData };
                await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(updatedUser));
            }
        } catch (error) {
            //console.error('Error updating stored user:', error);
        }
    }

    /**
     * Check if the user is currently authenticated by verifying token presence
     * 
     * @returns {Promise<boolean>} True if both access and refresh tokens exist
     * @memberof TokenManager
     * @static
     */
    static async isAuthenticated(): Promise<boolean> {
        try {
            const { accessToken, refreshToken } = await this.getTokens();
            return !!(accessToken && refreshToken);
        } catch (error) {
            //console.error('Error checking authentication status:', error);
            return false;
        }
    }

    /**
     * Clear all authentication tokens and user data from SecureStore
     * 
     * This method will remove all stored authentication data and notify
     * all registered callbacks that tokens have been cleared.
     * 
     * @returns {Promise<void>}
     * @memberof TokenManager
     * @static
     */
    static async clearTokens(): Promise<void> {
        try {
            //console.log('Clearing all tokens from SecureStore');
            await Promise.all([
                SecureStore.deleteItemAsync(this.ACCESS_TOKEN_KEY),
                SecureStore.deleteItemAsync(this.REFRESH_TOKEN_KEY),
                SecureStore.deleteItemAsync(this.USER_KEY)
            ]);
            
            // Notify all registered callbacks
            this.notifyTokensCleared();
        } catch (error) {
            //console.error('Error clearing tokens:', error);
        }
    }
} 
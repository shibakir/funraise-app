import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

// backend url
const API_URL = "http://localhost:3000";

// user interface
interface User {
    id: number;
    email: string;
    username?: string | null;
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
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: UpdateProfileData) => Promise<void>;
}

// create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// auth provider
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // check token presence on app load
    useEffect(() => {
        const loadToken = async () => {
            try {
                const storedToken = await SecureStore.getItemAsync('token');
                const storedUser = await SecureStore.getItemAsync('user');
                
                if (storedToken && storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setToken(storedToken);
                    setUser(parsedUser);
                    
                    // configure axios to use token in headers
                    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                    
                    console.log('Loaded stored auth data:', { user: parsedUser, token: storedToken });
                } else {
                    console.log('No stored auth data found');
                }
            } catch (error) {
                console.error('Error loading auth data:', error);
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

            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            const { user, token } = response.data;
            
            // save data to SecureStore
            await Promise.all([
                SecureStore.setItemAsync('token', token),
                SecureStore.setItemAsync('user', JSON.stringify(user))
            ]);
            
            // update state
            setUser(user);
            setToken(token);
            
            // configure axios to use token in headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            console.log('Login successful, saved auth data to secure storage');
        } catch (error: any) {
            //const message = error.response?.data?.message || 'Error during login';
            const message = 'Email or password is bad';
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
            
            const response = await axios.post(`${API_URL}/auth/register`, { username, email, password });
            const { user, token } = response.data;
            
            // save data to SecureStore
            await Promise.all([
                SecureStore.setItemAsync('token', token),
                SecureStore.setItemAsync('user', JSON.stringify(user))
            ]);
            
            // update state
            setUser(user);
            setToken(token);
            
            // configure axios to use token in headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            console.log('Registration successful, saved auth data to secure storage');
        } catch (error: any) {
            //const message = error.response?.data?.message || 'Error during registration';
            const message = 'Probably the user already exists or your data is incorrect';
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
            
            const response = await axios.put(`${API_URL}/users/${user.id}`, data);
            const updatedUser = response.data;
            
            // save updated user to SecureStore
            await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
            
            // update state
            setUser(updatedUser);
            
            console.log('Profile updated successfully');
        
        } catch (error: any) {
            const message = error.response?.data?.error || 'Error updating profile';
            setError(message);
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    };

    // logout function
    const logout = async () => {
        try {
            setIsLoading(true);
            
            // remove data from SecureStore
            await Promise.all([
                SecureStore.deleteItemAsync('token'),
                SecureStore.deleteItemAsync('user')
            ]);
            
            // update state
            setUser(null);
            setToken(null);
            
            // remove token from request headers
            delete axios.defaults.headers.common['Authorization'];
            
            console.log('Logout successful, removed auth data from secure storage');
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
                login,
                register,
                logout,
                updateProfile
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
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// backend url
const API_URL = "http://localhost:3000";

// user interface
interface User {
    id: number;
    email: string;
    username?: string | null;
}

// update profile data interface
interface UpdateProfileData {
    username?: string;
    email?: string;
    password?: string;
    currentPassword?: string;
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
                const storedToken = await AsyncStorage.getItem('token');
                const storedUser = await AsyncStorage.getItem('user');
                
                if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                
                // configure axios to use token in headers
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                }
            } catch (error) {
                console.error('Error loading token:', error);
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
            
            // save data to AsyncStorage
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));
            
            // update state
            setUser(user);
            setToken(token);
            
            // configure axios to use token in headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
            
            // save data to AsyncStorage
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));
            
            // update state
            setUser(user);
            setToken(token);
            
            // configure axios to use token in headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
            
            // save updated user to AsyncStorage
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            
            // update state
            setUser(updatedUser);
        
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
            
            // remove data from AsyncStorage
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            
            // update state
            setUser(null);
            setToken(null);
            
            // remove token from request headers
            delete axios.defaults.headers.common['Authorization'];
        } catch (error) {
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
import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useAuth } from '@/lib/context/AuthContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CustomButton } from '@/components/custom/button';
import { useThemeColor } from '@/lib/hooks/useThemeColor';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const errorColor = useThemeColor({}, 'error');
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error during login:', error);
    }
  };
  
  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={[styles.container, { backgroundColor }]}
    >
      <StatusBar style="auto" />
      
        <ThemedView style={styles.logoContainer}>
            <Image 
                source={require('../assets/images/react-logo.png')} 
                style={styles.logo} 
                resizeMode="contain"
            />
            <ThemedText style={styles.appName}>Funraise</ThemedText>
        </ThemedView>
      
        <ThemedView style={styles.formContainer}>
            <ThemedText style={styles.title}>Login</ThemedText>
        
        {error && (
            <ThemedText style={[styles.errorText, { color: errorColor }]}>
                {error}
            </ThemedText>
        )}
        
        <TextInput
            style={[styles.input, { backgroundColor: surfaceColor, color: textColor, borderColor: primaryColor }]}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
        />
        
        <TextInput
            style={[styles.input, { backgroundColor: surfaceColor, color: textColor, borderColor: primaryColor }]}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
        />
        
        {isLoading ? (
            <ActivityIndicator size="large" color={primaryColor} style={styles.loader} />
        ) : (
            <CustomButton
                title="Login"
                onPress={handleLogin}
                variant="primary"
                size="large"
            />
        )}
        
        <ThemedView style={styles.registerContainer}>
            <ThemedText>Not registered yet? </ThemedText>
            <Link href="/register" asChild>
            <TouchableOpacity>
                <ThemedText style={[styles.registerLink, { color: primaryColor }]}>
                    Register
                </ThemedText>
            </TouchableOpacity>
            </Link>
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerLink: {
    fontWeight: 'bold',
  },
}); 
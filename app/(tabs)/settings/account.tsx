import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    StatusBar
} from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { verticalScale, moderateScale, horizontalScale } from '@/lib/utilities/Metrics';
import { useAuth } from '@/lib/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { CustomButton } from '@/components/custom/button';

// TODO: Add data verification + restrictions

export default function AccountScreen() {
    const { user, updateProfile, error, isLoading } = useAuth();
    const { t } = useTranslation();
    const [name, setName] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [editingName, setEditingName] = useState(false);
    const [editingEmail, setEditingEmail] = useState(false);
    const [editingPassword, setEditingPassword] = useState(false);
    
    const backgroundColor = useThemeColor({}, 'background');
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'divider');
    const textColor = useThemeColor({}, 'text');
    const errorColor = useThemeColor({}, 'error');
    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const headerBackground = useThemeColor({}, 'headerBackground');
    const headerText = useThemeColor({}, 'headerText');
    const placeholderColor = useThemeColor({}, 'placeholder');

    const handleUpdateName = async () => {
        try {
            if (!name.trim()) {
                Alert.alert('Error', 'Name cannot be empty');
                return;
            }
            
            if (name === user?.username) {
                setEditingName(false);
                return;
            }
            
            const updateData = { name };
            
            await updateProfile(updateData);
            setEditingName(false);
            
            Alert.alert('Success', 'Name updated successfully');
        } catch (error: any) {
            console.error('Error updating name:', error);
            Alert.alert('Error', error.message || 'Failed to update name');
        }
    };
    
    const handleUpdateEmail = async () => {
        try {
            if (!email.trim() || !email.includes('@')) {
                Alert.alert('Error', 'Please enter a valid email');
                return;
            }
            
            if (email === user?.email) {
                setEditingEmail(false);
                return;
            }
            
            const updateData = { email };
            
            await updateProfile(updateData);
            setEditingEmail(false);
            
            Alert.alert('Success', 'Email updated successfully');
        } catch (error: any) {
            console.error('Error updating email:', error);
            Alert.alert('Error', error.message || 'Failed to update email');
        }
    };
  
    const handleUpdatePassword = async () => {
        try {
            if (!currentPassword) {
                Alert.alert('Error', 'Current password is required');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                Alert.alert('Error', 'New passwords do not match');
                return;
            }
            
            if (newPassword.length < 6) {
                Alert.alert('Error', 'Password must be at least 6 characters');
                return;
            }
            
            if (!newPassword.trim()) {
                setEditingPassword(false);
                return;
            }
            
            const updateData = {
                currentPassword,
                password: newPassword
            };
            
            await updateProfile(updateData);
            
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setEditingPassword(false);
            
            Alert.alert('Success', 'Password changed successfully');
        } catch (error: any) {
            console.error('Error changing password:', error);
            Alert.alert('Error', error.message || 'Failed to change password');
        }
    };
    
    const handleCancelName = () => {
        setName(user?.username || '');
        setEditingName(false);
    };
    
    const handleCancelEmail = () => {
        setEmail(user?.email || '');
        setEditingEmail(false);
    };
    
    const handleCancelPassword = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setEditingPassword(false);
    };
    
    return (
        <>
            <Stack.Screen 
                options={{ 
                    title: t('settings.account') || 'Account',
                    headerShown: true,
                    headerStyle: { backgroundColor: headerBackground },
                    headerTitleStyle: { color: headerText },
                }} 
            />
            <SafeAreaView style={styles.container}>
                <ThemedView style={styles.container}>
                    <StatusBar barStyle="default" />
                    <KeyboardAvoidingView style={styles.container}>
                        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                            <View style={styles.sectionHeader}>
                                <ThemedText style={styles.sectionTitle}>{t('settings.account') || 'Account'}</ThemedText>
                            </View>
                            
                            {/* USERNAME */}
                            <ThemedView style={[styles.mainSection, { backgroundColor: sectionBackground }]}>
                                <View style={[styles.header, { borderBottomColor: borderColor }]}>
                                <ThemedText style={styles.headerTitle}>{t('auth.username') || 'Username'}</ThemedText>
                                {!editingName && (
                                    <TouchableOpacity onPress={() => setEditingName(true)} style={styles.editButton}>
                                    <ThemedText style={{ color: primaryColor }}>{t('settings.edit') || 'Edit'}</ThemedText>
                                    </TouchableOpacity>
                                )}
                                </View>
                                
                                <View style={styles.form}>
                                {editingName ? (
                                    <>
                                    <View style={styles.formGroup}>
                                        <ThemedText style={styles.label}>{t('settings.newUsername') || 'New username'}</ThemedText>
                                        <TextInput
                                        style={[styles.input, { color: textColor, backgroundColor, borderColor: borderColor }]}
                                        value={name}
                                        onChangeText={setName}
                                        placeholder={t('settings.yourNewUsername') || 'Your new username'}
                                        placeholderTextColor={placeholderColor}
                                        />
                                    </View>
                                    
                                    {error && (
                                        <ThemedText style={[styles.errorText, { color: errorColor }]}>
                                        {error}
                                        </ThemedText>
                                    )}
                                    
                                    <View style={styles.buttonContainer}>
                                        {isLoading ? (
                                        <ActivityIndicator size="large" color={primaryColor} style={styles.loader} />
                                        ) : (
                                        <>
                                            <CustomButton 
                                            title={t('cancel') || 'Cancel'} 
                                            onPress={handleCancelName} 
                                            variant="secondary"
                                            />
                                            <View style={{ width: horizontalScale(10) }} />
                                            <CustomButton 
                                            title={t('save') || 'Save'} 
                                            onPress={handleUpdateName} 
                                            variant="primary"
                                            />
                                        </>
                                        )}
                                    </View>
                                    </>
                                ) : (
                                    <ThemedText style={styles.value}>{user?.username || 'Not set'}</ThemedText>
                                )}
                                </View>
                            </ThemedView>
                            
                            {/* EMAIL */}
                            <View style={styles.sectionHeader}>
                                <ThemedText style={styles.sectionTitle}>{t('settings.email') || 'Email'}</ThemedText>
                            </View>
                            <ThemedView style={[styles.mainSection, { backgroundColor: sectionBackground }]}>
                                <View style={[styles.header, { borderBottomColor: borderColor }]}>
                                <ThemedText style={styles.headerTitle}>{t('auth.email') || 'Email'}</ThemedText>
                                {!editingEmail && (
                                    <TouchableOpacity onPress={() => setEditingEmail(true)} style={styles.editButton}>
                                    <ThemedText style={{ color: primaryColor }}>{t('settings.edit') || 'Edit'}</ThemedText>
                                    </TouchableOpacity>
                                )}
                                </View>
                                
                                <View style={styles.form}>
                                {editingEmail ? (
                                    <>
                                    <View style={styles.formGroup}>
                                        <ThemedText style={styles.label}>{t('settings.emailAddress') || 'Email Address'}</ThemedText>
                                        <TextInput
                                        style={[styles.input, { color: textColor, backgroundColor, borderColor: borderColor }]}
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder={t('settings.yourEmail') || 'Your email'}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        placeholderTextColor={placeholderColor}
                                        />
                                    </View>
                                    
                                    {error && (
                                        <ThemedText style={[styles.errorText, { color: errorColor }]}>
                                        {error}
                                        </ThemedText>
                                    )}
                                    
                                    <View style={styles.buttonContainer}>
                                        {isLoading ? (
                                        <ActivityIndicator size="large" color={primaryColor} style={styles.loader} />
                                        ) : (
                                        <>
                                            <CustomButton 
                                            title={t('cancel') || 'Cancel'} 
                                            onPress={handleCancelEmail} 
                                            variant="secondary"
                                            />
                                            <View style={{ width: horizontalScale(10) }} />
                                            <CustomButton 
                                            title={t('save') || 'Save'} 
                                            onPress={handleUpdateEmail} 
                                            variant="primary"
                                            />
                                        </>
                                        )}
                                    </View>
                                    </>
                                ) : (
                                    <ThemedText style={styles.value}>{user?.email || 'Not set'}</ThemedText>
                                )}
                                </View>
                            </ThemedView>
                            
                            {/* PASSWORD */}
                            <View style={styles.sectionHeader}>
                                <ThemedText style={styles.sectionTitle}>{t('settings.password') || 'Password'}</ThemedText>
                            </View>
                            <ThemedView style={[styles.mainSection, { backgroundColor: sectionBackground }]}>
                                <View style={[styles.header, { borderBottomColor: borderColor }]}>
                                <ThemedText style={styles.headerTitle}>{t('auth.password') || 'Password'}</ThemedText>
                                {!editingPassword && (
                                    <TouchableOpacity onPress={() => setEditingPassword(true)} style={styles.editButton}>
                                    <ThemedText style={{ color: primaryColor }}>{t('settings.edit') || 'Edit'}</ThemedText>
                                    </TouchableOpacity>
                                )}
                                </View>
                                
                                <View style={styles.form}>
                                {editingPassword ? (
                                    <>
                                    <View style={styles.formGroup}>
                                        <ThemedText style={styles.label}>{t('settings.currentPassword') || 'Current Password'}</ThemedText>
                                        <TextInput
                                        style={[styles.input, { color: textColor, backgroundColor, borderColor: borderColor }]}
                                        value={currentPassword}
                                        onChangeText={setCurrentPassword}
                                        placeholder="••••••••"
                                        secureTextEntry
                                        placeholderTextColor={placeholderColor}
                                        />
                                    </View>
                                    
                                    <View style={styles.formGroup}>
                                        <ThemedText style={styles.label}>{t('settings.newPassword') || 'New Password'}</ThemedText>
                                        <TextInput
                                        style={[styles.input, { color: textColor, backgroundColor, borderColor: borderColor }]}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        placeholder="••••••••"
                                        secureTextEntry
                                        placeholderTextColor={placeholderColor}
                                        />
                                    </View>
                                    
                                    <View style={styles.formGroup}>
                                        <ThemedText style={styles.label}>{t('settings.confirmPassword') || 'Confirm New Password'}</ThemedText>
                                        <TextInput
                                        style={[styles.input, { color: textColor, backgroundColor, borderColor: borderColor }]}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        placeholder="••••••••"
                                        secureTextEntry
                                        placeholderTextColor={placeholderColor}
                                        />
                                    </View>
                                    
                                    {error && (
                                        <ThemedText style={[styles.errorText, { color: errorColor }]}>
                                        {error}
                                        </ThemedText>
                                    )}
                                    
                                    <View style={styles.buttonContainer}>
                                        {isLoading ? (
                                        <ActivityIndicator size="large" color={primaryColor} style={styles.loader} />
                                        ) : (
                                        <>
                                            <CustomButton 
                                            title={t('cancel') || 'Cancel'}
                                            onPress={handleCancelPassword}
                                            variant="secondary"
                                            />
                                            <View style={{ width: horizontalScale(10) }} />
                                            <CustomButton 
                                            title={t('save') || 'Save'}
                                            onPress={handleUpdatePassword}
                                            variant="primary"
                                            />
                                        </>
                                        )}
                                    </View>
                                    </>
                                ) : (
                                    <ThemedText style={styles.value}>••••••••</ThemedText>
                                )}
                                </View>
                            </ThemedView>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </ThemedView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: moderateScale(16),
        paddingBottom: verticalScale(40),
    },
    mainSection: {
        borderRadius: moderateScale(16),
        overflow: 'hidden',
    },
    sectionHeader: {
        marginTop: verticalScale(20),
        paddingVertical: verticalScale(12),
    },
    sectionTitle: {
        fontSize: moderateScale(20),
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: moderateScale(16),
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: moderateScale(17),
        fontWeight: '600',
    },
    editButton: {
        padding: moderateScale(4),
    },
    form: {
        padding: moderateScale(16),
    },
    formGroup: {
        marginBottom: moderateScale(16),
    },
    label: {
        marginBottom: verticalScale(8),
        fontSize: moderateScale(14),
        opacity: 0.7,
    },
    input: {
        height: verticalScale(44),
        borderWidth: 1,
        borderRadius: moderateScale(8),
        paddingHorizontal: horizontalScale(12),
        fontSize: moderateScale(16),
    },
    value: {
        fontSize: moderateScale(16),
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: verticalScale(16),
    },
    errorText: {
        marginBottom: verticalScale(16),
    },
    loader: {
        marginVertical: verticalScale(16),
    },
}); 
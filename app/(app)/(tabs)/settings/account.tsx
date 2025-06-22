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
    StatusBar,
    Image
} from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { useThemeColor } from '@/lib/hooks/ui';
import { verticalScale, moderateScale, horizontalScale } from '@/lib/utilities/Metrics';
import { useAuth } from '@/lib/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { CustomButton } from '@/components/custom/button';
import { useProfile } from '@/lib/hooks/auth';
import { Ionicons } from '@expo/vector-icons';

export default function AccountScreen() {
    const { user, linkDiscord, updateUserData } = useAuth();
    const { updateProfile, loading, error } = useProfile();
    const { t } = useTranslation();
    
    const [name, setName] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [editingName, setEditingName] = useState(false);
    const [editingEmail, setEditingEmail] = useState(false);
    const [editingPassword, setEditingPassword] = useState(false);
    const [linkingDiscord, setLinkingDiscord] = useState(false);
    
    const currentUser = user;
    
    // Check if user has Discord linked
    const hasDiscordLinked = currentUser?.accounts?.some(account => account.provider === 'discord');
    const discordAccount = currentUser?.accounts?.find(account => account.provider === 'discord');
    
    // Update local state when user data changes
    React.useEffect(() => {
        if (currentUser) {
            setName(currentUser.username || '');
            setEmail(currentUser.email || '');
        }
    }, [currentUser]);
    
    const backgroundColor = useThemeColor({}, 'background');
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'divider');
    const textColor = useThemeColor({}, 'text');
    const errorColor = useThemeColor({}, 'error');
    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const headerBackground = useThemeColor({}, 'headerBackground');
    const headerText = useThemeColor({}, 'headerText');
    const placeholderColor = useThemeColor({}, 'placeholder');

    // Validate username
    const validateUsername = (username: string): string | null => {
        if (!username.trim()) {
            return t('auth.fillAllFields');
        }
        if (username.length < 3) {
            return t('settings.accountPage.validation.usernameMinLength');
        }
        if (username.length > 30) {
            return t('settings.accountPage.validation.usernameMaxLength');
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return t('settings.accountPage.validation.usernameInvalidChars');
        }
        return null;
    };

    // Validate email
    const validateEmail = (email: string): string | null => {
        if (!email.trim()) {
            return t('auth.fillAllFields');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return t('settings.accountPage.validation.emailInvalid');
        }
        return null;
    };

    // Validate password
    const validatePassword = (password: string): string | null => {
        if (!password) {
            return t('settings.accountPage.validation.passwordEmpty');
        }
        if (password.length < 6) {
            return t('settings.accountPage.validation.passwordMinLength');
        }
        if (password.length > 100) {
            return t('settings.accountPage.validation.passwordMaxLength');
        }
        return null;
    };

    const handleUpdateName = async () => {
        try {
            const trimmedName = name.trim();
            
            // Validation
            const validationError = validateUsername(trimmedName);
            if (validationError) {
                Alert.alert(t('auth.error'), validationError);
                return;
            }
            
            // Check for changes
            if (trimmedName === currentUser?.username) {
                setEditingName(false);
                return;
            }
            
            const updateData = { username: trimmedName };
            
            if (currentUser?.id) {
                await updateProfile(currentUser.id, updateData);
            }
            setEditingName(false);
            
            Alert.alert(t('settings.alerts.success'), t('settings.accountPage.success.usernameUpdated'));
        } catch (error: any) {
            console.error('Error updating username:', error);
            Alert.alert(t('auth.error'), error.message || t('settings.accountPage.errors.updateUsernameFailed'));
        }
    };
    
    const handleUpdateEmail = async () => {
        try {
            const trimmedEmail = email.trim().toLowerCase();
            
            // Validation
            const validationError = validateEmail(trimmedEmail);
            if (validationError) {
                Alert.alert(t('auth.error'), validationError);
                return;
            }
            
            // Check for changes
            if (trimmedEmail === currentUser?.email) {
                setEditingEmail(false);
                return;
            }
            
            const updateData = { email: trimmedEmail };
            
            if (currentUser?.id) {
                await updateProfile(currentUser.id, updateData);
            }
            setEditingEmail(false);
            
            Alert.alert(t('settings.alerts.success'), t('settings.accountPage.success.emailUpdated'));
        } catch (error: any) {
            console.error('Error updating email:', error);
            Alert.alert(t('auth.error'), error.message || t('settings.accountPage.errors.updateEmailFailed'));
        }
    };
  
    const handleUpdatePassword = async () => {
        try {
            // Current password validation
            if (!currentPassword.trim()) {
                Alert.alert(t('auth.error'), t('settings.accountPage.validation.currentPasswordRequired'));
                return;
            }
            
            // New password validation
            const passwordValidationError = validatePassword(newPassword);
            if (passwordValidationError) {
                Alert.alert(t('auth.error'), passwordValidationError);
                return;
            }
            
            // Check password match
            if (newPassword !== confirmPassword) {
                Alert.alert(t('auth.error'), t('settings.accountPage.validation.passwordsNotMatch'));
                return;
            }
            
            // Check that new password is different from current
            if (currentPassword === newPassword) {
                Alert.alert(t('auth.error'), t('settings.accountPage.validation.passwordSameAsCurrent'));
                return;
            }
            
            const updateData = {
                currentPassword: currentPassword.trim(),
                newPassword: newPassword.trim()
            };
            
            if (currentUser?.id) {
                await updateProfile(currentUser.id, updateData);
            }
            
            // Clear fields after successful update
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setEditingPassword(false);
            
            Alert.alert(t('settings.alerts.success'), t('settings.accountPage.success.passwordUpdated'));
        } catch (error: any) {
            console.error('Error changing password:', error);
            Alert.alert(t('auth.error'), error.message || t('settings.accountPage.errors.updatePasswordFailed'));
        }
    };
    
    const handleCancelName = () => {
        setName(currentUser?.username || '');
        setEditingName(false);
    };
    
    const handleCancelEmail = () => {
        setEmail(currentUser?.email || '');
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
                    title: t('settings.accountPage.title'),
                    headerBackTitle: t('settings.accountPage.backTitle'),
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
                            {/* USERNAME */}
                            <ThemedView style={[styles.mainSection, { backgroundColor: sectionBackground }]}>
                                <View style={[styles.header, { borderBottomColor: borderColor }]}>
                                <ThemedText style={styles.headerTitle}>{t('settings.accountPage.username')}</ThemedText>
                                {!editingName && (
                                    <TouchableOpacity onPress={() => setEditingName(true)} style={styles.editButton}>
                                    <ThemedText style={{ color: primaryColor }}>{t('settings.accountPage.edit')}</ThemedText>
                                    </TouchableOpacity>
                                )}
                                </View>
                                
                                <View style={styles.form}>
                                    {editingName ? (
                                        <>
                                        <View style={styles.formGroup}>
                                            <ThemedText style={styles.label}>{t('settings.accountPage.newUsername')}</ThemedText>
                                            <TextInput
                                                style={[styles.input, { color: textColor, backgroundColor, borderColor: borderColor }]}
                                                value={name}
                                                onChangeText={setName}
                                                placeholder={t('settings.accountPage.newUsernamePlaceholder')}
                                                placeholderTextColor={placeholderColor}
                                            />
                                        </View>
                                        
                                        {error && (
                                            <ThemedText style={[styles.errorText, { color: errorColor }]}>
                                                {typeof error === 'string' ? error : error.message}
                                            </ThemedText>
                                        )}
                                        
                                        <View style={styles.buttonContainer}>
                                            {loading ? (
                                                <ActivityIndicator size="large" color={primaryColor} style={styles.loader} />
                                                ) : (
                                                    <>
                                                        <CustomButton 
                                                            title={t('settings.accountPage.cancel')} 
                                                            onPress={handleCancelName} 
                                                            variant="secondary"
                                                        />
                                                        <View style={{ width: horizontalScale(10) }} />
                                                        <CustomButton 
                                                            title={t('settings.accountPage.save')} 
                                                            onPress={handleUpdateName} 
                                                            variant="primary"
                                                        />
                                                    </>
                                                )
                                            }
                                        </View>
                                        </>
                                    ) : (
                                        <ThemedText style={styles.value}>{currentUser?.username || t('settings.accountPage.notSet')}</ThemedText>
                                    )}
                                </View>
                            </ThemedView>
                            
                            {/* EMAIL */}
                            <ThemedView style={[styles.mainSection, { backgroundColor: sectionBackground }]}>
                                <View style={[styles.header, { borderBottomColor: borderColor }]}>
                                    <ThemedText style={styles.headerTitle}>{t('settings.accountPage.email')}</ThemedText>
                                    {!editingEmail && (
                                        <TouchableOpacity onPress={() => setEditingEmail(true)} style={styles.editButton}>
                                        <ThemedText style={{ color: primaryColor }}>{t('settings.accountPage.edit')}</ThemedText>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                
                                <View style={styles.form}>
                                    {editingEmail ? (
                                        <>
                                            <View style={styles.formGroup}>
                                                <ThemedText style={styles.label}>{t('settings.accountPage.newEmail')}</ThemedText>
                                                <TextInput
                                                    style={[styles.input, { color: textColor, backgroundColor, borderColor: borderColor }]}
                                                    value={email}
                                                    onChangeText={setEmail}
                                                    placeholder={t('settings.accountPage.newEmailPlaceholder')}
                                                    keyboardType="email-address"
                                                    autoCapitalize="none"
                                                    placeholderTextColor={placeholderColor}
                                                />
                                            </View>
                                            
                                            {error && (
                                                <ThemedText style={[styles.errorText, { color: errorColor }]}>
                                                    {typeof error === 'string' ? error : error.message}
                                                </ThemedText>
                                            )}
                                            
                                            <View style={styles.buttonContainer}>
                                                {loading ? (
                                                <ActivityIndicator size="large" color={primaryColor} style={styles.loader} />
                                                    ) : (
                                                    <>
                                                        <CustomButton 
                                                            title={t('settings.accountPage.cancel')} 
                                                            onPress={handleCancelEmail} 
                                                            variant="secondary"
                                                        />
                                                        <View style={{ width: horizontalScale(10) }} />
                                                        <CustomButton 
                                                            title={t('settings.accountPage.save')} 
                                                            onPress={handleUpdateEmail} 
                                                            variant="primary"
                                                        />
                                                    </>
                                                    )
                                                }
                                            </View>
                                        </>
                                    ) : (
                                        <ThemedText style={styles.value}>{currentUser?.email || t('settings.accountPage.notSet')}</ThemedText>
                                    )}
                                </View>
                            </ThemedView>
                            
                            {/* PASSWORD */}
                            <ThemedView style={[styles.mainSection, { backgroundColor: sectionBackground }]}>
                                <View style={[styles.header, { borderBottomColor: borderColor }]}>
                                    <ThemedText style={styles.headerTitle}>{t('settings.accountPage.password')}</ThemedText>
                                    {!editingPassword && (
                                        <TouchableOpacity onPress={() => setEditingPassword(true)} style={styles.editButton}>
                                            <ThemedText style={{ color: primaryColor }}>{t('settings.accountPage.edit')}</ThemedText>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                
                                <View style={styles.form}>
                                    {editingPassword ? (
                                        <>
                                        <View style={styles.formGroup}>
                                            <ThemedText style={styles.label}>{t('settings.accountPage.currentPassword')}</ThemedText>
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
                                            <ThemedText style={styles.label}>{t('settings.accountPage.newPassword')}</ThemedText>
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
                                            <ThemedText style={styles.label}>{t('settings.accountPage.confirmPassword')}</ThemedText>
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
                                                {typeof error === 'string' ? error : error.message}
                                            </ThemedText>
                                        )}
                                        
                                        <View style={styles.buttonContainer}>
                                            {loading ? (
                                            <ActivityIndicator size="large" color={primaryColor} style={styles.loader} />
                                            ) : (
                                                <>
                                                    <CustomButton 
                                                        title={t('settings.accountPage.cancel')}
                                                        onPress={handleCancelPassword}
                                                        variant="secondary"
                                                    />
                                                    <View style={{ width: horizontalScale(10) }} />
                                                    <CustomButton 
                                                        title={t('settings.accountPage.save')}
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
                            
                            {/* DISCORD INTEGRATION */}
                            <ThemedView style={[styles.mainSection, { backgroundColor: sectionBackground }]}>
                                <View style={[styles.header, { borderBottomColor: borderColor }]}>
                                    <View style={styles.headerWithIcon}>
                                        <Ionicons name="logo-discord" size={24} color="#5865F2" style={styles.discordIcon} />
                                        <ThemedText style={styles.headerTitle}>Discord</ThemedText>
                                    </View>
                                </View>
                                
                                <View style={styles.form}>
                                    {hasDiscordLinked && discordAccount ? (
                                        <View style={styles.linkedAccount}>
                                            <View style={styles.linkedAccountInfo}>
                                                {discordAccount.providerAvatar && (
                                                    <Image 
                                                        source={{ uri: discordAccount.providerAvatar }} 
                                                        style={styles.discordAvatar}
                                                    />
                                                )}
                                                <View style={styles.linkedAccountText}>
                                                    <ThemedText style={styles.linkedUsername}>
                                                        {discordAccount.providerUsername}
                                                        {discordAccount.providerDiscriminator && `#${discordAccount.providerDiscriminator}`}
                                                    </ThemedText>
                                                    <ThemedText style={[styles.linkedEmail, { opacity: 0.7 }]}>
                                                        {discordAccount.providerEmail}
                                                    </ThemedText>
                                                </View>
                                            </View>
                                            <ThemedText style={[styles.linkedStatus, { color: primaryColor }]}>
                                                {t('settings.accountPage.discord.linked')}
                                            </ThemedText>
                                        </View>
                                    ) : (
                                        <View>
                                            <ThemedText style={[styles.discordDescription, { opacity: 0.7 }]}>
                                                {t('settings.accountPage.discord.description')}
                                            </ThemedText>
                                            <CustomButton
                                                title={linkingDiscord ? t('settings.accountPage.discord.linking') : t('settings.accountPage.discord.linkAccount')}
                                                onPress={async () => {
                                                    setLinkingDiscord(true);
                                                    try {
                                                        await linkDiscord();
                                                    } catch (error) {
                                                        // Technical errors are already handled in linkDiscord
                                                        //console.log('Discord linking completed with potential error:', error);
                                                    } finally {
                                                        setLinkingDiscord(false);
                                                    }
                                                }}
                                                variant="primary"
                                                disabled={linkingDiscord}
                                                style={styles.linkButton}
                                            />
                                        </View>
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
        marginBottom: verticalScale(26),
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
    headerWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    discordIcon: {
        marginRight: horizontalScale(8),
    },
    linkedAccount: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    linkedAccountInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    linkedAccountText: {
        marginLeft: horizontalScale(8),
    },
    linkedUsername: {
        fontSize: moderateScale(16),
        fontWeight: '600',
    },
    linkedEmail: {
        fontSize: moderateScale(14),
    },
    linkedStatus: {
        fontSize: moderateScale(14),
        fontWeight: '600',
    },
    discordDescription: {
        marginBottom: verticalScale(16),
    },
    linkButton: {
        marginTop: verticalScale(16),
    },
    discordAvatar: {
        width: verticalScale(32),
        height: verticalScale(32),
        borderRadius: verticalScale(16),
        marginRight: horizontalScale(8),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

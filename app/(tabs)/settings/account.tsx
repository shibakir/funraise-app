import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { verticalScale, moderateScale, horizontalScale } from '@/lib/utilities/Metrics';
import { useAuth } from '@/lib/context/AuthContext';
import { CustomButton } from '@/components/custom/button';

// TODO: Add data verification + restrictions

export default function AccountScreen() {
  const { user, updateProfile, error, isLoading } = useAuth();
  const [name, setName] = useState(user?.name || '');
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
  const surfaceColor = useThemeColor({}, 'surface');
  const placeholderColor = useThemeColor({}, 'placeholder');
  
  const handleUpdateName = async () => {
    try {
      if (!name.trim()) {
        Alert.alert('Error', 'Name cannot be empty');
        return;
      }
      
      if (name === user?.name) {
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
    setName(user?.name || '');
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* USERNAME */}
        <ThemedView style={[styles.card, { backgroundColor: surfaceColor }]}>
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <ThemedText style={styles.headerTitle}>Username</ThemedText>
            {!editingName && (
              <TouchableOpacity onPress={() => setEditingName(true)} style={styles.editButton}>
                <ThemedText style={{ color: primaryColor }}>Edit</ThemedText>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.form}>
            {editingName ? (
              <>
                <View style={styles.formGroup}>
                  <ThemedText style={styles.label}>Name</ThemedText>
                  <TextInput
                    style={[styles.input, { color: textColor, backgroundColor, borderColor: borderColor }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
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
                        title="Cancel" 
                        onPress={handleCancelName} 
                        variant="secondary"
                      />
                      <View style={{ width: horizontalScale(10) }} />
                      <CustomButton 
                        title="Save" 
                        onPress={handleUpdateName} 
                        variant="primary"
                      />
                    </>
                  )}
                </View>
              </>
            ) : (
              <ThemedText style={styles.value}>{user?.name || 'Not set'}</ThemedText>
            )}
          </View>
        </ThemedView>
        
        {/* EMAIL */}
        <ThemedView style={[styles.card, { backgroundColor: surfaceColor, marginTop: verticalScale(16) }]}>
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <ThemedText style={styles.headerTitle}>Email</ThemedText>
            {!editingEmail && (
              <TouchableOpacity onPress={() => setEditingEmail(true)} style={styles.editButton}>
                <ThemedText style={{ color: primaryColor }}>Edit</ThemedText>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.form}>
            {editingEmail ? (
              <>
                <View style={styles.formGroup}>
                  <ThemedText style={styles.label}>Email Address</ThemedText>
                  <TextInput
                    style={[styles.input, { color: textColor, backgroundColor, borderColor: borderColor }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Your email"
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
                        title="Cancel" 
                        onPress={handleCancelEmail} 
                        variant="secondary"
                      />
                      <View style={{ width: horizontalScale(10) }} />
                      <CustomButton 
                        title="Save" 
                        onPress={handleUpdateEmail} 
                        variant="primary"
                      />
                    </>
                  )}
                </View>
              </>
            ) : (
              <ThemedText style={styles.value}>{user?.email}</ThemedText>
            )}
          </View>
        </ThemedView>
        
        {/* PASSWORD */}
        <ThemedView style={[styles.card, { backgroundColor: surfaceColor, marginTop: verticalScale(16) }]}>
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <ThemedText style={styles.headerTitle}>Change Password</ThemedText>
            {!editingPassword && (
              <TouchableOpacity onPress={() => setEditingPassword(true)} style={styles.editButton}>
                <ThemedText style={{ color: primaryColor }}>Change</ThemedText>
              </TouchableOpacity>
            )}
          </View>
          
          {editingPassword ? (
            <View style={styles.form}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Current Password</ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor, backgroundColor, borderColor: borderColor }]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  secureTextEntry
                  placeholderTextColor={placeholderColor}
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>New Password</ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor, backgroundColor, borderColor: borderColor }]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"                        
                  secureTextEntry
                  placeholderTextColor={placeholderColor}
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Confirm New Password</ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor, backgroundColor, borderColor: borderColor }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"                        
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
                      title="Cancel" 
                      onPress={handleCancelPassword} 
                      variant="secondary"
                    />
                    <View style={{ width: horizontalScale(10) }} />
                    <CustomButton 
                      title="Change Password" 
                      onPress={handleUpdatePassword} 
                      variant="primary"
                    />
                  </>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.form}>
              <ThemedText style={styles.description}>
                Secure your account with a strong password that you don't use elsewhere.
              </ThemedText>
            </View>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
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
  card: {
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(12),
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
  },
  editButton: {
    padding: moderateScale(4),
  },
  form: {
    padding: moderateScale(12),
  },
  formGroup: {
    marginBottom: verticalScale(12),
  },
  label: {
    fontSize: moderateScale(14),
    marginBottom: verticalScale(6),
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    fontSize: moderateScale(16),
  },
  value: {
    fontSize: moderateScale(16),
    paddingVertical: moderateScale(6),
  },
  description: {
    fontSize: moderateScale(15),
    opacity: 0.7,
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
    marginVertical: verticalScale(10),
  },
}); 
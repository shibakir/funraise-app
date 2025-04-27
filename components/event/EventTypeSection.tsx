import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { useUserSearch } from '@/lib/hooks/useUserSearch';
import { EventType } from '@/types/event';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
const defaultUserImage = require('@/assets/images/logo.png');

interface EventTypeSectionProps {
    selectedType: EventType;
    onTypeChange: (type: EventType) => void;
    recipientId: string;
    onRecipientChange: (id: string) => void;
    recipientName: string;
    onRecipientNameChange: (name: string) => void;
}

export const EventTypeSection: React.FC<EventTypeSectionProps> = ({
    selectedType,
    onTypeChange,
    recipientId,
    onRecipientChange,
    recipientName,
    onRecipientNameChange,
}) => {

    const { t } = useTranslation();

    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'divider');
    const textColor = useThemeColor({}, 'text');
    const placeholderColor = useThemeColor({}, 'placeholder');
    const sectionBackground = useThemeColor({}, 'sectionBackground');

    const [recipientImage, setRecipientImage] = useState('');

    const {
        users,
        isSearching,
        showUserList,
        searchQuery,
        setSearchQuery,
        searchUsers,
        resetSearch
    } = useUserSearch();

    const selectUser = (user: {id: string, name: string, imageUrl?: string}) => {
        //console.log('Selected user:', user);
        onRecipientChange(user.id);
        onRecipientNameChange(user.name);
        setRecipientImage(user.imageUrl || '');
        resetSearch();
    };

    const clearRecipient = () => {
        onRecipientChange('');
        onRecipientNameChange('');
        setRecipientImage('');
        setSearchQuery('');
    };

    const eventTypes = [
        {
            id: 'DONATION' as EventType,
            title: t('createEvent.eventTypeSection.eventType.donation'),
            description: t('createEvent.eventTypeSection.eventType.donationDesc')
        },
        {
        id: 'FUNDRAISING' as EventType,
        title: t('createEvent.eventTypeSection.eventType.fundraising'),
        description: t('createEvent.eventTypeSection.eventType.fundraisingDesc')
        },
        {
            id: 'JACKPOT' as EventType,
            title: t('createEvent.eventTypeSection.eventType.jackpot'),
            description: t('createEvent.eventTypeSection.eventType.jackpotDesc')
        }
    ];

    const styles = StyleSheet.create({
        section: {
            marginTop: moderateScale(8),
            marginBottom: moderateScale(8),
            flex: 1,
        },
        sectionTitle: {
            fontSize: moderateScale(18),
            fontWeight: '600',
            marginBottom: moderateScale(16),
        },
        typeContainer: {
            width: '100%',
            gap: moderateScale(12),
        },
        typeButton: {
            padding: moderateScale(16),
            borderWidth: 1,
            borderRadius: moderateScale(8),
            borderColor: borderColor,
            backgroundColor: sectionBackground,
        },
        selectedType: {
            backgroundColor: primaryColor,
            borderColor: primaryColor,
        },
        typeTitle: {
            fontSize: moderateScale(18),
            fontWeight: '600',
            marginBottom: moderateScale(8),
        },
        typeDescription: {
            fontSize: moderateScale(14),
            color: placeholderColor,
            lineHeight: moderateScale(20),
        },
        selectedTypeText: {
            color: 'white',
        },
        selectedDescription: {
            color: 'rgba(255, 255, 255, 0.8)',
        },
        recipientContainer: {
            marginTop: moderateScale(16),
        },
        recipientTitle: {
            fontSize: moderateScale(16),
            fontWeight: '600',
            marginBottom: moderateScale(8),
        },
        recipientDescription: {
            fontSize: moderateScale(14),
            color: placeholderColor,
            marginBottom: moderateScale(8),
        },
        searchContainer: {
            position: 'relative',
            marginBottom: moderateScale(8),
        },
        searchInput: {
            borderWidth: 1,
            borderColor: borderColor,
            borderRadius: moderateScale(8),
            padding: moderateScale(12),
            fontSize: moderateScale(16),
            color: textColor,
            backgroundColor: sectionBackground,
        },
        selectedUserContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: moderateScale(12),
            borderWidth: 1,
            borderColor: borderColor,
            borderRadius: moderateScale(8),
            backgroundColor: sectionBackground,
        },
        selectedUserImage: {
            width: moderateScale(25),
            height: moderateScale(25),
            borderRadius: moderateScale(16),
            marginRight: moderateScale(12),
            borderWidth: 1,
            borderColor: borderColor,
        },
        selectedUserName: {
            flex: 1,
            fontSize: moderateScale(16),
            color: textColor,
        },
        searchIndicator: {
            position: 'absolute',
            right: moderateScale(8),
            top: moderateScale(8),
        },
        trashIcon: {
            position: 'absolute',
            right: moderateScale(12),
            top: moderateScale(12),
        },
        userList: {
            maxHeight: moderateScale(200),
            borderWidth: 1,
            borderColor: borderColor,
            borderRadius: moderateScale(8),
            overflow: 'hidden',
            backgroundColor: sectionBackground,
        },
        userItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: moderateScale(12),
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
        },
        userImage: {
            width: moderateScale(30),
            height: moderateScale(30),
            borderRadius: moderateScale(20),
            marginRight: moderateScale(12),
            backgroundColor: sectionBackground,
            borderWidth: 2,
            borderColor: borderColor,
        },
        userName: {
            flex: 1,
            fontSize: moderateScale(16),
        },
        noResults: {
            padding: moderateScale(12),
            textAlign: 'center',
            color: placeholderColor,
        },
        changeButton: {
            padding: moderateScale(8),
            borderRadius: moderateScale(4),
            backgroundColor: primaryColor,
        },
        changeButtonText: {
            color: 'white',
            fontSize: moderateScale(14),
        },
    });

    return (
        <View style={styles.section}>
            <View style={styles.typeContainer}>
                {eventTypes.map((type) => (
                    <TouchableOpacity
                        key={type.id}
                        style={[
                        styles.typeButton,
                        selectedType === type.id && styles.selectedType,
                        ]}
                        onPress={() => onTypeChange(type.id)}
                    >
                        <ThemedText 
                        style={[
                            styles.typeTitle,
                            selectedType === type.id && styles.selectedTypeText,
                        ]}
                        >
                        {type.title}
                        </ThemedText>
                        <ThemedText 
                        style={[
                            styles.typeDescription,
                            selectedType === type.id && styles.selectedDescription,
                        ]}
                        >
                        {type.description}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

        {/* Получатель средств (только для DONATION и FUNDRAISING) */}
        {(selectedType === 'DONATION' || selectedType === 'FUNDRAISING') && (
            <View style={styles.recipientContainer}>
                <ThemedText style={styles.recipientTitle}>{t('createEvent.eventTypeSection.recipient')}</ThemedText>
                <ThemedText style={styles.recipientDescription}>
                    {t('createEvent.eventTypeSection.recipientDescription')}
                </ThemedText>
                <View style={styles.searchContainer}>
                    {recipientId ? (
                        <View style={styles.selectedUserContainer}>
                            <Image 
                            source={recipientImage ? { uri: recipientImage } : defaultUserImage} 
                            style={styles.selectedUserImage}
                            />
                            <ThemedText style={styles.selectedUserName}>{recipientName}</ThemedText>
                            <TouchableOpacity onPress={clearRecipient}>
                            <Ionicons name="trash-outline" size={20} color={textColor} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <TextInput
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={(text) => {
                                setSearchQuery(text);
                                searchUsers(text);
                            }}
                            placeholder={t('createEvent.eventTypeSection.searchPlaceholder')}
                            placeholderTextColor={placeholderColor}
                            keyboardType="default"
                            />
                            {isSearching && (
                            <ActivityIndicator style={styles.searchIndicator} color={primaryColor} />
                            )}
                        </>
                    )}
                </View>
                {!recipientId && showUserList && users.length > 0 && (
                    <View style={styles.userList}>
                    {users.map((user) => (
                        <TouchableOpacity
                        key={user.id}
                        style={styles.userItem}
                        onPress={() => selectUser(user)}
                        >
                        <Image 
                            source={user.imageUrl ? { uri: user.imageUrl } : defaultUserImage} 
                            style={styles.userImage}
                        />
                        <ThemedText style={styles.userName}>{user.name}</ThemedText>
                        </TouchableOpacity>
                    ))}
                    </View>
                )}
                {!recipientId && showUserList && users.length === 0 && !isSearching && (
                    <ThemedText style={styles.noResults}>{t('createEvent.eventTypeSection.noResults')}</ThemedText>
                )}
            </View>
        )}
        </View>
    );
}; 
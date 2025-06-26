import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/themed/ThemedText';
import { useThemeColor } from '@/lib/hooks/ui';
import { verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import { CustomButton } from '@/components/custom/button';

import { EventImageSection } from '@/components/createEvent/EventImageSection';
import { EventTypeSection } from '@/components/createEvent/EventTypeSection';
import { EventEndConditions } from '@/components/createEvent/EventEndConditions';
import { GroupData, EventType } from '@/lib/types';
import { EventType as EventTypeEnum } from '@/lib/graphql/types';
import { useEventCreate } from '@/lib/hooks/events';
import { useAuth } from '@/lib/context/AuthContext';
import { ThemedView } from '@/components/themed/ThemedView';
import { useTranslation } from 'react-i18next';

export default function CreateEventScreen() {

    const { user } = useAuth();
    const { t } = useTranslation();

    const sectionBackground = useThemeColor({}, 'sectionBackground');
    const headerBackground = useThemeColor({}, 'headerBackground');
    const headerText = useThemeColor({}, 'headerText');

    const textColor = useThemeColor({}, 'text');
    const borderColor = useThemeColor({}, 'divider');
    const placeholderColor = useThemeColor({}, 'placeholder');

    const [eventType, setEventType] = useState<EventType>(EventTypeEnum.DONATION);
    const [creatorId, setCreatorId] = useState(String(user?.id));
    const [recipientId, setRecipientId] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<{ uri: string; type: string; name: string } | null>(null);
    const [groups, setGroups] = useState<GroupData[]>([
        { 
            name: t('createEvent.eventEndConditionsSection.groupNamePlaceholder'),
            conditions: []
        }
    ]);

    const { createEvent, loading } = useEventCreate();

    const handleEventTypeChange = (type: EventType) => {
        setEventType(type);
    };

    const handleRecipientChange = (id: string) => {
        setRecipientId(id);
    };

    const handleRecipientNameChange = (name: string) => {
        setRecipientName(name);
    };

    const handleImageChange = (uri: string | null, file?: { uri: string; type: string; name: string }) => {
        setImageUri(uri);
        if (file) {
        setImageFile(file);
        }
    };

    const handleSubmit = async () => {
        await createEvent({
            name,
            description,
            eventType,
            creatorId,
            recipientId,
            imageUri,
            imageFile,
            groups
        });
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        contentContainer: {
            padding: moderateScale(16),
            paddingBottom: moderateScale(100),
        },
        mainSection: {
            backgroundColor: sectionBackground,
            borderRadius: moderateScale(14),
            marginBottom: verticalScale(16),
        },
        section: {
            marginTop: moderateScale(8),
            marginBottom: moderateScale(8),
            flex: 1,
        },
        doubleSection: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: moderateScale(16),
            marginBottom: moderateScale(32),
            gap: moderateScale(32),
        },
        sectionTitle: {
            fontSize: moderateScale(18),
            fontWeight: '600',
            marginBottom: moderateScale(8),
        },
        sectionDescription: {
            fontSize: moderateScale(14),
            color: placeholderColor,
            marginBottom: moderateScale(8),
            marginTop: moderateScale(8),
            lineHeight: moderateScale(20),
        },
        input: {
            borderWidth: 1,
            borderColor: borderColor,
            borderRadius: moderateScale(8),
            padding: moderateScale(12),
            fontSize: moderateScale(16),
            color: textColor,
            backgroundColor: sectionBackground,
            marginBottom: moderateScale(16),
        },
        largeInput: {
            height: moderateScale(120),
            textAlignVertical: 'top',
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: moderateScale(16),
            width: '100%',
        },
        submitButton: {
            marginTop: moderateScale(20),
            marginBottom: moderateScale(40),
            width: '100%',
        },
    });

    return (
        <>
            <Stack.Screen 
                options={{ 
                    title: t('createEvent.title'),
                    headerShown: true,
                    headerBackTitle: t('createEvent.backTitle'),
                    headerStyle: { backgroundColor: headerBackground },
                    headerTitleStyle: { color: headerText },
                }}
            />
            <KeyboardAvoidingView style={styles.container}>
            <ThemedView style={styles.container}>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <View>
                        {/* Image */}
                        <View style={styles.doubleSection}>
                            <View style={styles.section}>
                                <ThemedText style={styles.sectionTitle}>{t('createEvent.imageTitle')}</ThemedText>
                                <EventImageSection 
                                    imageUri={imageUri}
                                    onImageChange={handleImageChange}
                                />
                            </View>
                            <View style={styles.section}>
                                <ThemedText style={styles.sectionTitle}>{t('createEvent.eventTitle')}</ThemedText>
                                <ThemedText style={styles.sectionDescription}>
                                    {t('createEvent.eventDescription')}
                                </ThemedText>
                            </View>   
                        </View>

                        {/* Event type */}
                        <View style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>{t('createEvent.eventType')}</ThemedText>
                            <EventTypeSection 
                                selectedType={eventType}
                                onTypeChange={handleEventTypeChange}
                                recipientId={recipientId}
                                onRecipientChange={handleRecipientChange}
                                recipientName={recipientName}
                                onRecipientNameChange={handleRecipientNameChange}
                            />
                        </View>
                        
                        {/* Event name */}
                        <View style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>{t('createEvent.eventName')}</ThemedText>
                            <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder={t('createEvent.eventNamePlaceholder')}
                            placeholderTextColor={placeholderColor}
                            />
                        </View>
                        
                        {/* Description */}
                        <View style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>{t('createEvent.description')}</ThemedText>
                            <TextInput
                            style={[styles.input, styles.largeInput]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder={t('createEvent.descriptionPlaceholder')}
                            placeholderTextColor={placeholderColor}
                            multiline
                            />
                        </View>
                        
                        {/* Event end conditions */}
                        <View style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>{t('createEvent.endConditions')}</ThemedText>
                            <EventEndConditions
                                groups={groups}
                                onGroupsChange={setGroups}
                            />
                        </View>
                        
                        {/* Create button */}
                        <CustomButton 
                            onPress={handleSubmit}
                            disabled={loading}
                            style={styles.submitButton}
                        >
                            {loading ? (
                            <ActivityIndicator color="white" />
                            ) : (
                            <ThemedText style={{ color: 'white', fontWeight: '600', fontSize: moderateScale(16) }}>
                                {t('createEvent.createButton')}
                            </ThemedText>
                            )}
                        </CustomButton>
                    </View>
                </ScrollView>
            </ThemedView>
        </KeyboardAvoidingView>
        </>
    );
} 
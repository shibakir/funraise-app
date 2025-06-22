import { useMutation } from '@apollo/client';
import { CREATE_EVENT, GET_EVENTS } from '@/lib/graphql';
import { CreateEventInput, Event, ConditionType, Operator } from '@/lib/graphql';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';

// Types for creating an event
interface CreateEventParams {
    name: string;
    description: string;
    eventType: string;
    creatorId: string;
    recipientId?: string;
    imageUri: string | null;
    imageFile: { uri: string; type: string; name: string } | null;
    groups: any[];
}

interface CreateEventResponse {
    success: boolean;
    event?: Event;
}

// Utilities for mapping
const mapConditionType = (uiType: string): ConditionType => {
    const mapping: Record<string, ConditionType> = {
        time: ConditionType.TIME,
        bank: ConditionType.BANK,
        participation: ConditionType.PARTICIPATION,
    };
    
    if (!mapping[uiType]) {
        throw new Error(`Unknown condition type: ${uiType}`);
    }
    
    return mapping[uiType];
};

const mapOperator = (uiOperator: string): Operator => {
    const mapping: Record<string, Operator> = {
        lt: Operator.LESS,
        lte: Operator.LESS_EQUALS,
        gt: Operator.GREATER,
        gte: Operator.GREATER_EQUALS,
        eq: Operator.EQUALS,
    };
    
    return mapping[uiOperator] || Operator.GREATER_EQUALS;
};

// Validation functions
const validateBasicFields = (params: CreateEventParams): string | null => {
    const { name, eventType, recipientId, imageUri, imageFile } = params;
    
    if (!imageUri || !imageFile) {
        return 'Please select an image for the event';
    }
    
    if (!name.trim()) {
        return 'Please enter the event name';
    }
    
    if ((eventType === 'DONATION' || eventType === 'FUNDRAISING') && !recipientId) {
        return 'For donations and fundraising, you must specify a recipient';
    }
    
    return null;
};

const validateConditions = (groups: any[]): string | null => {
    const hasValidGroups = groups.some(group => group.conditions.length > 0);
    if (!hasValidGroups) {
        return 'At least one of the condition groups must contain at least one condition';
    }

    const hasInvalidValues = groups.some(group => 
        group.conditions.some(condition => {
            if (condition.parameterName !== 'time') {
                const value = parseFloat(condition.value);
                return !isNaN(value) && value < 2;
            }
            return false;
        })
    );

    if (hasInvalidValues) {
        return 'All condition values must be at least 2';
    }
    
    return null;
};

const convertImageToBase64 = async (imageFile: { uri: string }): Promise<string> => {
    try {
        const base64 = await FileSystem.readAsStringAsync(imageFile.uri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
        console.error('Error converting image to base64:', error);
        throw new Error('Failed to process image');
    }
};

const transformConditionGroups = (groups: any[]) => {
    return groups
        .filter(group => group.conditions.length > 0)
        .map(group => ({
            conditions: group.conditions.map(cond => {
                const conditionType = mapConditionType(cond.parameterName);
                const operator = cond.parameterName === 'time' 
                    ? Operator.EQUALS 
                    : mapOperator(cond.comparisonOp || 'gte');
                
                return {
                    name: conditionType,
                    operator: operator,
                    value: cond.value
                };
            })
        }));
};

export const useEventCreate = () => {
    const [createEventMutation, { loading, error }] = useMutation(CREATE_EVENT, {
        errorPolicy: 'all',
        refetchQueries: [GET_EVENTS]
    });

    const createEvent = async (params: CreateEventParams): Promise<CreateEventResponse> => {
        const { name, description, eventType, creatorId, recipientId, imageFile, groups } = params;
        
        // Validation of basic fields
        const basicValidationError = validateBasicFields(params);
        if (basicValidationError) {
            Alert.alert('Error', basicValidationError);
            return { success: false };
        }
        
        // Validation of conditions
        const conditionsValidationError = validateConditions(groups);
        if (conditionsValidationError) {
            Alert.alert('Error', conditionsValidationError);
            return { success: false };
        }

        try {
            // Convert image to base64
            const imageBase64 = await convertImageToBase64(imageFile!);

            // Transform groups to format for GraphQL
            const eventEndConditionGroups = transformConditionGroups(groups);

            const input: CreateEventInput = {
                name: name.trim(),
                description: description.trim(),
                type: eventType as any,
                imageFile: imageBase64,
                userId: parseInt(creatorId),
                recipientId: recipientId ? parseInt(recipientId) : undefined,
                eventEndConditionGroups
            };

            const result = await createEventMutation({
                variables: { input }
            });

            if (result.data?.createEvent) {
                Alert.alert(
                    'Success',
                    'Event created successfully',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
                return { 
                    success: true, 
                    event: result.data.createEvent 
                };
            } else {
                throw new Error('Failed to create event');
            }
        } catch (err: any) {
            console.error('Error creating event:', err);
            const errorMessage = err.message || 'Failed to create event. Please try again later.';
            Alert.alert('Error', errorMessage);
            return { success: false };
        }
    };

    return { 
        createEvent, 
        loading, 
        error: error?.message || null 
    };
}; 
import { useMutation } from '@apollo/client';
import { CREATE_EVENT, GET_EVENTS } from '@/lib/graphql';
import { CreateEventInput, Event, ConditionType, Operator } from '@/lib/graphql';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';

/**
 * Input parameters for creating a new event.
 * Contains all necessary data for event creation including conditions and media.
 */
interface CreateEventParams {
    /** Display name for the event */
    name: string;
    /** Detailed description of the event */
    description: string;
    /** Type of event (DONATION, FUNDRAISING, JACKPOT) */
    eventType: string;
    /** ID of the user creating the event */
    creatorId: string;
    /** ID of the recipient user (for donations and fundraising) */
    recipientId?: string;
    /** Local URI of the selected image */
    imageUri: string | null;
    /** Image file object with metadata */
    imageFile: { uri: string; type: string; name: string } | null;
    /** Array of condition groups defining event completion criteria */
    groups: any[];
}

/**
 * Response structure for event creation operations.
 * Indicates success status and returns created event data if successful.
 */
interface CreateEventResponse {
    /** Whether the event was created successfully */
    success: boolean;
    /** Created event data (only present if success is true) */
    event?: Event;
}

/**
 * Maps UI condition types to GraphQL enum values.
 * Converts user-friendly condition names to backend-compatible types.
 * 
 * @param {string} uiType - UI condition type string
 * @returns {ConditionType} Corresponding GraphQL condition type
 * @throws {Error} When unknown condition type is provided
 */
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

/**
 * Maps UI operator strings to GraphQL enum values.
 * Converts user-friendly operator names to backend-compatible operators.
 * 
 * @param {string} uiOperator - UI operator string (lt, lte, gt, gte, eq)
 * @returns {Operator} Corresponding GraphQL operator enum
 */
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

/**
 * Validates basic event creation fields.
 * Checks required fields and business logic constraints.
 * 
 * @param {CreateEventParams} params - Event creation parameters
 * @returns {string|null} Error message if validation fails, null if valid
 */
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

/**
 * Validates event end conditions.
 * Ensures at least one condition group exists and all values are valid.
 * 
 * @param {any[]} groups - Array of condition groups
 * @returns {string|null} Error message if validation fails, null if valid
 */
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

/**
 * Converts a local image file to base64 encoded string.
 * Required for uploading images to the GraphQL API.
 * 
 * @param {Object} imageFile - Image file object with URI
 * @param {string} imageFile.uri - Local file URI
 * @returns {Promise<string>} Base64 encoded image with data URI prefix
 * @throws {Error} When file reading fails
 */
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

/**
 * Transforms UI condition groups to GraphQL format.
 * Filters out empty groups and maps condition types and operators.
 * 
 * @param {any[]} groups - UI condition groups
 * @returns {Array} Transformed condition groups for GraphQL
 */
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

/**
 * Custom hook for creating events with comprehensive validation and error handling.
 * Provides functionality to create events with images, conditions, and recipients.
 * 
 * @returns {Object} Event creation functionality and state
 * @returns {Function} createEvent - Function to create a new event
 * @returns {boolean} loading - Loading state indicator
 * @returns {string|null} error - Current error message or null
 * 
 */
export const useEventCreate = () => {
    const [createEventMutation, { loading, error }] = useMutation(CREATE_EVENT, {
        errorPolicy: 'all',
        refetchQueries: [GET_EVENTS]
    });

    /**
     * Creates a new event with validation, image processing, and condition setup.
     * Handles the complete event creation flow from validation to GraphQL mutation.
     * 
     * @param {CreateEventParams} params - Event creation parameters
     * @returns {Promise<CreateEventResponse>} Result indicating success/failure and event data
     */
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
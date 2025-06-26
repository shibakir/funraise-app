/**
 * @fileoverview Types for the FunRaise project
 * @description Contains all TypeScript types and interfaces used in the mobile application
 * 
 * This file defines types compatible with the GraphQL schema and additional client types for the mobile application.
 */

// Import GraphQL types
import {
    Event as GraphQLEvent,
    User as GraphQLUser,
    EventEndCondition as GraphQLEventEndCondition,
    EndCondition as GraphQLEndCondition,
    EventStatus,
    EventType,
    Operator
} from './graphql/types';

/**
 * Interface for related accounts of a user
 * @interface Account
 * @description Represents data about connected social accounts
 */
export interface Account {
    /** Unique account identifier */
    id: string;
    
    /** ID of the user who owns the account */
    userId: number;
    
    /** Account type (e.g., 'oauth') */
    type: string;
    
    /** Authentication provider (google, facebook, etc.) */
    provider: string;
    
    /** ID of the user in the provider system */
    providerAccountId: string;
    
    /** Name of the user in the provider system */
    providerUsername?: string;
    
    /** URL of the user's avatar */
    providerAvatar?: string;
    
    /** Email address in the provider system */
    providerEmail?: string;
    
    /** Discriminator of the user (e.g., for Discord) */
    providerDiscriminator?: string;
    
    /** Account creation date */
    createdAt: string;
}

/**
 * Main interface for events
 * @interface EventInterface 
 * @extends GraphQLEvent
 * @description Extended interface for events compatible with GraphQL schema
 */
export interface EventInterface extends Omit<GraphQLEvent, 'id'> {
    /** 
     * Unique event identifier
     * @description Supports both string and number IDs for compatibility
     */
    id: string | number;
    
    /** 
     * Progress of the event in percent
     * @description Calculated on the client, range 0-100
     * @minimum 0
     * @maximum 100
     */
    progress?: number;
}

/**
 * Main interface for users
 * @interface UserInterface
 * @extends GraphQLUser
 * @description Extended interface for users with additional client fields
 */
export interface UserInterface extends Omit<GraphQLUser, 'id'> {
    /** 
     * Unique user identifier
     * @description Supports both string and number IDs for compatibility
     */
    id: string | number;
    
    /** 
     * User activity status (email verification)
     * @description Additional field for client logic
     */
    isActive?: boolean;
    
    /** 
     * Connected social accounts
     * @description Array of connected OAuth accounts
     */
    accounts?: Account[];
}

// Event end conditions (compatible with GraphQL)
export interface EndCondition extends GraphQLEndCondition {
    parameterName?: string; // Alias for name (backward compatibility)
    comparisonOp?: string; // Alias for operator (backward compatibility)
}

export interface EventEndCondition extends GraphQLEventEndCondition {
    name?: string; // Name of the condition group
}

// Types for creating events
export interface GroupData {
    name: string;
    conditions: Array<{
        parameterName: string;
        operator: string;
        value: string;
        comparisonOp?: string;
    }>;
}

export interface EventConditionGroup {
    id?: number;
    name: string;
    isCompleted?: boolean;
    conditions: EventCondition[];
}

export interface EventCondition {
    id?: number;
    name: string;
    operator: 'EQUALS' | 'GREATER' | 'LESS' | 'GREATER_EQUALS' | 'LESS_EQUALS';
    value: string;
    isCompleted?: boolean;
    parameterName?: string;
    comparisonOp?: string;
}

export { EventStatus, EventType, Operator };

export interface EventProgress {
    eventId: number;
    currentParticipants?: number;
    targetParticipants?: number;
    currentAmount?: number;
    targetAmount?: number;
    progressPercentage: number;
}

export interface UserStats {
    totalEvents: number;
    createdEvents: number;
    participatedEvents: number;
    totalEarnings: number;
    currentBalance: number;
}

// Types for forms
export interface CreateEventForm {
    name: string;
    description: string;
    type: EventType;
    imageUrl?: string;
    eventEndConditionGroups: {
        conditions: {
        name: string;
        operator: Operator;
        value: string;
        }[];
    }[];
}

export interface CreateUserForm {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
}

export interface ParticipationForm {
    deposit: number;
    eventId: number;
    userId: number;
}

/**
 * Standard API response
 * @template T Type of data in the response
 * @interface ApiResponse
 * @description Universal interface for REST API and GraphQL responses
 */
export interface ApiResponse<T> {
    /** Response data */
    data?: T;
    
    /** Error message if an error occurred */
    error?: string;
    
    /** Loading flag for displaying spinners */
    loading?: boolean;
}

/**
 * Paginated API response
 * @template T Type of elements in the data array
 * @interface PaginatedResponse
 * @description Interface for paginated responses
 */
export interface PaginatedResponse<T> {
    /** Array of data for the current page */
    data: T[];
    
    /** Total number of elements */
    total: number;
    
    /** Current page number */
    page: number;
    
    /** Number of elements per page */
    limit: number;
    
    /** Flag indicating the presence of the next page */
    hasMore: boolean;
}

// Types of notifications
export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

// Types of filters
export interface EventFilters {
    status?: EventStatus;
    type?: EventType;
    search?: string;
    userId?: number;
    dateFrom?: Date;
    dateTo?: Date;
}

export interface UserFilters {
    search?: string;
    minBalance?: number;
    maxBalance?: number;
    isActive?: boolean;
}

// Utility
export type ID = string | number;

export interface LoadingState {
    loading: boolean;
    error?: string | null;
}

export interface ApiError {
    message: string;
    code?: string | number;
    details?: any;
}
/**
 * Types for the entire project
 * Updated for compatibility with the GraphQL schema
 * This file is used to define the types for the entire project
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

// Interface for related accounts
export interface Account {
    id: string;
    userId: number;
    type: string;
    provider: string;
    providerAccountId: string;
    providerUsername?: string;
    providerAvatar?: string;
    providerEmail?: string;
    providerDiscriminator?: string;
    createdAt: string;
}

// Main interfaces (compatible with GraphQL)
export interface EventInterface extends Omit<GraphQLEvent, 'id'> {
    id: string | number; // Support for both string and number IDs
    progress?: number; // 0-100, calculated on the client
}

export interface UserInterface extends Omit<GraphQLUser, 'id'> {
    id: string | number; // Support for both string and number IDs
    isActive?: boolean; // Additional field for the client
    accounts?: Account[]; // Related accounts
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

// API response types (REST + GraphQL)
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    loading?: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
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
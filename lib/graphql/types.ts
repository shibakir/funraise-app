/**
 * GraphQL types and interfaces based on the backend schema.
 * 
 * This module contains all TypeScript type definitions that correspond
 * to the GraphQL schema. It provides type safety for GraphQL operations
 * and ensures consistency between frontend and backend data structures.
 */

// =============================================================================
// ENUM TYPES
// =============================================================================

/** Comparison operators for event end conditions */
export enum Operator {
    EQUALS = 'EQUALS',
    GREATER = 'GREATER',
    LESS = 'LESS',
    GREATER_EQUALS = 'GREATER_EQUALS',
    LESS_EQUALS = 'LESS_EQUALS'
}

/** Types of conditions that can trigger event completion */
export enum ConditionType {
    TIME = 'TIME',
    BANK = 'BANK',
    PARTICIPATION = 'PARTICIPATION'
}

/** Possible states of an event lifecycle */
export enum EventStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    FINISHED = 'FINISHED',
    FAILED = 'FAILED'
}

/** Categories of events available in the platform */
export enum EventType {
    DONATION = 'DONATION',
    FUNDRAISING = 'FUNDRAISING',
    JACKPOT = 'JACKPOT'
}

/** Types of financial transactions in the system */
export enum TransactionType {
    BALANCE_INCOME = 'BALANCE_INCOME',
    BALANCE_OUTCOME = 'BALANCE_OUTCOME',
    EVENT_INCOME = 'EVENT_INCOME',
    EVENT_OUTCOME = 'EVENT_OUTCOME',
    GIFT = 'GIFT'
}

// =============================================================================
// CORE ENTITY TYPES
// =============================================================================

/**
 * External account linked to a user (Discord, etc.).
 * Represents OAuth integrations and third-party connections.
 */
export interface Account {
    /** Unique account identifier */
    id: string;
    /** ID of the user this account belongs to */
    userId: number;
    /** Account type identifier */
    type: string;
    /** OAuth provider name (e.g., 'discord') */
    provider: string;
    /** Provider's unique identifier for this account */
    providerAccountId: string;
    /** Username on the external platform */
    providerUsername?: string;
    /** Profile picture URL from the external platform */
    providerAvatar?: string;
    /** Email address from the external platform */
    providerEmail?: string;
    /** Discord discriminator (if applicable) */
    providerDiscriminator?: string;
    /** Account creation timestamp */
    createdAt?: string;
}

/**
 * User entity representing a platform user.
 * Contains profile information, balance, and relationships to events and achievements.
 */
export interface User {
    /** Unique user identifier */
    id: number;
    /** User's display name */
    username: string;
    /** User's email address */
    email: string;
    /** Current user balance */
    balance: number;
    /** Profile image URL */
    image?: string;
    /** Whether the user's account is activated */
    isActivated?: boolean;
    /** Account creation timestamp */
    createdAt?: string;
    /** Linked external accounts */
    accounts?: Account[];
    /** Events user is participating in */
    events?: Event[];
    /** Events created by this user */
    createdEvents?: Event[];
    /** Events where this user is the recipient */
    receivedEvents?: Event[];
    /** User's participation records */
    participations?: Participation[];
    /** User's achievement progress */
    achievements?: UserAchievement[];
}

/**
 * Event entity representing fundraising events, donations, or jackpots.
 * Contains event details, financial information, and completion conditions.
 */
export interface Event {
    /** Unique event identifier */
    id: number;
    /** Event display name */
    name: string;
    /** Event description */
    description?: string;
    /** Total amount in the event bank */
    bankAmount?: number;
    /** Current event status */
    status: EventStatus;
    /** Type of event */
    type: EventType;
    /** Event cover image URL */
    imageUrl?: string;
    /** ID of user who created the event */
    userId?: number;
    /** ID of user who will receive funds (if applicable) */
    recipientId?: number;
    /** User who created the event */
    creator?: User;
    /** User who will receive funds */
    recipient?: User;
    /** Conditions that must be met for event completion */
    endConditions?: EventEndCondition[];
    /** User participation records for this event */
    participations?: Participation[];
}

/**
 * User participation in an event.
 * Tracks financial contributions and participation details.
 */
export interface Participation {
    /** Unique participation identifier */
    id: number;
    /** Amount deposited by the user */
    deposit: number;
    /** ID of participating user */
    userId: number;
    /** ID of the event */
    eventId: number;
    /** User who is participating */
    user?: User;
    /** Event being participated in */
    event?: Event;
    /** Participation creation timestamp */
    createdAt?: string;
    /** Last update timestamp */
    updatedAt?: string;
}

/**
 * Financial transaction record.
 * Tracks all monetary movements in the system.
 */
export interface Transaction {
    /** Unique transaction identifier */
    id: number;
    /** Transaction amount (positive or negative) */
    amount: number;
    /** Type of transaction */
    type: TransactionType;
    /** ID of user involved in the transaction */
    userId: number;
    /** Transaction creation timestamp */
    createdAt?: string;
    /** Last update timestamp */
    updatedAt?: string;
}

// =============================================================================
// EVENT CONDITION TYPES
// =============================================================================

/**
 * Group of conditions that must be met for event completion.
 * Represents a set of related conditions with completion status.
 */
export interface EventEndCondition {
    /** Unique condition group identifier */
    id: number;
    /** Whether all conditions in this group are completed */
    isCompleted: boolean;
    /** Whether this condition group has failed */
    isFailed: boolean;
    /** Individual conditions within this group */
    conditions?: EndCondition[];
}

/**
 * Individual condition within an event end condition group.
 * Defines specific criteria that must be met for event completion.
 */
export interface EndCondition {
    /** Unique condition identifier */
    id: number;
    /** Type of condition (time, bank amount, participation count) */
    name: ConditionType;
    /** Comparison operator for the condition */
    operator: Operator;
    /** Target value for the condition */
    value: string;
    /** Whether this specific condition is completed */
    isCompleted: boolean;
}

// =============================================================================
// ACHIEVEMENT SYSTEM TYPES
// =============================================================================

/**
 * User's progress on a specific achievement.
 * Tracks completion status and unlocking timestamp.
 */
export interface UserAchievement {
    /** Unique user achievement identifier */
    id: number;
    /** ID of the user */
    userId: number;
    /** ID of the achievement */
    achievementId: number;
    /** Current status of the achievement */
    status: string;
    /** Timestamp when achievement was unlocked (null if not unlocked) */
    unlockedAt?: string | null;
    /** Achievement definition */
    achievement: Achievement;
    /** Progress on individual criteria */
    progress: UserCriterionProgress[];
}

/**
 * Achievement definition with metadata.
 * Represents an unlockable achievement in the system.
 */
export interface Achievement {
    /** Unique achievement identifier */
    id: number;
    /** Achievement display name */
    name: string;
    /** Icon URL for the achievement */
    iconUrl?: string;
}

/**
 * User's progress on a specific achievement criterion.
 * Tracks current progress value and completion status.
 */
export interface UserCriterionProgress {
    /** Unique progress record identifier */
    id: number;
    /** Current progress value */
    currentValue: number;
    /** Whether this criterion is completed */
    isCompleted: boolean;
    /** The criterion being tracked */
    criterion: AchievementCriterion;
}

/**
 * Individual criterion within an achievement.
 * Defines specific requirements for achievement completion.
 */
export interface AchievementCriterion {
    /** Unique criterion identifier */
    id: number;
    /** Type of criteria being measured */
    criteriaType: string;
    /** Target value for criterion completion */
    criteriaValue: number;
    /** Human-readable description of the criterion */
    description: string;
}

// =============================================================================
// QUERY ARGUMENT TYPES
// =============================================================================

/** Arguments for fetching a single event */
export interface GetEventArgs {
    /** Event ID to fetch */
    id: number;
}

/** Arguments for fetching a single user */
export interface GetUserArgs {
    /** User ID to fetch */
    id: number;
}

/** Arguments for searching users by username */
export interface SearchUsersArgs {
    /** Username search query */
    username: string;
}

/** Arguments for fetching user achievements */
export interface GetUserAchievementsArgs {
    /** User ID to fetch achievements for */
    userId: number;
}

// =============================================================================
// MUTATION INPUT TYPES
// =============================================================================

/**
 * Input data for creating a new event.
 * Contains all necessary information for event setup.
 */
export interface CreateEventInput {
    /** Event name */
    name: string;
    /** Event description */
    description?: string;
    /** Type of event to create */
    type: EventType;
    /** Base64 encoded image file */
    imageFile: string;
    /** ID of user creating the event */
    userId: number;
    /** ID of recipient user (for donations) */
    recipientId?: number;
    /** Groups of end conditions for the event */
    eventEndConditionGroups: EventEndConditionInput[];
}

/**
 * Input data for creating event end condition groups.
 * Groups related conditions together for logical evaluation.
 */
export interface EventEndConditionInput {
    /** Conditions within this group */
    conditions: EndConditionInput[];
}

/**
 * Input data for individual end conditions.
 * Defines specific completion criteria.
 */
export interface EndConditionInput {
    /** Condition name/type */
    name: string;
    /** Comparison operator */
    operator: Operator;
    /** Target value for comparison */
    value: string;
}

/**
 * Input data for creating or updating event participation.
 * Used for both new participations and deposit updates.
 */
export interface UpsertParticipationInput {
    /** ID of participating user */
    userId: number;
    /** ID of target event */
    eventId: number;
    /** Deposit amount */
    deposit: number;
}

/**
 * Result data from participation upsert operation.
 * Contains participation details and associated transaction.
 */
export interface ParticipationResult {
    /** The participation record */
    participation: Participation;
    /** Whether this was a new participation or update */
    isNewParticipation: boolean;
    /** Associated financial transaction */
    transaction: Transaction;
}

// =============================================================================
// RESPONSE TYPES
// =============================================================================

/** Response type for single event queries */
export interface EventResponse {
    /** The requested event or null if not found */
    event: Event | null;
}

/** Response type for multiple events queries */
export interface EventsResponse {
    /** Array of events */
    events: Event[];
}

/** Response type for single user queries */
export interface UserResponse {
    /** The requested user or null if not found */
    user: User | null;
}

/** Response type for user search queries */
export interface SearchUsersResponse {
    /** Array of matching users */
    searchUsers: User[];
}

/** Response type for user achievements queries */
export interface UserAchievementsResponse {
    /** Array of user achievement records */
    userAchievements: UserAchievement[];
}

/**
 * Authentication response containing tokens and user data.
 * Returned by login, registration, and token refresh operations.
 */
export interface AuthResponse {
    /** JWT access token for API authentication */
    accessToken: string;
    /** Refresh token for obtaining new access tokens */
    refreshToken: string;
    /** Complete user profile data */
    user: User;
} 
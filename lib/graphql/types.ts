/**
 * GraphQL types based on the backend schema
 */

// Enum types
export enum Operator {
    EQUALS = 'EQUALS',
    GREATER = 'GREATER',
    LESS = 'LESS',
    GREATER_EQUALS = 'GREATER_EQUALS',
    LESS_EQUALS = 'LESS_EQUALS'
}

export enum ConditionType {
    TIME = 'TIME',
    BANK = 'BANK',
    PARTICIPATION = 'PARTICIPATION'
}

export enum EventStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    FINISHED = 'FINISHED',
    FAILED = 'FAILED'
}

export enum EventType {
    DONATION = 'DONATION',
    FUNDRAISING = 'FUNDRAISING',
    JACKPOT = 'JACKPOT'
}

export enum TransactionType {
    BALANCE_INCOME = 'BALANCE_INCOME',
    BALANCE_OUTCOME = 'BALANCE_OUTCOME',
    EVENT_INCOME = 'EVENT_INCOME',
    EVENT_OUTCOME = 'EVENT_OUTCOME',
    GIFT = 'GIFT'
}

// Main types
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
    createdAt?: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    balance: number;
    image?: string;
    isActivated?: boolean;
    createdAt?: string;
    accounts?: Account[];
    events?: Event[];
    createdEvents?: Event[];
    receivedEvents?: Event[];
    participations?: Participation[];
    achievements?: UserAchievement[];
}

export interface Event {
    id: number;
    name: string;
    description?: string;
    bankAmount?: number;
    status: EventStatus;
    type: EventType;
    imageUrl?: string;
    userId?: number;
    recipientId?: number;
    creator?: User;
    recipient?: User;
    endConditions?: EventEndCondition[];
    participations?: Participation[];
}

export interface Participation {
    id: number;
    deposit: number;
    userId: number;
    eventId: number;
    user?: User;
    event?: Event;
    createdAt?: string;
    updatedAt?: string;
}

export interface Transaction {
    id: number;
    amount: number;
    type: TransactionType;
    userId: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface EventEndCondition {
    id: number;
    isCompleted: boolean;
    isFailed: boolean;
    conditions?: EndCondition[];
}

export interface EndCondition {
    id: number;
    name: ConditionType;
    operator: Operator;
    value: string;
    isCompleted: boolean;
}

// Types for achievements
export interface UserAchievement {
    id: number;
    userId: number;
    achievementId: number;
    status: string;
    unlockedAt?: string | null;
    achievement: Achievement;
    progress: UserCriterionProgress[];
}

export interface Achievement {
    id: number;
    name: string;
    iconUrl?: string;
}

export interface UserCriterionProgress {
    id: number;
    currentValue: number;
    isCompleted: boolean;
    criterion: AchievementCriterion;
}

export interface AchievementCriterion {
    id: number;
    criteriaType: string;
    criteriaValue: number;
    description: string;
}

// Query types
export interface GetEventArgs {
    id: number;
}

export interface GetUserArgs {
    id: number;
}

export interface SearchUsersArgs {
    username: string;
}

// Types for mutations (if any are added)
export interface CreateEventInput {
    name: string;
    description?: string;
    type: EventType;
    imageFile: string; // base64 string
    userId: number;
    recipientId?: number;
    eventEndConditionGroups: EventEndConditionInput[];
}

export interface EventEndConditionInput {
    conditions: EndConditionInput[];
}

export interface EndConditionInput {
    name: string;
    operator: Operator;
    value: string;
}

export interface UpsertParticipationInput {
    userId: number;
    eventId: number;
    deposit: number;
}

export interface ParticipationResult {
    participation: Participation;
    isNewParticipation: boolean;
    transaction: Transaction;
}

// Response types
export interface EventResponse {
    event: Event | null;
}

export interface EventsResponse {
    events: Event[];
}

export interface UserResponse {
    user: User | null;
}

export interface SearchUsersResponse {
    searchUsers: User[];
}

export interface UserAchievementsResponse {
    userAchievements: UserAchievement[];
}

export interface GetUserAchievementsArgs {
    userId: number;
}

// Auth response types
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
} 
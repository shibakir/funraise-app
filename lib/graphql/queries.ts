import { gql } from '@apollo/client';

/**
 * GraphQL queries, mutations and subscriptions for the application.
 * 
 * This module contains all GraphQL operations used throughout the app,
 * including authentication, user management, events, and real-time subscriptions.
 * Operations are organized by functionality for better maintainability.
 */

// =============================================================================
// AUTHENTICATION MUTATIONS
// =============================================================================

/**
 * Login mutation for email/password authentication.
 * Returns access token, refresh token, and complete user data with accounts.
 */
export const LOGIN_MUTATION = gql`
    mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            accessToken
            refreshToken
            user {
                id
                username
                email
                balance
                image
                isActivated
                createdAt
                accounts {
                    id
                    provider
                    providerUsername
                    providerAvatar
                    providerEmail
                    providerDiscriminator
                }
            }
        }
    }
`;

/**
 * Registration mutation for creating new user accounts.
 * Returns authentication tokens and user data upon successful registration.
 */
export const REGISTER_MUTATION = gql`
    mutation Register($username: String!, $email: String!, $password: String!) {
        register(username: $username, email: $email, password: $password) {
            accessToken
            refreshToken
            user {
                id
                username
                email
                balance
                image
                isActivated
                createdAt
                accounts {
                    id
                    provider
                    providerUsername
                    providerAvatar
                    providerEmail
                    providerDiscriminator
                }
            }
        }
    }
`;

/**
 * Discord authentication mutation using Discord access token.
 * Used for direct Discord token authentication flow.
 */
export const DISCORD_AUTH_MUTATION = gql`
    mutation DiscordAuth($accessToken: String!) {
        discordAuth(accessToken: $accessToken) {
            accessToken
            refreshToken
            user {
                id
                username
                email
                balance
                image
                isActivated
                createdAt
                accounts {
                    id
                    provider
                    providerUsername
                    providerAvatar
                    providerEmail
                    providerDiscriminator
                }
            }
        }
    }
`;

/**
 * Discord OAuth authentication using authorization code.
 * Used in the complete OAuth flow with PKCE support.
 */
export const DISCORD_AUTH_CODE_MUTATION = gql`
    mutation DiscordAuthCode($code: String!, $redirectUri: String!, $codeVerifier: String) {
        discordAuthCode(code: $code, redirectUri: $redirectUri, codeVerifier: $codeVerifier) {
            accessToken
            refreshToken
            user {
                id
                username
                email
                balance
                image
                isActivated
                createdAt
                accounts {
                    id
                    provider
                    providerUsername
                    providerAvatar
                    providerEmail
                    providerDiscriminator
                }
            }
        }
    }
`;

/**
 * Token refresh mutation for extending authentication sessions.
 * Exchanges a valid refresh token for new access and refresh tokens.
 */
export const REFRESH_TOKEN_MUTATION = gql`
    mutation RefreshToken($refreshToken: String!) {
        refreshToken(refreshToken: $refreshToken) {
            accessToken
            refreshToken
            user {
                id
                username
                email
                balance
                image
                isActivated
                createdAt
                accounts {
                    id
                    provider
                    providerUsername
                    providerAvatar
                    providerEmail
                    providerDiscriminator
                }
            }
        }
    }
`;

/**
 * Logout mutation for invalidating refresh tokens on the server.
 * Ensures proper session termination and security.
 */
export const LOGOUT_MUTATION = gql`
    mutation Logout($refreshToken: String!) {
        logout(refreshToken: $refreshToken)
    }
`;

/**
 * Links a Discord account to an existing authenticated user.
 * Used for connecting Discord profile to current user account.
 */
export const LINK_DISCORD_ACCOUNT_MUTATION = gql`
    mutation LinkDiscordAccount($code: String!, $redirectUri: String!, $codeVerifier: String) {
        linkDiscordAccount(code: $code, redirectUri: $redirectUri, codeVerifier: $codeVerifier) {
            success
            message
            user {
                id
                username
                email
                balance
                image
                isActivated
                createdAt
                accounts {
                    id
                    provider
                    providerUsername
                    providerAvatar
                    providerEmail
                    providerDiscriminator
                }
            }
        }
    }
`;

// =============================================================================
// EVENT QUERIES
// =============================================================================

/**
 * Query to fetch a single event by ID.
 * Returns complete event details including creator, recipient, and end conditions.
 */
export const GET_EVENT = gql`
    query GetEvent($id: Int!) {
        event(id: $id) {
            id
            name
            description
            bankAmount
            status
            type
            imageUrl
            userId
            recipientId
            creator {
                id
                username
                email
                balance
                image
            }
            recipient {
                id
                username
                email
                balance
                image
            }
            endConditions {
                id
                isCompleted
                isFailed
                conditions {
                    id
                    name
                    operator
                    value
                    isCompleted
                }
            }
        }
    }
`;

/**
 * Query to fetch all events in the system.
 * Returns a list of events with their basic information and end conditions.
 */
export const GET_EVENTS = gql`
    query GetEvents {
        events {
        id
        name
        description
        bankAmount
        status
        type
        imageUrl
        userId
        recipientId
        endConditions {
            id
            isCompleted
            isFailed
            conditions {
            id
            name
            operator
            value
            isCompleted
            }
        }
        }
    }
`;

// =============================================================================
// USER QUERIES
// =============================================================================

/**
 * Query to fetch complete user profile by ID.
 * Includes all user events, participations, and related data.
 */
export const GET_USER = gql`
    query GetUser($id: Int!) {
        user(id: $id) {
        id
        username
        email
        balance
        image
        createdAt
        events {
            id
            name
            status
            type
            imageUrl
            endConditions {
                id
                isCompleted
                isFailed
                conditions {
                    id
                    name
                    operator
                    value
                    isCompleted
                }
            }
        }
        createdEvents {
            id
            name
            status
            type
            imageUrl
            bankAmount
            endConditions {
                id
                isCompleted
                isFailed
                conditions {
                    id
                    name
                    operator
                    value
                    isCompleted
                }
            }
        }
        receivedEvents {
            id
            name
            status
            type
            imageUrl
            bankAmount
            endConditions {
                id
                isCompleted
                isFailed
                conditions {
                    id
                    name
                    operator
                    value
                    isCompleted
                }
            }
        }
        participations {
            id
            deposit
            userId
            eventId
            event {
                id
                name
                status
                type
                imageUrl
                bankAmount
                endConditions {
                    id
                    isCompleted
                    isFailed
                    conditions {
                        id
                        name
                        operator
                        value
                        isCompleted
                    }
                }
            }
        }
        }
    }
`;

/**
 * Query to search users by username with fuzzy matching.
 * Returns basic user information for search results.
 */
export const SEARCH_USERS = gql`
    query SearchUsers($username: String!) {
        searchUsers(username: $username) {
            id
            username
            email
            balance
        }
    }
`;

/**
 * Query to get user's participation in a specific event.
 * Returns participation details if user is participating in the event.
 */
export const GET_USER_PARTICIPATION = gql`
    query GetUserParticipation($userId: Int!, $eventId: Int!) {
        userParticipation(userId: $userId, eventId: $eventId) {
            id
            deposit
            userId
            eventId
        }
    }
`;

/**
 * Query to fetch current user balance.
 * Returns the numerical balance for the specified user.
 */
export const GET_USER_BALANCE = gql`
    query GetUserBalance($userId: Int!) {
        userBalance(userId: $userId)
    }
`;

/**
 * Query to fetch user achievements and progress.
 * Returns achievement data with completion status and progress tracking.
 */
export const GET_USER_ACHIEVEMENTS = gql`
    query GetUserAchievements($userId: Int!) {
        userAchievements(userId: $userId) {
            id
            userId
            achievementId
            status
            unlockedAt
            achievement {
                id
                name
                iconUrl
            }
            progress {
                id
                currentValue
                isCompleted
                criterion {
                    id
                    criteriaType
                    criteriaValue
                    description
                }
            }
        }
    }
`;

/**
 * Query to get users ranked by their current balance.
 * Returns users sorted by balance in descending order.
 */
export const GET_USERS_BY_BALANCE = gql`
    query GetUsersByBalance($limit: Int) {
        usersByBalance(limit: $limit) {
            id
            username
            amount
        }
    }
`;

/**
 * Query to get users ranked by their EVENT_INCOME transaction sum after specified date.
 * Returns users sorted by income in descending order.
 */
export const GET_USERS_BY_EVENT_INCOME = gql`
    query GetUsersByEventIncome($afterDate: String, $limit: Int) {
        usersByEventIncome(afterDate: $afterDate, limit: $limit) {
            id
            username
            amount
        }
    }
`;

/**
 * Query to get users ranked by their EVENT_OUTCOME transaction sum after specified date.
 * Returns users sorted by outcome in descending order.
 */
export const GET_USERS_BY_EVENT_OUTCOME = gql`
    query GetUsersByEventOutcome($afterDate: String, $limit: Int) {
        usersByEventOutcome(afterDate: $afterDate, limit: $limit) {
            id
            username
            amount
        }
    }
`;

// =============================================================================
// EVENT AND PARTICIPATION MUTATIONS
// =============================================================================

/**
 * Mutation to create a new event.
 * Accepts complete event configuration including end conditions and participants.
 */
export const CREATE_EVENT = gql`
    mutation CreateEvent($input: CreateEventInput!) {
        createEvent(input: $input) {
            id
            name
            description
            bankAmount
            status
            type
            imageUrl
            userId
            recipientId
            creator {
                id
                username
                email
                balance
                image
            }
            recipient {
                id
                username
                email
                balance
                image
            }
            endConditions {
                id
                isCompleted
                isFailed
                conditions {
                    id
                    name
                    operator
                    value
                    isCompleted
                }
            }
        }
    }
`;

/**
 * Mutation to create financial transactions.
 * Handles balance changes, event deposits, and transfers.
 */
export const CREATE_TRANSACTION = gql`
    mutation CreateTransaction($input: CreateTransactionInput!) {
        createTransaction(input: $input) {
            id
            amount
            type
            userId
        }
    }
`;

/**
 * Mutation to create or update user participation in an event.
 * Handles both new participations and deposit updates for existing ones.
 */
export const UPSERT_PARTICIPATION = gql`
    mutation UpsertParticipation($input: UpsertParticipationInput!) {
        upsertParticipation(input: $input) {
            participation {
                id
                deposit
                userId
                eventId
                user {
                    id
                    username
                    balance
                }
                event {
                    id
                    name
                    bankAmount
                }
            }
            isNewParticipation
            transaction {
                id
                amount
                type
                userId
            }
        }
    }
`;

/**
 * Mutation to update user profile information.
 * Allows modification of username, email, balance, and profile image.
 */
export const UPDATE_USER = gql`
    mutation UpdateUser($id: Int!, $input: UpdateUserInput!) {
        updateUser(id: $id, input: $input) {
            id
            username
            email
            balance
            image
        }
    }
`;

// =============================================================================
// REAL-TIME SUBSCRIPTIONS
// =============================================================================

/**
 * Subscription for real-time event updates.
 * Notifies clients when event status, conditions, or bank amount changes.
 */
export const EVENT_UPDATED_SUBSCRIPTION = gql`
    subscription EventUpdated($eventId: Int!) {
        eventUpdated(eventId: $eventId) {
            id
            name
            description
            bankAmount
            status
            type
            imageUrl
            userId
            recipientId
            creator {
                id
                username
                email
                balance
                image
            }
            recipient {
                id
                username
                email
                balance
                image
            }
            endConditions {
                id
                isCompleted
                isFailed
                conditions {
                    id
                    name
                    operator
                    value
                    isCompleted
                }
            }
        }
    }
`;

/**
 * Subscription for new participations in an event.
 * Notifies when users join events or make initial deposits.
 */
export const PARTICIPATION_CREATED_SUBSCRIPTION = gql`
    subscription ParticipationCreated($eventId: Int!) {
        participationCreated(eventId: $eventId) {
            id
            deposit
            userId
            eventId
            user {
                id
                username
                balance
            }
            event {
                id
                name
                bankAmount
            }
        }
    }
`;

/**
 * Subscription for participation updates.
 * Notifies when users change their deposit amounts in events.
 */
export const PARTICIPATION_UPDATED_SUBSCRIPTION = gql`
    subscription ParticipationUpdated($eventId: Int!) {
        participationUpdated(eventId: $eventId) {
            id
            deposit
            userId
            eventId
            user {
                id
                username
                balance
            }
            event {
                id
                name
                bankAmount
            }
        }
    }
`;

/**
 * Subscription for user balance changes.
 * Provides real-time updates when user's balance is modified.
 */
export const BALANCE_UPDATED_SUBSCRIPTION = gql`
    subscription BalanceUpdated($userId: Int!) {
        balanceUpdated(userId: $userId) {
            id
            username
            email
            balance
            image
        }
    }
`;

/**
 * Subscription for event condition updates.
 * Notifies when event end conditions are checked or completed.
 */
export const EVENT_CONDITIONS_UPDATED_SUBSCRIPTION = gql`
    subscription EventConditionsUpdated($eventId: Int!) {
        eventConditionsUpdated(eventId: $eventId) {
            id
            isCompleted
            isFailed
            conditions {
                id
                name
                operator
                value
                isCompleted
            }
        }
    }
`; 
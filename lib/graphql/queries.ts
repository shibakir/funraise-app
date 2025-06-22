import { gql } from '@apollo/client';

/**
 * GraphQL queries, mutations and subscriptions
 */

// Authentication mutations
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

export const LOGOUT_MUTATION = gql`
    mutation Logout($refreshToken: String!) {
        logout(refreshToken: $refreshToken)
    }
`;

// Get event by ID
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

// Get all events
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

// Get user by ID
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
        }
    }
`;

// Search users by username
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

// Get user participation in an event
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

// Get user balance
export const GET_USER_BALANCE = gql`
    query GetUserBalance($userId: Int!) {
        userBalance(userId: $userId)
    }
`;

// Get user achievements
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

// Create event
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

// Create transaction
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

// Create or update participation (single operation)
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

// Update user profile
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

/**
 * GraphQL Subscriptions (Subscriptions)
 */

// Subscription for event updates
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

// Subscription for new participations
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

// Subscription for participation updates
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

// Subscription for user balance updates
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

// Subscription for event conditions updates
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

// Mutation to link a Discord account
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
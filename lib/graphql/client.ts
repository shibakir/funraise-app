import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import * as SecureStore from 'expo-secure-store';
import { router } from "expo-router";
import { Observable } from '@apollo/client/utilities';
import { REFRESH_TOKEN_MUTATION } from './queries';

/**
 * Simple Apollo Client configuration for GraphQL
 * 
 * This file contains the configuration for the Apollo Client, which is used to interact with the GraphQL server.
 * It includes the configuration for the HTTP and WebSocket links, as well as the configuration for the cache.
 * 
 * The Apollo Client is used to fetch data from the GraphQL server and to execute mutations.
 * 
 */

// Helper functions for token management (to avoid circular dependency)
const refreshTokenFlow = async (): Promise<boolean> => {
    try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        
        if (!refreshToken) {
            //console.log('No refresh token found');
            return false;
        }

        // Create a temporary HTTP client for token refresh to avoid circular dependency
        const tempClient = new ApolloClient({
            link: createHttpLink({ uri: process.env.FUNRAISE_API_URL || 'http://localhost:3000/graphql' }),
            cache: new InMemoryCache(),
        });

        const response = await tempClient.mutate({
            mutation: REFRESH_TOKEN_MUTATION,
            variables: { refreshToken }
        });

        if (response.data?.refreshToken) {
            // Save new tokens
            await SecureStore.setItemAsync('accessToken', response.data.refreshToken.accessToken);
            await SecureStore.setItemAsync('refreshToken', response.data.refreshToken.refreshToken);
            await SecureStore.setItemAsync('user', JSON.stringify(response.data.refreshToken.user));
            
            //console.log('Token refreshed successfully');
            return true;
        }
        
        return false;
    } catch (error: any) {
        //console.error('Token refresh error:', error);
        return false;
    }
};

const clearAuthData = async (): Promise<void> => {
    try {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('user');
        //console.log('Auth data cleared');
    } catch (error) {
        //console.error('Error clearing auth data:', error);
    }
};

// Flag to prevent multiple token updates
let isRefreshingToken = false;

// HTTP link to the GraphQL server
const httpLink = createHttpLink({
    uri: process.env.FUNRAISE_API_URL || 'http://localhost:3000/graphql',
});

// Function to create a WebSocket link without authentication
const createWebSocketLink = () => {
    return new GraphQLWsLink(createClient({
        url: process.env.FUNRAISE_WEBSOCKET_URL || 'ws://localhost:3000/graphql',
        connectionParams: () => {
            // WebSocket connections don't require authentication
            //console.log('WebSocket connecting without authentication...');
            return {};
        },
        lazy: true,
        retryAttempts: 5,
        retryWait: async (retries) => {
            //console.log(`WebSocket retry attempt ${retries}...`);
            return new Promise(resolve => setTimeout(resolve, 500 * retries));
        },
        on: {
            error: (error) => {
                //console.error('WebSocket error:', error);
            },
            closed: (event) => {
                //console.log('WebSocket closed:', event);
            },
        },
    }));
};

// WebSocket link for subscriptions
const wsLink = createWebSocketLink();

// Split between HTTP and WebSocket
const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    wsLink, // WebSocket for subscriptions
    httpLink, // HTTP for regular requests
);

// Context to add the authorization token
const authLink = setContext(async (_, { headers }) => {
    const token = await SecureStore.getItemAsync('accessToken');
    
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
        }
    };
});

// Error handling with automatic token refresh
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    //console.log(`ERROR LINK TRIGGERED for operation: ${operation.operationName}`);
    
    // Log errors for debugging
    /*
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => {
            console.error(`GraphQL error: ${message}, Path: ${path}`);
        });
    }
    if (networkError) {
        console.error(`Network error: ${networkError.message}, Status: ${(networkError as any).statusCode}`);
    }
    */

    const hasAuthError = graphQLErrors?.some(error =>
        error.message.includes('Unauthorized') ||
        error.message.includes('Invalid token') ||
        error.message.includes('Token expired') ||
        error.message.includes('Authentication required') ||
        error.message.includes('Invalid or expired token')
    );

    const isNetworkAuthError = networkError && 'statusCode' in networkError && 
        (networkError as any).statusCode === 401;

    // If there is an authorization error and not already refreshing, try to update the token
    if ((hasAuthError || isNetworkAuthError) && !isRefreshingToken) {
       // console.log(`AUTH ERROR DETECTED! Starting token refresh process...`);
        isRefreshingToken = true;

        return new Observable(observer => {
            //console.log(`Calling token refresh...`);
            refreshTokenFlow()
                .then(async (refreshed) => {
                    if (refreshed) {
                        //console.log('Token refreshed successfully, retrying operation...');
                        
                        // Get a new token for the retry request
                        const newToken = await SecureStore.getItemAsync('accessToken');
                        
                        // Update the authorization header for the retry request
                        const oldHeaders = operation.getContext().headers;
                        operation.setContext({
                            headers: {
                                ...oldHeaders,
                                authorization: newToken ? `Bearer ${newToken}` : '',
                            },
                        });

                        // Retry the operation with the new token
                        forward(operation).subscribe({
                            next: (result) => {
                                observer.next(result);
                                observer.complete();
                            },
                            error: (error) => {
                                observer.error(error);
                            },
                            complete: () => {
                                observer.complete();
                            }
                        });
                    } else {
                        // If the token refresh fails, clear data and redirect to login
                        //console.log('Failed to refresh token, redirecting to login');
                        clearAuthData().then(() => {
                            router.replace('/(auth)/login');
                        });
                        observer.error(new Error('Authentication failed'));
                    }
                })
                .catch((error) => {
                    //console.error('Token refresh failed:', error);
                    clearAuthData().then(() => {
                        router.replace('/(auth)/login');
                    });
                    observer.error(error);
                })
                .finally(() => {
                    isRefreshingToken = false;
                });
        });
    }
    
    // For non-auth errors or when refresh is already in progress, pass the error through
    return;
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
    link: from([errorLink, authLink, splitLink]),
    cache: new InMemoryCache({
        typePolicies: {
            User: {
                fields: {
                    events: {
                        merge(existing = [], incoming) {
                            return incoming;
                        },
                    },
                    createdEvents: {
                        merge(existing = [], incoming) {
                            return incoming;
                        },
                    },
                    receivedEvents: {
                        merge(existing = [], incoming) {
                            return incoming;
                        },
                    },
                },
            },
            Event: {
                fields: {
                    endConditions: {
                        merge(existing = [], incoming) {
                            return incoming;
                        },
                    },
                },
            },
            EventEndCondition: {
                fields: {
                    conditions: {
                        merge(existing = [], incoming) {
                            return incoming;
                        },
                    },
                },
            },
        },
    }),
    defaultOptions: {
        watchQuery: {
            errorPolicy: 'all',
            notifyOnNetworkStatusChange: true,
        },
        query: {
            errorPolicy: 'all',
        },
        mutate: {
            errorPolicy: 'all',
        },
    },
});

// Utilities for working with the cache
export const clearCache = () => {
    apolloClient.cache.reset();
};

export const refetchQueries = (queries: string[]) => {
    apolloClient.refetchQueries({
        include: queries,
    });
};

// Export the client for compatibility
export const client = apolloClient;

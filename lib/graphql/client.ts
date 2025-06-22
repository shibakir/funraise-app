import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import * as SecureStore from 'expo-secure-store';
import { router } from "expo-router";
import AuthService from "@/services/AuthService";
import { Observable } from '@apollo/client/utilities';

/**
 * Simple Apollo Client configuration for GraphQL
 * 
 * This file contains the configuration for the Apollo Client, which is used to interact with the GraphQL server.
 * It includes the configuration for the HTTP and WebSocket links, as well as the configuration for the cache.
 * 
 * The Apollo Client is used to fetch data from the GraphQL server and to execute mutations.
 * 
 */

// Flag to prevent multiple token updates
let isRefreshingToken = false;

// HTTP link to the GraphQL server
const httpLink = createHttpLink({
    uri: 'http://localhost:3000/graphql',
});

// Function to create a WebSocket link with an actual token
const createWebSocketLink = () => {
    return new GraphQLWsLink(createClient({
        url: 'ws://localhost:3000/graphql',
        connectionParams: async () => {
            try {
                // Always try to update the token before WebSocket connection
                await AuthService.refreshTokenIfNeeded();
                const { accessToken } = await AuthService.getTokens();
                console.log(`WebSocket connecting with fresh token: ${accessToken?.substring(0, 20)}...`);
                return {
                    authorization: accessToken ? `Bearer ${accessToken}` : '',
                };
            } catch (error) {
                console.error('Error getting token for WebSocket:', error);
                return { authorization: '' };
            }
        },
        lazy: true,
        retryAttempts: 5, // More attempts
        retryWait: async (retries) => {
            console.log(`WebSocket retry attempt ${retries}, refreshing token...`);
            // Before each attempt, update the token
            await AuthService.refreshTokenIfNeeded();
            return new Promise(resolve => setTimeout(resolve, 1000 * retries));
        },
        on: {
            error: (error) => {
                console.error('WebSocket error:', error);
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
    console.log(`ERROR LINK TRIGGERED for operation: ${operation.operationName}`);
    
    // Log errors
    /*
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => {
            //console.error(`GraphQL error: ${message}, Path: ${path}`);
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
        error.message.includes('Authentication required')
    );

    const isNetworkAuthError = networkError && 'statusCode' in networkError && 
        (networkError as any).statusCode === 401;

    // If there is an authorization error, try to update the token
    if ((hasAuthError || isNetworkAuthError) && !isRefreshingToken) {
        //console.log(`AUTH ERROR DETECTED! Starting token refresh process...`);
        isRefreshingToken = true;

        return new Observable(observer => {
            //console.log(`Calling AuthService.refreshTokenIfNeeded()...`);
            AuthService.refreshTokenIfNeeded()
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
                        // If the token refresh fails, redirect to login
                        //console.log('Failed to refresh token, redirecting to login');
                        AuthService.logout().then(() => {
                            router.replace('/(auth)/login');
                        });
                        observer.error(new Error('Authentication failed'));
                    }
                })
                .catch((error) => {
                    //console.error('Token refresh failed:', error);
                    AuthService.logout().then(() => {
                        router.replace('/(auth)/login');
                    });
                    observer.error(error);
                })
                .finally(() => {
                    isRefreshingToken = false;
                });
        });
    } else {
        if (isRefreshingToken) {
            //console.log(`Token refresh already in progress, skipping...`);
        } else if (!hasAuthError && !isNetworkAuthError) {
            //console.log(`No auth error detected, passing through...`);
        }
    }

    // If the token refresh is already in progress or this is not an authorization error, do nothing
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

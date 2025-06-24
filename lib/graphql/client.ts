import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { TokenManager } from '@/lib/utils/TokenManager';
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

// Helper functions for token management using TokenManager
const refreshTokenFlow = async (): Promise<boolean> => {
    try {
        const refreshToken = await TokenManager.getRefreshToken();
        
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

        // Check for GraphQL errors
        if (response.errors && response.errors.length > 0) {
            const errorMessage = response.errors[0].message;
            //console.log('GraphQL error during token refresh:', errorMessage);
            
            // Check if refresh token is invalid/expired
            if (errorMessage.includes('Invalid or expired refresh token') ||
                errorMessage.includes('Refresh token expired') ||
                errorMessage.includes('Invalid refresh token') ||
                errorMessage.includes('Refresh token not found')) {
                //console.log('Refresh token is invalid/expired, clearing auth data');
                await TokenManager.clearTokens();
            }
            
            return false;
        }

        if (response.data?.refreshToken) {
            // Save new tokens using TokenManager
            await TokenManager.saveTokens(
                response.data.refreshToken.accessToken,
                response.data.refreshToken.refreshToken,
                response.data.refreshToken.user
            );
            
            //console.log('Tokens refreshed successfully');
            return true;
        }
        
        //console.log('No refresh token data in response');
        return false;
    } catch (error: any) {
        //console.error('Token refresh failed with exception:', error);
        
        // If refresh token is invalid/expired, clear all auth data
        if (error.message?.includes('Invalid or expired refresh token') ||
            error.message?.includes('Refresh token expired') ||
            error.message?.includes('Invalid refresh token') ||
            error.message?.includes('Refresh token not found')) {
            //console.log('Clearing auth data due to invalid refresh token');
            await TokenManager.clearTokens();
        }
        
        return false;
    }
};

const clearAuthData = async (): Promise<void> => {
    try {
        await TokenManager.clearTokens();
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

// Context to add the authorization token using TokenManager
const authLink = setContext(async (_, { headers }) => {
    const token = await TokenManager.getAccessToken();
    
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
    
    // Log errors for debugging
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => {
            console.error(`GraphQL error: ${message}, Path: ${path}`);
        });
    }
    if (networkError) {
        //console.error(`Network error: ${networkError.message}, Status: ${(networkError as any).statusCode}`);
    }

    const hasAuthError = graphQLErrors?.some(error =>
        error.message.includes('Unauthorized') ||
        error.message.includes('Invalid token') ||
        error.message.includes('Token expired') ||
        error.message.includes('Authentication required') ||
        error.message.includes('Invalid or expired token')
    );

    const isNetworkAuthError = networkError && 'statusCode' in networkError && 
        (networkError as any).statusCode === 401;

    //console.log(`Auth error detected: ${hasAuthError}, Network auth error: ${isNetworkAuthError}, Is refreshing: ${isRefreshingToken}`);

    // If there is an authorization error and not already refreshing, try to update the token
    if ((hasAuthError || isNetworkAuthError) && !isRefreshingToken) {
        // console.log(`Starting token refresh process...`);
        isRefreshingToken = true;

        return new Observable(observer => {
            //console.log(`Calling refreshTokenFlow...`);
            refreshTokenFlow()
                .then(async (refreshed) => {
                    //console.log(`Token refresh result: ${refreshed}`);
                    
                    if (refreshed) {
                        //console.log('Token refreshed successfully, retrying operation...');
                        
                        // Get a new token for the retry request using TokenManager
                        const newToken = await TokenManager.getAccessToken();
                        
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
                        //console.log('Token refresh failed, performing logout...');
                        clearAuthData().then(() => {
                            //console.log('Auth data cleared, redirecting to login...');
                            router.replace('/(auth)/login');
                        });
                        observer.error(new Error('Authentication failed - please login again'));
                    }
                })
                .catch((error) => {
                    //console.error('Token refresh process failed:', error);
                    clearAuthData().then(() => {
                        //console.log('Auth data cleared after error, redirecting to login...');
                        router.replace('/(auth)/login');
                    });
                    observer.error(error);
                })
                .finally(() => {
                    //console.log('Token refresh process completed, resetting flag');
                    isRefreshingToken = false;
                });
        });
    }
    // For non-auth errors or when refresh is already in progress, pass the error through
    //console.log('Passing error through without refresh attempt');
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

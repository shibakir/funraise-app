/**
 * Main export module for GraphQL utilities and type definitions.
 * 
 * This module serves as the central entry point for all GraphQL-related
 * functionality including Apollo Client configuration, type definitions,
 * and query/mutation/subscription operations.
 * 
 * @example
 * ```typescript
 * import { apolloClient, GET_USER, User } from '@/lib/graphql';
 * 
 * const { data } = await apolloClient.query({
 *   query: GET_USER,
 *   variables: { id: 1 }
 * });
 * ```
 */

/**
 * Apollo Client instance and cache utilities.
 * Exports the configured Apollo Client with authentication,
 * error handling, and cache management functions.
 */
export { apolloClient, clearCache, refetchQueries } from './client';

/**
 * GraphQL type definitions and interfaces.
 * Exports all TypeScript types that correspond to the GraphQL schema,
 * providing type safety for all GraphQL operations.
 */
export * from './types';

/**
 * GraphQL operations (queries, mutations, subscriptions).
 * Exports all defined GraphQL operations for data fetching,
 * mutations, and real-time subscriptions.
 */
export * from './queries'; 
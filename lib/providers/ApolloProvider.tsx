import React from 'react';
import { ApolloProvider as ApolloClientProvider } from '@apollo/client';
import { apolloClient } from '@/lib/graphql/client';

/**
 * Apollo Client provider for the entire application
 * This provider is used to provide the Apollo Client to the entire application
 * It is used to fetch data from the GraphQL API
 * It is used to cache data in the Apollo Client
 */

interface ApolloProviderProps {
  children: React.ReactNode;
}

export const ApolloProvider: React.FC<ApolloProviderProps> = ({ children }) => {
    return (
        <ApolloClientProvider client={apolloClient}>
            {children}
        </ApolloClientProvider>
    );
};

export default ApolloProvider; 
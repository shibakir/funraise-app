// Import only the mocked modules through require after mocks are set up

// Mock all dependencies before importing
jest.mock('@/lib/utils/TokenManager');
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

// Mock the graphql imports
jest.mock('@/lib/graphql/queries', () => ({
  REFRESH_TOKEN_MUTATION: 'MOCK_REFRESH_TOKEN_MUTATION',
}));

// Mock Apollo Client with working implementations
jest.mock('@apollo/client', () => {
  const mockCacheReset = jest.fn();
  const mockRefetchQueries = jest.fn();
  const mockMutate = jest.fn();
  
  return {
    ApolloClient: jest.fn().mockImplementation(() => ({
      cache: { reset: mockCacheReset },
      refetchQueries: mockRefetchQueries,
      mutate: mockMutate,
    })),
    InMemoryCache: jest.fn().mockImplementation(() => ({ reset: mockCacheReset })),
    createHttpLink: jest.fn().mockReturnValue({ kind: 'HttpLink' }),
    from: jest.fn().mockReturnValue({ kind: 'CompositeLink' }),
    split: jest.fn().mockImplementation((test, left, right) => ({ kind: 'SplitLink', left, right })),
    gql: jest.fn().mockImplementation((strings) => ({ kind: 'Document', definitions: strings })),
  };
});

jest.mock('@apollo/client/link/context', () => ({
  setContext: jest.fn().mockReturnValue({ kind: 'AuthLink' }),
}));

jest.mock('@apollo/client/link/error', () => ({
  onError: jest.fn().mockReturnValue({ kind: 'ErrorLink' }),
}));

jest.mock('@apollo/client/link/subscriptions', () => ({
  GraphQLWsLink: jest.fn().mockImplementation(() => ({ kind: 'GraphQLWsLink' })),
}));

jest.mock('graphql-ws', () => ({
  createClient: jest.fn().mockReturnValue({ kind: 'WSClient' }),
}));

jest.mock('@apollo/client/utilities', () => ({
  getMainDefinition: jest.fn().mockReturnValue({
    kind: 'OperationDefinition',
    operation: 'query'
  }),
  Observable: class Observable {
    constructor(subscriber: any) {
      this.subscriber = subscriber;
    }
    subscriber: any;
  },
  split: jest.fn().mockImplementation((test, left, right) => ({ kind: 'SplitLink', left, right })),
}));

// Get mocked modules through require

describe('Apollo Client Configuration', () => {
  let apolloClient: any;
  let clearCache: any;
  let refetchQueries: any;
  let client: any;

  beforeAll(() => {
    // Get mocked modules
    const { TokenManager } = require('@/lib/utils/TokenManager');
    const { router } = require('expo-router');
    
    // Setup default mocks
    TokenManager.getAccessToken = jest.fn();
    TokenManager.getRefreshToken = jest.fn();
    TokenManager.saveTokens = jest.fn();
    TokenManager.clearTokens = jest.fn();
    
    // Import the module after mocks are set up
    const clientModule = require('@/lib/graphql/client');
    apolloClient = clientModule.apolloClient;
    clearCache = clientModule.clearCache;
    refetchQueries = clientModule.refetchQueries;
    client = clientModule.client;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Module Exports', () => {
    it('should export apolloClient', () => {
      expect(apolloClient).toBeDefined();
      expect(typeof apolloClient).toBe('object');
    });

    it('should export client as alias for apolloClient', () => {
      expect(client).toBe(apolloClient);
    });

    it('should export clearCache function', () => {
      expect(clearCache).toBeDefined();
      expect(typeof clearCache).toBe('function');
    });

    it('should export refetchQueries function', () => {
      expect(refetchQueries).toBeDefined();
      expect(typeof refetchQueries).toBe('function');
    });
  });

  describe('Apollo Client Instance', () => {
    it('should have cache with reset method', () => {
      expect(apolloClient.cache).toBeDefined();
      expect(apolloClient.cache.reset).toBeDefined();
      expect(typeof apolloClient.cache.reset).toBe('function');
    });

    it('should have refetchQueries method', () => {
      expect(apolloClient.refetchQueries).toBeDefined();
      expect(typeof apolloClient.refetchQueries).toBe('function');
    });

    it('should have mutate method', () => {
      expect(apolloClient.mutate).toBeDefined();
      expect(typeof apolloClient.mutate).toBe('function');
    });
  });

  describe('clearCache function', () => {
    it('should call cache.reset when executed', () => {
      const resetSpy = jest.spyOn(apolloClient.cache, 'reset');
      
      clearCache();
      
      expect(resetSpy).toHaveBeenCalled();
    });

    it('should not throw when called', () => {
      expect(() => clearCache()).not.toThrow();
    });
  });

  describe('refetchQueries function', () => {
    it('should call apolloClient.refetchQueries with correct parameters', () => {
      const refetchSpy = jest.spyOn(apolloClient, 'refetchQueries');
      const queryNames = ['GetUser', 'GetEvents'];
      
      refetchQueries(queryNames);
      
      expect(refetchSpy).toHaveBeenCalledWith({
        include: queryNames,
      });
    });

    it('should handle empty query array', () => {
      const refetchSpy = jest.spyOn(apolloClient, 'refetchQueries');
      
      refetchQueries([]);
      
      expect(refetchSpy).toHaveBeenCalledWith({
        include: [],
      });
    });

    it('should not throw when called', () => {
      expect(() => refetchQueries(['TestQuery'])).not.toThrow();
    });
  });

  describe('Dependencies Integration', () => {
    it('should have TokenManager methods available', () => {
      const { TokenManager } = require('@/lib/utils/TokenManager');
      expect(TokenManager.getAccessToken).toBeDefined();
      expect(TokenManager.getRefreshToken).toBeDefined();
      expect(TokenManager.saveTokens).toBeDefined();
      expect(TokenManager.clearTokens).toBeDefined();
    });

    it('should have router available for redirects', () => {
      const { router } = require('expo-router');
      expect(router.replace).toBeDefined();
    });
  });

  describe('Apollo Client Configuration Integration', () => {
    it('should use ApolloClient constructor', () => {
      const { ApolloClient } = require('@apollo/client');
      expect(ApolloClient).toHaveBeenCalled();
    });

    it('should use createHttpLink', () => {
      const { createHttpLink } = require('@apollo/client');
      expect(createHttpLink).toHaveBeenCalled();
    });

    it('should use setContext for auth', () => {
      const { setContext } = require('@apollo/client/link/context');
      expect(setContext).toHaveBeenCalled();
    });

    it('should use onError for error handling', () => {
      const { onError } = require('@apollo/client/link/error');
      expect(onError).toHaveBeenCalled();
    });

    it('should use GraphQLWsLink for WebSocket', () => {
      const { GraphQLWsLink } = require('@apollo/client/link/subscriptions');
      expect(GraphQLWsLink).toHaveBeenCalled();
    });

    it('should use createClient for WebSocket client', () => {
      const { createClient } = require('graphql-ws');
      expect(createClient).toHaveBeenCalled();
    });

    it('should use from to combine links', () => {
      const { from } = require('@apollo/client');
      expect(from).toHaveBeenCalled();
    });
  });

  describe('Error Scenarios', () => {
    it('should handle clearCache errors gracefully', () => {
      const originalReset = apolloClient.cache.reset;
      apolloClient.cache.reset = jest.fn().mockImplementation(() => {
        throw new Error('Cache error');
      });

      expect(() => clearCache()).toThrow('Cache error');

      // Restore original
      apolloClient.cache.reset = originalReset;
    });

    it('should handle refetchQueries errors gracefully', () => {
      const originalRefetch = apolloClient.refetchQueries;
      apolloClient.refetchQueries = jest.fn().mockImplementation(() => {
        throw new Error('Refetch error');
      });

      expect(() => refetchQueries(['TestQuery'])).toThrow('Refetch error');

      // Restore original
      apolloClient.refetchQueries = originalRefetch;
    });
  });

  describe('Function Parameters', () => {
    it('should handle refetchQueries with multiple query names', () => {
      const refetchSpy = jest.spyOn(apolloClient, 'refetchQueries');
      const queryNames = ['Query1', 'Query2', 'Query3'];
      
      refetchQueries(queryNames);
      
      expect(refetchSpy).toHaveBeenCalledWith({
        include: queryNames,
      });
    });

    it('should handle refetchQueries with single query name', () => {
      const refetchSpy = jest.spyOn(apolloClient, 'refetchQueries');
      const queryNames = ['SingleQuery'];
      
      refetchQueries(queryNames);
      
      expect(refetchSpy).toHaveBeenCalledWith({
        include: queryNames,
      });
    });
  });

  describe('Module Structure', () => {
    it('should be importable without errors', () => {
      expect(() => {
        require('@/lib/graphql/client');
      }).not.toThrow();
    });

    it('should export expected interface', () => {
      const clientModule = require('@/lib/graphql/client');
      
      expect(clientModule).toHaveProperty('apolloClient');
      expect(clientModule).toHaveProperty('client');
      expect(clientModule).toHaveProperty('clearCache');
      expect(clientModule).toHaveProperty('refetchQueries');
    });

    it('should provide stable references', () => {
      const clientModule1 = require('@/lib/graphql/client');
      const clientModule2 = require('@/lib/graphql/client');
      
      expect(clientModule1.apolloClient).toBe(clientModule2.apolloClient);
      expect(clientModule1.client).toBe(clientModule2.client);
      expect(clientModule1.clearCache).toBe(clientModule2.clearCache);
      expect(clientModule1.refetchQueries).toBe(clientModule2.refetchQueries);
    });
  });
}); 
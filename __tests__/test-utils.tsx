import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react-native';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';

// Test contexts providers
interface ProvidersProps {
    children: React.ReactNode;
    mocks?: MockedResponse[];
}

const TestProviders: React.FC<ProvidersProps> = ({ children, mocks = [] }) => {
    return (
        <MockedProvider mocks={mocks} addTypename={false}>
            {children}
        </MockedProvider>
    );
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    mocks?: MockedResponse[];
}

function customRender(
    ui: ReactElement,
    options: CustomRenderOptions = {}
) {
    const { mocks, ...renderOptions } = options;

    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <TestProviders mocks={mocks}>{children}</TestProviders>
    );

    return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock user object for tests
export const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    balance: 1000,
    image: 'https://example.com/avatar.jpg',
    isActivated: true,
    createdAt: '2023-01-01T00:00:00Z',
};

// Mock event object for tests
export const mockEvent = {
    id: 1,
    name: 'Test Event',
    description: 'Test Description',
    bankAmount: 500,
    status: 'IN_PROGRESS',
    type: 'DONATION',
    imageUrl: 'https://example.com/event.jpg',
    userId: 1,
    recipientId: 2,
    creator: mockUser,
    recipient: { ...mockUser, id: 2, username: 'recipient' },
    endConditions: [],
    participations: [],
};

// Re-export everything
export * from '@testing-library/react-native';
export { customRender as render }; 
# FunRaise Mobile App - Installation & Setup Guide

Guide for cloning, installing, and running the FunRaise React Native mobile application using Expo.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Local Development Setup](#local-development-setup)
- [Environment Configuration](#environment-configuration)
- [Available Commands](#available-commands)
- [Platform-Specific Setup](#platform-specific-setup)
- [Testing](#testing)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v8.0.0 or higher) - comes with Node.js
- **Expo CLI** - installed globally via `npm install -g @expo/cli`

### For iOS Development
- **macOS** (required for iOS development)
- **Xcode** (latest version) - from Mac App Store
- **iOS Simulator** (included with Xcode)

### For Physical Device Testing
- **Expo Go** app from App Store (iOS). In case the server has real internet access

## Quick Start

### 1. Clone the Repository
```bash
# Clone the entire project
git clone <repository-url>
cd funraise-client

# Or clone specific client folder if separate
git clone <repository-url> funraise-client
cd funraise-client
```

### 2. Install Dependencies
```bash
# Install all npm packages
npm install
```

### 3. Start Development Server
```bash
npx expo start --clear
```

### 4. Test the Connection
Open the app and try to login - it should connect to your running server on `localhost:3000`.

## Local Development Setup

### 1. Environment Setup
The app connects to your local GraphQL server by default:
- **GraphQL API**: `http://localhost:3000/graphql`
- **WebSocket**: `ws://localhost:3000/graphql`

**Important**: Make sure your [server is running](../server/README.md) before starting the client!

### 2. Configure Network Access
If testing on physical devices, you may need to update the API URL in .env file.

### 3. Run Development Server
```bash
# Start Expo development server
npm start

# Choose your platform:
# - Press 'i' for iOS simulator
# - Scan QR code with Expo Go for physical device
```

## Environment Configuration

### Custom Environment Variables
Create a `.env` file in the client root for custom configuration:

```bash
# .env file
FUNRAISE_API_URL=http://localhost:3000/graphql
FUNRAISE_WEBSOCKET_URL=ws://localhost:3000/graphql
```

**Note**: Expo requires environment variables to be prefixed with `EXPO_PUBLIC_` for client-side access in newer versions.

## Available Commands

### Development Commands
```bash
npm start           # Start Expo development server
npm run ios         # Run on iOS simulator (macOS only)
```

### Testing Commands
```bash
npm test            # Run tests once
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Documentation Commands
```bash
npm run docs:generate # Generate TypeDoc documentation
npm run docs          # Generate and serve docs
```

## Platform-Specific Setup

### iOS Setup (macOS only)

1. **Install Xcode** from Mac App Store
2. **Install iOS Simulator**:
   ```bash
   # Open Xcode and install additional simulators
   xcode-select --install
   ```
3. **Run on iOS**:
   ```bash
   npx expo start --clear
   ```

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: `lib/**/*.test.ts`
- **Component Tests**: `components/**/*.test.tsx`
- **Hook Tests**: `lib/hooks/**/*.test.tsx`
- **Integration Tests**: `__tests__/**/*.test.tsx`

### Test Coverage
Coverage reports are generated in the `coverage/` directory:
- **HTML Report**: `coverage/lcov-report/index.html`
- **Console Output**: Shows summary after running tests

## Documentation

### TypeDoc Documentation
Generate and view comprehensive API documentation:

```bash
# Generate documentation
npm run docs:generate

# Serve documentation (opens http://localhost:8081)
npm run docs:serve

# Generate and serve in one command
npm run docs
```

### Code Structure
```
client/
├── app/                    # Expo Router pages
│   ├── (app)/             # Authenticated routes
│   ├── (auth)/            # Authentication routes
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── custom/           # Custom UI components
│   └── themed/           # Themed components
├── lib/                  # Core application logic
│   ├── context/          # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── graphql/          # GraphQL client and queries
│   ├── types.ts          # TypeScript type definitions
│   └── utils/            # Utility functions
├── assets/               # Images, fonts, and static files
└── __tests__/           # Test files
```

## Troubleshooting

### Common Issues

#### 1. Metro bundler not starting
```bash
# Clear Metro cache
npx expo start --clear

# Or reset the entire project
npx expo start --reset-cache
```

#### 2. iOS build issues
```bash
# Clean iOS build
cd ios && rm -rf build && cd ..
npx expo run:ios --clear
```
#### 3. Package installation issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

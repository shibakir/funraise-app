module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/test-utils.tsx'
  ],
  collectCoverageFrom: [
    //'lib/**/*.{js,jsx,ts,tsx}',
    'lib/context/**/*.{js,jsx,ts,tsx}',
    'lib/hooks/**/*.{js,jsx,ts,tsx}',
    'lib/graphql/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/coverage/**',
  ],
  coverageReporters: [
    'text',
    'html',
    'lcov'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|@react-native-community|@expo|expo|@expo-google-fonts|react-clone-referenced-element|@react-native-picker|@react-native-async-storage|@react-native-community)'
  ],
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
}; 
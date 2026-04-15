/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@shopify/flash-list|msw|until-async|@mswjs)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.after.js'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    'expo/src/winter/(.*)': '<rootDir>/__tests__/mocks/emptyMock.js',
    'expo/build/winter/(.*)': '<rootDir>/__tests__/mocks/emptyMock.js',
    // MSW v2 sets "react-native": null on msw/node; jest-expo resolves as RN → add explicit Node entry
    '^msw/node$': '<rootDir>/node_modules/msw/lib/node/index.js',
  },
  testMatch: [
    '**/__tests__/**/*.(spec|test).[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '__tests__/mocks/',
    '__tests__/utils/testWrapper',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};

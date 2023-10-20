/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  rootDir: '../',
  setupFiles: ['<rootDir>/configs/setupEnv.ts'],
  setupFilesAfterEnv: ['<rootDir>/configs/setupAfterEnv.ts'],
  roots: ['<rootDir>'],
  clearMocks: true,
  testPathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/node_modules/',
    '<rootDir>/configs/',
    '/__utils__/',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/node_modules/',
    '<rootDir>/configs/',
    '/__utils__/',
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/*.test.ts'],
  testTimeout: 120000,
};

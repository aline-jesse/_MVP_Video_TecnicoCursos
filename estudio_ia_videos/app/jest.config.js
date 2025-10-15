/**
 * 🧪 Configuração Jest para Testes
 * FASE 2: Sprint 1 - Configuração de testes
 */

/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/__tests__'],
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/__tests__/**/*.test.ts',
    '!**/tests/e2e/**',
    '**/tests/audio2face-integration.test.ts',
    '**/tests/lip-sync-accuracy.test.ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'lib/**/*.ts',
    'app/api/**/*.ts',
    '!lib/**/*.d.ts',
    '!lib/**/*.test.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 120000, // 2 minutos para testes de integração
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
}

module.exports = config
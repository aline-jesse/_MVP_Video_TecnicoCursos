/**
 * Configuração Jest para Testes WebSocket
 * 
 * Usa setup específico para Socket.IO e aumenta timeouts
 */

import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/websocket*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testTimeout: 15000,
  setupFilesAfterEnv: ['<rootDir>/jest.websocket.setup.ts'],
  collectCoverageFrom: [
    'lib/websocket/**/*.ts',
    'hooks/useTimelineSocket.ts',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
  ],
  verbose: true,
  maxWorkers: 1, // Evitar conflitos de porta
}

export default config

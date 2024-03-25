import path from 'path'
import dotenv from 'dotenv'
import type { Config } from '@jest/types'

dotenv.config({ path: path.resolve(__dirname, '.env.local') })

const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testMatch: ['<rootDir>/src/tests/**/*.test.ts'],
  testEnvironment: 'node',
  transformIgnorePatterns: [],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  collectCoverage: true,
  coverageReporters: ['text'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

export default config

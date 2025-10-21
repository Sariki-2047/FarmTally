/**
 * Jest Setup File for FarmTally Pipeline Tests
 * Configures global test environment and utilities
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Global test configuration
global.TEST_CONFIG = {
  timeout: 30000,
  tempDirPrefix: 'farmtally-test-',
  mockApiUrl: 'http://localhost:3000',
  testDatabaseUrl: 'postgresql://test:test@localhost:5432/farmtally_test'
};

// Global test utilities
global.TestUtils = {
  /**
   * Create a temporary directory for testing
   */
  createTempDir: (prefix = global.TEST_CONFIG.tempDirPrefix) => {
    return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  },

  /**
   * Clean up temporary directory
   */
  cleanupTempDir: (tempDir) => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  },

  /**
   * Create mock environment variables
   */
  createMockEnvironment: () => {
    return {
      NODE_ENV: 'test',
      DATABASE_URL: global.TEST_CONFIG.testDatabaseUrl,
      JWT_SECRET: 'test-jwt-secret-key-for-testing',
      SMTP_HOST: 'smtp.test.com',
      SMTP_USER: 'test@farmtally.com',
      SMTP_PASSWORD: 'test-password',
      CORS_ORIGIN: 'http://localhost:3000',
      NEXT_PUBLIC_API_URL: 'http://localhost:3000',
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      BUILD_NUMBER: '123'
    };
  },

  /**
   * Create mock project structure
   */
  createMockProject: (baseDir) => {
    // Backend structure
    fs.mkdirSync(path.join(baseDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(baseDir, 'src/server.ts'), `
import express from 'express';
const app = express();
app.get('/api/health', (req, res) => res.json({ status: 'healthy' }));
app.listen(3000);
    `);
    
    fs.writeFileSync(path.join(baseDir, 'package.json'), JSON.stringify({
      name: 'farmtally-backend',
      scripts: {
        build: 'echo "Building..." && mkdir -p dist && echo "console.log(\\"server\\");" > dist/server.js',
        start: 'node dist/server.js'
      }
    }, null, 2));
    
    fs.writeFileSync(path.join(baseDir, 'tsconfig.json'), JSON.stringify({
      compilerOptions: { target: 'es2020', outDir: 'dist' }
    }, null, 2));
    
    // Frontend structure
    fs.mkdirSync(path.join(baseDir, 'farmtally-frontend/src'), { recursive: true });
    fs.writeFileSync(path.join(baseDir, 'farmtally-frontend/package.json'), JSON.stringify({
      name: 'farmtally-frontend',
      scripts: {
        build: 'echo "Building frontend..." && mkdir -p .next && echo "build" > .next/BUILD_ID'
      }
    }, null, 2));
    
    fs.writeFileSync(path.join(baseDir, 'farmtally-frontend/next.config.ts'), 'export default {};');
    
    // Prisma structure
    fs.mkdirSync(path.join(baseDir, 'prisma'), { recursive: true });
    fs.writeFileSync(path.join(baseDir, 'prisma/schema.prisma'), `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
    `);
  },

  /**
   * Create mock git repository
   */
  createMockGitRepo: (baseDir) => {
    fs.mkdirSync(path.join(baseDir, '.git'), { recursive: true });
    
    if (process.platform !== 'win32') {
      const gitScript = `#!/bin/bash
case "$*" in
    "rev-parse HEAD") echo "a1b2c3d4e5f6789012345678901234567890abcd" ;;
    "rev-parse --abbrev-ref HEAD") echo "main" ;;
    "config --get remote.origin.url") echo "https://github.com/farmtally/farmtally.git" ;;
    "diff-index --quiet HEAD --") exit 0 ;;
    *) echo "Git command: $*" >&2; exit 0 ;;
esac`;
      
      fs.writeFileSync(path.join(baseDir, 'git'), gitScript);
      fs.chmodSync(path.join(baseDir, 'git'), 0o755);
    }
  },

  /**
   * Wait for a specified amount of time
   */
  sleep: (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Generate random string
   */
  randomString: (length = 8) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

// Console output suppression for cleaner test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Suppress console output during tests unless explicitly enabled
if (!process.env.VERBOSE_TESTS) {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
}

// Restore console methods for debugging when needed
global.restoreConsole = () => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
};

// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Increase default timeout for all tests
jest.setTimeout(global.TEST_CONFIG.timeout);

// Mock common modules
jest.mock('axios', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({ data: {} }))
}));

// Setup global beforeEach and afterEach
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset environment variables
  process.env = { ...process.env, ...global.TestUtils.createMockEnvironment() };
});

afterEach(() => {
  // Cleanup any global state
  jest.restoreAllMocks();
});
/**
 * Test Setup Configuration
 * Global setup for AI Core package tests
 */

import { vi } from 'vitest';

// Mock Redis for testing environment
vi.mock('ioredis', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue('OK'),
      del: vi.fn().mockResolvedValue(1),
      flushall: vi.fn().mockResolvedValue('OK'),
      zadd: vi.fn().mockResolvedValue(1),
      zcount: vi.fn().mockResolvedValue(0),
      zremrangebyscore: vi.fn().mockResolvedValue(0),
      ping: vi.fn().mockResolvedValue('PONG'),
      disconnect: vi.fn().mockResolvedValue(undefined),
    })),
  };
});

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
process.env.GOOGLE_AI_API_KEY = 'test-google-key';

// Global test timeout
vi.setConfig({ testTimeout: 10000 });

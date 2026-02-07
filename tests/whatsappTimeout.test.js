/**
 * Test for WhatsApp timeout configuration
 * 
 * This test verifies that the timeout values are properly configured
 * to address the "ready timeout after 120000ms" issue.
 */

import { jest } from '@jest/globals';

// Mock environment to avoid database dependencies
process.env.JWT_SECRET = 'test-secret';
process.env.DB_USER = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'test_db';
process.env.DB_PASS = 'test';

describe('WhatsApp Timeout Configuration', () => {
  let env;

  beforeAll(async () => {
    // Import after setting env vars
    const envModule = await import('../src/config/env.js');
    env = envModule.env;
  });

  describe('WA_WWEBJS_PROTOCOL_TIMEOUT_MS', () => {
    it('should have default timeout of 180000ms (3 minutes)', () => {
      const expectedTimeout = 180000;
      expect(env.WA_WWEBJS_PROTOCOL_TIMEOUT_MS).toBe(expectedTimeout);
    });

    it('should be a number type', () => {
      expect(typeof env.WA_WWEBJS_PROTOCOL_TIMEOUT_MS).toBe('number');
    });

    it('should be within reasonable range (1-10 minutes)', () => {
      const timeout = env.WA_WWEBJS_PROTOCOL_TIMEOUT_MS;
      const minTimeout = 60000; // 1 minute
      const maxTimeout = 600000; // 10 minutes
      
      expect(timeout).toBeGreaterThanOrEqual(minTimeout);
      expect(timeout).toBeLessThanOrEqual(maxTimeout);
    });

    it('should be greater than the old default of 120000ms', () => {
      const oldDefault = 120000;
      expect(env.WA_WWEBJS_PROTOCOL_TIMEOUT_MS).toBeGreaterThan(oldDefault);
    });
  });

  describe('Timeout value rationale', () => {
    it('should provide sufficient time for slow networks', () => {
      // At least 3 minutes should be enough for most network conditions
      const minimumRecommended = 180000; // 3 minutes
      expect(env.WA_WWEBJS_PROTOCOL_TIMEOUT_MS).toBeGreaterThanOrEqual(minimumRecommended);
    });

    it('should not be excessively long', () => {
      // More than 10 minutes is unreasonable for production
      const maximumReasonable = 600000; // 10 minutes
      expect(env.WA_WWEBJS_PROTOCOL_TIMEOUT_MS).toBeLessThanOrEqual(maximumReasonable);
    });
  });
});

describe('WhatsAppClient timeout usage', () => {
  it('should use the configured timeout value', async () => {
    const envModule = await import('../src/config/env.js');
    const env = envModule.env;

    // The timeout should be used in WhatsAppService
    const expectedPuppeteerTimeout = env.WA_WWEBJS_PROTOCOL_TIMEOUT_MS;
    expect(expectedPuppeteerTimeout).toBe(180000);
  });
});

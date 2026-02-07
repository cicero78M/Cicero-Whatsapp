/**
 * Message deduplication middleware
 * Prevents processing duplicate messages using an in-memory cache with TTL
 */

// Default message TTL: 24 hours
const DEFAULT_MESSAGE_TTL_MS = 24 * 60 * 60 * 1000;

// Cache cleanup interval: 1 hour
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

export class MessageDeduplicator {
  constructor(ttl = DEFAULT_MESSAGE_TTL_MS) {
    this.ttl = ttl;
    this.cache = new Map();
    this.cleanupInterval = null;
    
    // Start periodic cleanup
    this._startCleanup();
  }

  /**
   * Generate message key for deduplication
   */
  _generateKey(message) {
    // Use message ID as primary key
    if (message.id && message.id._serialized) {
      return message.id._serialized;
    }
    
    // Fallback: use combination of from, timestamp, and body
    const from = message.from || '';
    const timestamp = message.timestamp || Date.now();
    const body = message.body || '';
    
    return `${from}-${timestamp}-${body.substring(0, 50)}`;
  }

  /**
   * Check if message was already processed
   */
  isDuplicate(message) {
    const key = this._generateKey(message);
    const cached = this.cache.get(key);
    
    if (!cached) {
      return false;
    }

    // Check if cache entry has expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Mark message as processed
   */
  markProcessed(message) {
    const key = this._generateKey(message);
    this.cache.set(key, {
      timestamp: Date.now(),
      messageId: message.id?._serialized,
    });
  }

  /**
   * Middleware function for MessageRouter
   */
  middleware() {
    return (message) => {
      const key = this._generateKey(message);
      // Log first 50 chars of key for debugging (keys are usually long serialized IDs)
      const keyPreview = key.length > 50 ? key.substring(0, 50) + '...' : key;
      console.log(`[Deduplicator] Checking message: key=${keyPreview}`);
      
      // Check if message is duplicate
      if (this.isDuplicate(message)) {
        console.log('[Deduplicator] Duplicate message detected, skipping processing');
        return false; // Block message processing
      }

      // Mark as processed
      this.markProcessed(message);
      console.log('[Deduplicator] Message marked as processed, continuing');
      
      // Continue processing
      return true;
    };
  }

  /**
   * Start periodic cleanup of expired entries
   */
  _startCleanup() {
    // Clean up every hour
    this.cleanupInterval = setInterval(() => {
      this._cleanup();
    }, CLEANUP_INTERVAL_MS);
  }

  /**
   * Clean up expired cache entries
   */
  _cleanup() {
    const now = Date.now();
    let removed = 0;

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`[Deduplicator] Cleaned up ${removed} expired entries`);
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      ttl: this.ttl,
    };
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    console.log('[Deduplicator] Cache cleared');
  }

  /**
   * Stop cleanup interval
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

export default MessageDeduplicator;

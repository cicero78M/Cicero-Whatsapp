/**
 * SessionManager handles user sessions and menu states
 * Uses an in-memory store with TTL for automatic cleanup
 */

// Default session timeout: 30 minutes
const DEFAULT_SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// Session cleanup interval: 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

export class SessionManager {
  constructor(defaultTimeout = DEFAULT_SESSION_TIMEOUT_MS) {
    this.sessions = new Map();
    this.defaultTimeout = defaultTimeout;
    this.cleanupInterval = null;
    
    // Start periodic cleanup
    this._startCleanup();
  }

  /**
   * Get or create a session for a chat
   */
  getSession(chatId) {
    let session = this.sessions.get(chatId);
    
    if (!session) {
      session = this._createSession(chatId);
      this.sessions.set(chatId, session);
    }

    // Update last activity
    session.lastActivity = Date.now();
    
    return session;
  }

  /**
   * Create a new session
   */
  _createSession(chatId) {
    return {
      chatId,
      state: null,
      data: {},
      createdAt: Date.now(),
      lastActivity: Date.now(),
      timeout: this.defaultTimeout,
    };
  }

  /**
   * Set session state
   */
  setState(chatId, state, data = {}) {
    const session = this.getSession(chatId);
    session.state = state;
    session.data = { ...session.data, ...data };
    session.lastActivity = Date.now();
  }

  /**
   * Get session state
   */
  getState(chatId) {
    const session = this.sessions.get(chatId);
    return session?.state || null;
  }

  /**
   * Get session data
   */
  getData(chatId, key = null) {
    const session = this.sessions.get(chatId);
    
    if (!session) {
      return null;
    }

    if (key) {
      return session.data[key];
    }

    return session.data;
  }

  /**
   * Set session data
   */
  setData(chatId, key, value) {
    const session = this.getSession(chatId);
    session.data[key] = value;
    session.lastActivity = Date.now();
  }

  /**
   * Update multiple data fields at once
   */
  updateData(chatId, data) {
    const session = this.getSession(chatId);
    session.data = { ...session.data, ...data };
    session.lastActivity = Date.now();
  }

  /**
   * Clear session state (reset to initial)
   */
  clearState(chatId) {
    const session = this.sessions.get(chatId);
    if (session) {
      session.state = null;
      session.data = {};
      session.lastActivity = Date.now();
    }
  }

  /**
   * Delete a session completely
   */
  deleteSession(chatId) {
    this.sessions.delete(chatId);
  }

  /**
   * Check if session exists
   */
  hasSession(chatId) {
    return this.sessions.has(chatId);
  }

  /**
   * Get all active sessions
   */
  getAllSessions() {
    return Array.from(this.sessions.values());
  }

  /**
   * Get session count
   */
  getSessionCount() {
    return this.sessions.size;
  }

  /**
   * Check if session has expired
   */
  isExpired(chatId) {
    const session = this.sessions.get(chatId);
    
    if (!session) {
      return true;
    }

    const age = Date.now() - session.lastActivity;
    return age > session.timeout;
  }

  /**
   * Set custom timeout for a session
   */
  setTimeout(chatId, timeout) {
    const session = this.getSession(chatId);
    session.timeout = timeout;
  }

  /**
   * Middleware for MessageRouter to attach session to context
   */
  middleware() {
    return (message, context) => {
      const chatId = message.from;
      
      // Check if session expired
      if (this.isExpired(chatId)) {
        this.clearState(chatId);
      }

      // Attach session to context
      context.session = this.getSession(chatId);
      
      // Continue processing
      return true;
    };
  }

  /**
   * Start periodic cleanup of expired sessions
   */
  _startCleanup() {
    // Clean up every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this._cleanup();
    }, CLEANUP_INTERVAL_MS);
  }

  /**
   * Clean up expired sessions
   */
  _cleanup() {
    const now = Date.now();
    let removed = 0;

    for (const [chatId, session] of this.sessions.entries()) {
      const age = now - session.lastActivity;
      if (age > session.timeout) {
        this.sessions.delete(chatId);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`[SessionManager] Cleaned up ${removed} expired sessions`);
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalSessions: this.sessions.size,
      defaultTimeout: this.defaultTimeout,
    };
  }

  /**
   * Clear all sessions
   */
  clear() {
    this.sessions.clear();
    console.log('[SessionManager] All sessions cleared');
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

export default SessionManager;

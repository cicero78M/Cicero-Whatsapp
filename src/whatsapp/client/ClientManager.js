import { WhatsAppClient } from './WhatsAppClient.js';
import { EventEmitter } from 'events';

/**
 * ClientManager manages multiple WhatsApp clients
 * Provides centralized management for user, gateway, and other client types
 */
export class ClientManager extends EventEmitter {
  constructor() {
    super();
    this.clients = new Map();
    this.defaultClientId = null;
  }

  /**
   * Create and register a new WhatsApp client
   */
  createClient(clientId, options = {}) {
    if (this.clients.has(clientId)) {
      console.warn(`[ClientManager] Client ${clientId} already exists`);
      return this.clients.get(clientId);
    }

    console.log(`[ClientManager] Creating client: ${clientId}`);
    const client = new WhatsAppClient(clientId, options);

    // Forward client events
    this._forwardClientEvents(client, clientId);

    // Store client
    this.clients.set(clientId, client);

    // Set as default if first client
    if (!this.defaultClientId) {
      this.defaultClientId = clientId;
    }

    return client;
  }

  /**
   * Forward client events to manager with client ID
   */
  _forwardClientEvents(client, clientId) {
    const events = [
      'qr',
      'ready',
      'authenticated',
      'auth_failure',
      'message',
      'message_create',
      'disconnected',
      'loading_screen',
      'change_state',
      'remote_session_saved',
      'destroyed',
      'logout',
      'error',
      'reconnect_failed',
    ];

    events.forEach((event) => {
      client.on(event, (...args) => {
        this.emit(event, clientId, ...args);
        this.emit(`${event}:${clientId}`, ...args);
      });
    });
  }

  /**
   * Get a client by ID
   */
  getClient(clientId) {
    return this.clients.get(clientId);
  }

  /**
   * Get the default client
   */
  getDefaultClient() {
    if (!this.defaultClientId) {
      throw new Error('No default client set');
    }
    return this.clients.get(this.defaultClientId);
  }

  /**
   * Set the default client
   */
  setDefaultClient(clientId) {
    if (!this.clients.has(clientId)) {
      throw new Error(`Client ${clientId} does not exist`);
    }
    this.defaultClientId = clientId;
  }

  /**
   * Get all client IDs
   */
  getClientIds() {
    return Array.from(this.clients.keys());
  }

  /**
   * Check if client exists
   */
  hasClient(clientId) {
    return this.clients.has(clientId);
  }

  /**
   * Initialize a specific client
   */
  async initializeClient(clientId) {
    const client = this.clients.get(clientId);
    if (!client) {
      throw new Error(`Client ${clientId} does not exist`);
    }

    await client.initialize();
  }

  /**
   * Initialize all clients
   */
  async initializeAll() {
    const promises = Array.from(this.clients.values()).map((client) =>
      client.initialize().catch((error) => {
        console.error(`[ClientManager] Failed to initialize client:`, error);
        return null;
      })
    );

    await Promise.all(promises);
  }

  /**
   * Wait for a specific client to be ready
   */
  async waitForClient(clientId, timeout = 60000) {
    const client = this.clients.get(clientId);
    if (!client) {
      throw new Error(`Client ${clientId} does not exist`);
    }

    await client.waitForReady(timeout);
  }

  /**
   * Wait for all clients to be ready
   */
  async waitForAllClients(timeout = 60000) {
    const promises = Array.from(this.clients.entries()).map(([id, client]) =>
      client.waitForReady(timeout).catch((error) => {
        console.error(`[ClientManager] Client ${id} failed to be ready:`, error);
        return null;
      })
    );

    await Promise.all(promises);
  }

  /**
   * Send message using a specific client
   */
  async sendMessage(clientId, chatId, message, options = {}) {
    const client = this.clients.get(clientId);
    if (!client) {
      throw new Error(`Client ${clientId} does not exist`);
    }

    return await client.sendMessage(chatId, message, options);
  }

  /**
   * Send message using default client
   */
  async sendMessageDefault(chatId, message, options = {}) {
    const client = this.getDefaultClient();
    return await client.sendMessage(chatId, message, options);
  }

  /**
   * Get status of all clients
   */
  getStatus() {
    const status = {};
    for (const [clientId, client] of this.clients.entries()) {
      status[clientId] = {
        isReady: client.isReady,
        isConnecting: client.isConnecting,
        reconnectAttempts: client.reconnectAttempts,
        state: client.getState(),
      };
    }
    return status;
  }

  /**
   * Destroy a specific client
   */
  async destroyClient(clientId) {
    const client = this.clients.get(clientId);
    if (!client) {
      console.warn(`[ClientManager] Client ${clientId} does not exist`);
      return;
    }

    await client.destroy();
    this.clients.delete(clientId);

    // Update default client if needed
    if (this.defaultClientId === clientId) {
      const remainingIds = Array.from(this.clients.keys());
      this.defaultClientId = remainingIds[0] || null;
    }
  }

  /**
   * Destroy all clients
   */
  async destroyAll() {
    const promises = Array.from(this.clients.entries()).map(([id, client]) =>
      client.destroy().catch((error) => {
        console.error(`[ClientManager] Failed to destroy client ${id}:`, error);
        return null;
      })
    );

    await Promise.all(promises);
    this.clients.clear();
    this.defaultClientId = null;
  }
}

// Singleton instance
export const clientManager = new ClientManager();

export default clientManager;

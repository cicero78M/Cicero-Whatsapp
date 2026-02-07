import { clientManager } from './client/ClientManager.js';
import { MessageRouter } from './handlers/MessageRouter.js';
import { MessageDeduplicator } from './middleware/MessageDeduplicator.js';
import { SessionManager } from './middleware/SessionManager.js';
import { HandlerRegistry } from './handlers/HandlerRegistry.js';
import { env } from '../config/env.js';

/**
 * WhatsAppService is the main entry point for WhatsApp functionality
 * It orchestrates clients, routing, and middleware
 */
class WhatsAppService {
  constructor() {
    this.clientManager = clientManager;
    this.router = new MessageRouter();
    this.deduplicator = new MessageDeduplicator();
    this.sessionManager = new SessionManager();
    this.handlerRegistry = new HandlerRegistry();
    
    // Client references
    this.userClient = null;
    this.gatewayClient = null;
    
    // Ready flags
    this.isInitialized = false;
  }

  /**
   * Initialize the WhatsApp service
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('[WhatsAppService] Already initialized');
      return;
    }

    console.log('[WhatsAppService] Initializing...');

    try {
      // Setup middleware
      this._setupMiddleware();

      // Create clients (but don't wait for ready yet)
      await this._createClients();
      
      // Register handlers
      this._registerHandlers();

      // Setup message handlers BEFORE waiting for ready to avoid race condition
      this._setupMessageHandlers();

      // Now wait for clients to be ready
      await this._waitForClientsReady();

      this.isInitialized = true;
      console.log('[WhatsAppService] Initialization complete');
    } catch (error) {
      console.error('[WhatsAppService] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Setup middleware pipeline
   */
  _setupMiddleware() {
    console.log('[WhatsAppService] Setting up middleware...');
    
    // Add deduplication middleware
    this.router.use(this.deduplicator.middleware());
    
    // Add session middleware
    this.router.use(this.sessionManager.middleware());
    
    // Add logging middleware
    this.router.use((message) => {
      const from = message.from;
      const body = message.body?.substring(0, 50) || '[no body]';
      console.log(`[WhatsApp] Logging middleware - Message from ${from}: ${body}`);
      return true;
    });
  }

  /**
   * Initialize WhatsApp clients
   */
  /**
   * Create WhatsApp clients
   */
  async _createClients() {
    console.log('[WhatsAppService] Creating clients...');

    // Prepare webVersionCache configuration if URL is provided
    const webVersionCache = env.WA_WEB_VERSION_CACHE_URL
      ? {
          type: 'remote',
          remotePath: env.WA_WEB_VERSION_CACHE_URL,
        }
      : undefined;

    // Prepare base client options
    const baseOptions = {
      authDataPath: env.WA_AUTH_DATA_PATH,
      maxReconnectAttempts: 5,
      reconnectDelay: 5000,
      puppeteerTimeout: env.WA_WWEBJS_PROTOCOL_TIMEOUT_MS || 180000, // 3 minutes default
      webVersionCache,
      additionalConfig: env.WA_WEB_VERSION
        ? { webVersion: env.WA_WEB_VERSION }
        : {},
    };

    console.log('[WhatsAppService] Client options:', {
      authDataPath: baseOptions.authDataPath || '(default)',
      puppeteerTimeout: baseOptions.puppeteerTimeout,
      webVersionCache: webVersionCache ? 'configured' : 'not configured',
      webVersion: env.WA_WEB_VERSION || 'not specified',
    });

    // Create user client (main client for user interactions)
    const userClientId = env.USER_WA_CLIENT_ID || 'wa-user';
    this.userClient = this.clientManager.createClient(userClientId, baseOptions);

    // Create gateway client (for broadcasts and group operations)
    const gatewayClientId = env.GATEWAY_WA_CLIENT_ID || 'wa-gateway';
    this.gatewayClient = this.clientManager.createClient(gatewayClientId, baseOptions);

    // Set user client as default
    this.clientManager.setDefaultClient(userClientId);

    // Start client initialization (don't wait for ready)
    console.log('[WhatsAppService] Starting client initialization...');
    await Promise.all([
      this.userClient.initialize(),
      this.gatewayClient.initialize(),
    ]);

    console.log('[WhatsAppService] Clients initialized (may not be ready yet)');
  }

  /**
   * Wait for all clients to be ready
   */
  async _waitForClientsReady() {
    console.log('[WhatsAppService] Waiting for clients to be ready...');
    try {
      await Promise.all([
        this.userClient.waitForReady(120000), // 2 minutes timeout
        this.gatewayClient.waitForReady(120000),
      ]);
      console.log('[WhatsAppService] All clients are ready');
    } catch (error) {
      console.error('[WhatsAppService] Timeout waiting for clients to be ready:', error);
      throw error; // Don't continue if clients aren't ready
    }
  }

  /**
   * Register all message handlers
   */
  _registerHandlers() {
    console.log('[WhatsAppService] Registering handlers...');
    this.handlerRegistry.initialize(this.router, this);
    console.log('[WhatsAppService] Handlers registered');
  }

  /**
   * Setup message handlers for all clients
   */
  _setupMessageHandlers() {
    console.log('[WhatsAppService] Setting up message handlers...');

    // Setup handler for user client
    this.userClient.on('message', async (message) => {
      console.log(`[WhatsAppService] User client received message event: from=${message.from}, body=${message.body?.substring(0, 50)}`);
      try {
        await this.router.processMessage(message, this.userClient, {
          clientId: this.userClient.clientId,
        });
      } catch (error) {
        console.error('[WhatsAppService] Error processing user client message:', error);
      }
    });

    // Setup handler for gateway client
    this.gatewayClient.on('message', async (message) => {
      console.log(`[WhatsAppService] Gateway client received message event: from=${message.from}, body=${message.body?.substring(0, 50)}`);
      try {
        await this.router.processMessage(message, this.gatewayClient, {
          clientId: this.gatewayClient.clientId,
        });
      } catch (error) {
        console.error('[WhatsAppService] Error processing gateway client message:', error);
      }
    });

    // Setup ready handlers
    this.userClient.on('ready', () => {
      console.log('[WhatsAppService] ✅ User client is READY - can now receive messages');
    });

    this.gatewayClient.on('ready', () => {
      console.log('[WhatsAppService] ✅ Gateway client is READY - can now receive messages');
    });
  }

  /**
   * Send a message using the user client
   */
  async sendMessage(chatId, message, options = {}) {
    if (!this.userClient || !this.userClient.isReady) {
      throw new Error('User client is not ready');
    }

    return await this.userClient.sendMessage(chatId, message, options);
  }

  /**
   * Send a message using the gateway client
   */
  async sendGatewayMessage(chatId, message, options = {}) {
    if (!this.gatewayClient || !this.gatewayClient.isReady) {
      throw new Error('Gateway client is not ready');
    }

    return await this.gatewayClient.sendMessage(chatId, message, options);
  }

  /**
   * Send a message using a specific client
   */
  async sendMessageWithClient(clientId, chatId, message, options = {}) {
    return await this.clientManager.sendMessage(clientId, chatId, message, options);
  }

  /**
   * Wait for all clients to be ready
   */
  async waitForReady(timeout = 60000) {
    return await this.clientManager.waitForAllClients(timeout);
  }

  /**
   * Wait for a specific client to be ready
   */
  async waitForClientReady(clientId, timeout = 60000) {
    return await this.clientManager.waitForClient(clientId, timeout);
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      clients: this.clientManager.getStatus(),
      sessions: this.sessionManager.getStats(),
      deduplication: this.deduplicator.getStats(),
      handlers: this.router.getHandlers(),
    };
  }

  /**
   * Register a message handler
   */
  registerHandler(handlerConfig) {
    this.router.registerHandler(handlerConfig);
  }

  /**
   * Register a command handler
   */
  registerCommand(command, handler, options = {}) {
    this.router.registerCommand(command, handler, options);
  }

  /**
   * Register a menu handler
   */
  registerMenuHandler(menuState, handler, options = {}) {
    this.router.registerMenuHandler(menuState, handler, options);
  }

  /**
   * Get session manager (for external access)
   */
  getSessionManager() {
    return this.sessionManager;
  }

  /**
   * Get router (for external access)
   */
  getRouter() {
    return this.router;
  }

  /**
   * Get client manager (for external access)
   */
  getClientManager() {
    return this.clientManager;
  }

  /**
   * Cleanup and destroy
   */
  async destroy() {
    console.log('[WhatsAppService] Destroying...');
    
    await this.clientManager.destroyAll();
    this.deduplicator.destroy();
    this.sessionManager.destroy();
    
    this.isInitialized = false;
    console.log('[WhatsAppService] Destroyed');
  }
}

// Singleton instance
export const whatsappService = new WhatsAppService();

// Export for convenience
export default whatsappService;

// Also export clients for backward compatibility
export const getWhatsAppService = () => whatsappService;
export const getUserClient = () => whatsappService.userClient;
export const getGatewayClient = () => whatsappService.gatewayClient;

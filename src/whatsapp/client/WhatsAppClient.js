import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import { EventEmitter } from 'events';
import qrcode from 'qrcode-terminal';
import path from 'path';
import os from 'os';

// Default Puppeteer timeout: 2 minutes
const DEFAULT_PUPPETEER_TIMEOUT_MS = 2 * 60 * 1000;

/**
 * WhatsApp Client wrapper for whatsapp-web.js
 * Provides a clean, event-driven interface with proper error handling
 * and reconnection logic following wwebjs best practices.
 */
export class WhatsAppClient extends EventEmitter {
  constructor(clientId = 'default', options = {}) {
    super();
    
    this.clientId = clientId;
    this.client = null;
    this.isReady = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.reconnectDelay = options.reconnectDelay || 5000;
    
    // Auth data path
    const authDataPath = options.authDataPath || this._getDefaultAuthPath();
    
    // Client configuration following wwebjs best practices
    this.clientConfig = {
      authStrategy: new LocalAuth({
        clientId: this.clientId,
        dataPath: authDataPath,
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
        executablePath: options.executablePath || undefined,
        timeout: options.puppeteerTimeout || DEFAULT_PUPPETEER_TIMEOUT_MS,
      },
      // Web version caching for stability
      webVersionCache: options.webVersionCache || undefined,
      // Timeout configurations
      qrMaxRetries: options.qrMaxRetries || 5,
      authTimeoutMs: options.authTimeoutMs || 60000,
      ...options.additionalConfig,
    };
  }

  /**
   * Get default auth data path
   */
  _getDefaultAuthPath() {
    const homeDir = os.homedir() || process.cwd();
    return path.join(homeDir, '.cicero', 'wwebjs_auth');
  }

  /**
   * Initialize and connect the WhatsApp client
   */
  async initialize() {
    if (this.isConnecting) {
      throw new Error('Client is already connecting');
    }

    if (this.isReady) {
      console.log(`[WhatsApp] Client ${this.clientId} is already ready`);
      return;
    }

    this.isConnecting = true;
    
    try {
      // Create new client instance
      this.client = new Client(this.clientConfig);
      
      // Setup event listeners
      this._setupEventListeners();
      
      // Initialize client
      console.log(`[WhatsApp] Initializing client ${this.clientId}...`);
      await this.client.initialize();
      
    } catch (error) {
      this.isConnecting = false;
      console.error(`[WhatsApp] Failed to initialize client ${this.clientId}:`, error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Setup all event listeners for the WhatsApp client
   */
  _setupEventListeners() {
    // QR Code event - displayed when authentication is needed
    this.client.on('qr', (qr) => {
      console.log(`[WhatsApp] QR Code received for client ${this.clientId}`);
      qrcode.generate(qr, { small: true });
      this.emit('qr', qr);
    });

    // Ready event - client is authenticated and ready
    this.client.on('ready', () => {
      this.isReady = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      console.log(`[WhatsApp] Client ${this.clientId} is ready!`);
      this.emit('ready');
    });

    // Authenticated event - successful authentication
    this.client.on('authenticated', () => {
      console.log(`[WhatsApp] Client ${this.clientId} authenticated`);
      this.emit('authenticated');
    });

    // Authentication failure event
    this.client.on('auth_failure', (msg) => {
      console.error(`[WhatsApp] Authentication failure for client ${this.clientId}:`, msg);
      this.isConnecting = false;
      this.emit('auth_failure', msg);
    });

    // Message event - incoming messages
    this.client.on('message', (message) => {
      console.log(`[WhatsApp] Client ${this.clientId} received message from ${message.from}: ${message.body?.substring(0, 50) || '[no body]'}`);
      this.emit('message', message);
    });

    // Message create event - all messages (sent and received)
    this.client.on('message_create', (message) => {
      this.emit('message_create', message);
    });

    // Disconnected event - client disconnected
    this.client.on('disconnected', (reason) => {
      console.log(`[WhatsApp] Client ${this.clientId} disconnected:`, reason);
      this.isReady = false;
      this.isConnecting = false;
      this.emit('disconnected', reason);
      
      // Handle automatic reconnection
      this._handleReconnection(reason);
    });

    // Loading screen event
    this.client.on('loading_screen', (percent, message) => {
      console.log(`[WhatsApp] Loading ${percent}% - ${message}`);
      this.emit('loading_screen', percent, message);
    });

    // State change event
    this.client.on('change_state', (state) => {
      console.log(`[WhatsApp] Client ${this.clientId} state changed to:`, state);
      this.emit('change_state', state);
    });

    // Remote session saved event
    this.client.on('remote_session_saved', () => {
      console.log(`[WhatsApp] Remote session saved for client ${this.clientId}`);
      this.emit('remote_session_saved');
    });
  }

  /**
   * Handle reconnection logic
   */
  async _handleReconnection(reason) {
    // Don't reconnect if logged out or explicitly disconnected
    const noReconnectReasons = ['LOGGED_OUT', 'UNPAIRED', 'CONFLICT', 'UNPAIRED_IDLE'];
    if (noReconnectReasons.includes(reason)) {
      console.log(`[WhatsApp] Not reconnecting due to reason: ${reason}`);
      return;
    }

    // Check reconnect attempts
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`[WhatsApp] Max reconnect attempts reached for client ${this.clientId}`);
      this.emit('reconnect_failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    console.log(
      `[WhatsApp] Attempting to reconnect client ${this.clientId} ` +
      `(attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`
    );

    setTimeout(async () => {
      try {
        await this.initialize();
      } catch (error) {
        console.error(`[WhatsApp] Reconnection attempt ${this.reconnectAttempts} failed:`, error);
      }
    }, delay);
  }

  /**
   * Send a text message
   */
  async sendMessage(chatId, message, options = {}) {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }

    try {
      const sent = await this.client.sendMessage(chatId, message, options);
      return sent;
    } catch (error) {
      console.error(`[WhatsApp] Failed to send message to ${chatId}:`, error);
      throw error;
    }
  }

  /**
   * Send media message
   */
  async sendMedia(chatId, media, options = {}) {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }

    try {
      const sent = await this.client.sendMessage(chatId, media, options);
      return sent;
    } catch (error) {
      console.error(`[WhatsApp] Failed to send media to ${chatId}:`, error);
      throw error;
    }
  }

  /**
   * Get chat by ID
   */
  async getChatById(chatId) {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }

    try {
      return await this.client.getChatById(chatId);
    } catch (error) {
      console.error(`[WhatsApp] Failed to get chat ${chatId}:`, error);
      throw error;
    }
  }

  /**
   * Get contact by ID
   */
  async getContactById(contactId) {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }

    try {
      return await this.client.getContactById(contactId);
    } catch (error) {
      console.error(`[WhatsApp] Failed to get contact ${contactId}:`, error);
      throw error;
    }
  }

  /**
   * Get client info
   */
  async getInfo() {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }

    try {
      return await this.client.info;
    } catch (error) {
      console.error('[WhatsApp] Failed to get client info:', error);
      throw error;
    }
  }

  /**
   * Get client state
   */
  getState() {
    if (!this.client) {
      return 'NOT_INITIALIZED';
    }
    return this.client.pupPage ? this.client.pupPage.getState?.() : 'UNKNOWN';
  }

  /**
   * Destroy the client and cleanup
   */
  async destroy() {
    if (this.client) {
      console.log(`[WhatsApp] Destroying client ${this.clientId}...`);
      try {
        await this.client.destroy();
        this.client = null;
        this.isReady = false;
        this.isConnecting = false;
        this.emit('destroyed');
      } catch (error) {
        console.error(`[WhatsApp] Error destroying client ${this.clientId}:`, error);
        throw error;
      }
    }
  }

  /**
   * Logout and destroy the client
   */
  async logout() {
    if (this.client) {
      console.log(`[WhatsApp] Logging out client ${this.clientId}...`);
      try {
        await this.client.logout();
        this.isReady = false;
        this.isConnecting = false;
        this.emit('logout');
      } catch (error) {
        console.error(`[WhatsApp] Error logging out client ${this.clientId}:`, error);
        throw error;
      }
    }
  }

  /**
   * Wait for client to be ready
   */
  async waitForReady(timeout = 60000) {
    if (this.isReady) {
      return true;
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Client ${this.clientId} ready timeout after ${timeout}ms`));
      }, timeout);

      this.once('ready', () => {
        clearTimeout(timer);
        resolve(true);
      });

      this.once('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }
}

export default WhatsAppClient;

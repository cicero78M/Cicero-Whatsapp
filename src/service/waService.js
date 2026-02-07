/**
 * Backward compatibility wrapper for the old waService.js
 * This file provides the same exports as the old implementation
 * to avoid breaking existing code during the refactoring.
 * 
 * This file should be gradually phased out as handlers are migrated
 * to use the new WhatsAppService directly.
 */

import { whatsappService } from '../whatsapp/index.js';

// Initialize the service
let initPromise = null;

const ensureInitialized = async () => {
  if (!initPromise) {
    initPromise = whatsappService.initialize();
  }
  await initPromise;
};

// Start initialization immediately
ensureInitialized().catch(error => {
  console.error('[waService] Failed to initialize WhatsApp service:', error);
});

// Export clients (lazy initialization)
export const waClient = new Proxy({}, {
  get(target, prop) {
    const client = whatsappService.userClient;
    if (!client) {
      throw new Error('WhatsApp user client not yet initialized');
    }
    
    // Handle common methods
    if (prop === 'sendMessage') {
      return async (chatId, message, options) => {
        await ensureInitialized();
        return await whatsappService.sendMessage(chatId, message, options);
      };
    }
    
    if (prop === 'on') {
      return (event, handler) => {
        if (client.client) {
          return client.client.on(event, handler);
        }
        // If not yet initialized, queue the listener
        ensureInitialized().then(() => {
          if (client.client) {
            client.client.on(event, handler);
          }
        });
      };
    }
    
    if (prop === 'waitForWaReady' || prop === 'waitForReady') {
      return async (timeout = 60000) => {
        await ensureInitialized();
        return await client.waitForReady(timeout);
      };
    }
    
    // Forward other properties/methods to the underlying client
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});

export const waGatewayClient = new Proxy({}, {
  get(target, prop) {
    const client = whatsappService.gatewayClient;
    if (!client) {
      throw new Error('WhatsApp gateway client not yet initialized');
    }
    
    // Handle common methods
    if (prop === 'sendMessage') {
      return async (chatId, message, options) => {
        await ensureInitialized();
        return await whatsappService.sendGatewayMessage(chatId, message, options);
      };
    }
    
    if (prop === 'on') {
      return (event, handler) => {
        if (client.client) {
          return client.client.on(event, handler);
        }
        // If not yet initialized, queue the listener
        ensureInitialized().then(() => {
          if (client.client) {
            client.client.on(event, handler);
          }
        });
      };
    }
    
    if (prop === 'waitForWaReady' || prop === 'waitForReady') {
      return async (timeout = 60000) => {
        await ensureInitialized();
        return await client.waitForReady(timeout);
      };
    }
    
    // Forward other properties/methods to the underlying client
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});

// For backward compatibility with any code expecting waUserClient
export const waUserClient = waClient;

// Export the service for direct access
export const getWhatsAppService = () => whatsappService;

// Export session manager for backward compatibility
export const sessionManager = whatsappService.getSessionManager();

// Export router for registering handlers
export const messageRouter = whatsappService.getRouter();

// Helper functions that might be used in existing code
export const registerMessageHandler = (handlerConfig) => {
  return whatsappService.registerHandler(handlerConfig);
};

export const registerCommand = (command, handler, options) => {
  return whatsappService.registerCommand(command, handler, options);
};

export const registerMenuHandler = (menuState, handler, options) => {
  return whatsappService.registerMenuHandler(menuState, handler, options);
};

// Wait for ready (backward compatibility)
export const waitForWaReady = async (timeout = 60000) => {
  await ensureInitialized();
  return await whatsappService.waitForReady(timeout);
};

export default whatsappService;

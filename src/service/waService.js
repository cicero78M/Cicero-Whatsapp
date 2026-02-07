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
      console.warn('WhatsApp user client not yet initialized');
      return undefined;
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
      console.warn('WhatsApp gateway client not yet initialized');
      return undefined;
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

// Get readiness summary (backward compatibility)
export function getWaReadinessSummary() {
  const status = whatsappService.getStatus();
  return {
    initialized: status.initialized,
    userClientReady: status.clients['wa-user']?.isReady || false,
    gatewayClientReady: status.clients['wa-gateway']?.isReady || false,
    clients: status.clients,
  };
}

// Admin notification queue (stub - to be implemented)
const adminNotificationQueue = [];

export function queueAdminNotification(message) {
  console.log('[waService] queueAdminNotification (stub):', message);
  adminNotificationQueue.push(message);
}

export function flushAdminNotificationQueue() {
  console.log('[waService] flushAdminNotificationQueue (stub)');
  const queued = [...adminNotificationQueue];
  adminNotificationQueue.length = 0;
  return queued;
}

// Wait for message queues (stub)
export async function waitForAllMessageQueues() {
  console.log('[waService] waitForAllMessageQueues (stub)');
  // TODO: Implement proper queue waiting
  return true;
}

// Send gateway message (helper)
export function sendGatewayMessage(jid, text) {
  return whatsappService.sendGatewayMessage(jid, text);
}

// Dashboard premium request functions (stubs - to be implemented)
export function buildDashboardPremiumRequestMessage(request) {
  console.log('[waService] buildDashboardPremiumRequestMessage (stub)');
  return `Premium request for ${request.client_name || 'Unknown'}`;
}

export async function sendDashboardPremiumRequestNotification(client, request) {
  console.log('[waService] sendDashboardPremiumRequestNotification (stub)');
  // TODO: Implement notification logic
}

// Gateway functions (stubs - to be implemented)
export function createHandleMessage() {
  console.log('[waService] createHandleMessage (stub)');
  // TODO: Implement handler creation
  return async () => {};
}

export async function refreshGatewayAllowedGroups() {
  console.log('[waService] refreshGatewayAllowedGroups (stub)');
  // TODO: Implement gateway group refresh
}

export function markGatewayAllowedGroupsDirty() {
  console.log('[waService] markGatewayAllowedGroupsDirty (stub)');
  // TODO: Implement dirty marking
}

export async function handleGatewayMessage() {
  console.log('[waService] handleGatewayMessage (stub)');
  // TODO: Implement gateway message handling
}

export default waClient;

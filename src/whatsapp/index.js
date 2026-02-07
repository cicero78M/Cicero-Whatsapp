/**
 * WhatsApp Module Entry Point
 * 
 * This module provides a clean, modular WhatsApp bot implementation
 * using whatsapp-web.js with best practices.
 * 
 * Architecture:
 * - WhatsAppService: Main service orchestrator
 * - ClientManager: Manages multiple WhatsApp clients
 * - WhatsAppClient: Individual client wrapper
 * - MessageRouter: Routes messages to handlers
 * - MessageDeduplicator: Prevents duplicate message processing
 * - SessionManager: Manages user sessions and menu states
 */

// Main service
export { whatsappService, getWhatsAppService, getUserClient, getGatewayClient } from './WhatsAppService.js';

// Client management
export { WhatsAppClient } from './client/WhatsAppClient.js';
export { ClientManager, clientManager } from './client/ClientManager.js';

// Message handling
export { MessageRouter } from './handlers/MessageRouter.js';

// Middleware
export { MessageDeduplicator } from './middleware/MessageDeduplicator.js';
export { SessionManager } from './middleware/SessionManager.js';

// Default export
export { whatsappService as default } from './WhatsAppService.js';

import { BaseHandler } from '../BaseHandler.js';

/**
 * Example command handler that shows system status
 * This demonstrates the basic pattern for creating command handlers
 */
export class StatusCommandHandler extends BaseHandler {
  constructor() {
    super('StatusCommand');
  }

  /**
   * Register this handler with the router
   */
  register(router, whatsappService) {
    // Register as a command handler
    router.registerCommand('status', async (message, context) => {
      return await this.handleStatus(message, context, whatsappService);
    }, {
      priority: 100,
    });

    console.log(`[${this.name}] Registered`);
  }

  /**
   * Handle the status command
   */
  async handleStatus(message, context, whatsappService) {
    try {
      const status = whatsappService.getStatus();
      
      const statusText = this._formatStatus(status);
      
      await this.reply(message, statusText);
      
      return { handled: true };
    } catch (error) {
      console.error(`[${this.name}] Error:`, error);
      await this.reply(message, '⚠️ Gagal mengambil status sistem.');
      return { handled: true, error };
    }
  }

  /**
   * Format status information
   */
  _formatStatus(status) {
    const lines = [
      '🤖 *Status Sistem WhatsApp*',
      '',
      '📱 *Klien:*',
    ];

    // Client status
    for (const [clientId, clientStatus] of Object.entries(status.clients)) {
      const statusIcon = clientStatus.isReady ? '🟢' : '🔴';
      lines.push(`${statusIcon} ${clientId}: ${clientStatus.state || 'Unknown'}`);
    }

    lines.push('');
    lines.push('💬 *Statistik:*');
    lines.push(`Sessions: ${status.sessions.totalSessions}`);
    lines.push(`Cache: ${status.deduplication.cacheSize} messages`);
    lines.push(`Handlers: ${status.handlers.length} registered`);

    return lines.join('\n');
  }
}

export default StatusCommandHandler;

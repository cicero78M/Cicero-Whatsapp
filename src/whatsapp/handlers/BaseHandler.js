/**
 * Base handler class for WhatsApp bot handlers
 * Provides common utilities and patterns for building menu-driven handlers
 */
export class BaseHandler {
  constructor(name) {
    this.name = name;
  }

  /**
   * Register this handler with a router
   */
  register() {
    throw new Error('register() must be implemented by subclass');
  }

  /**
   * Reply to a message
   */
  async reply(message, text) {
    try {
      return await message.reply(text);
    } catch (error) {
      console.error(`[${this.name}] Failed to reply:`, error);
      throw error;
    }
  }

  /**
   * Send a message to a chat
   */
  async sendMessage(client, chatId, text) {
    try {
      return await client.sendMessage(chatId, text);
    } catch (error) {
      console.error(`[${this.name}] Failed to send message:`, error);
      throw error;
    }
  }

  /**
   * Set session state
   */
  setState(sessionManager, chatId, state, data = {}) {
    sessionManager.setState(chatId, state, data);
  }

  /**
   * Get session data
   */
  getSessionData(sessionManager, chatId, key = null) {
    return sessionManager.getData(chatId, key);
  }

  /**
   * Clear session
   */
  clearSession(sessionManager, chatId) {
    sessionManager.clearState(chatId);
  }

  /**
   * Check if user typed 'batal' or cancel
   */
  isCancelCommand(text) {
    const normalized = text.trim().toLowerCase();
    return normalized === 'batal' || normalized === 'cancel';
  }

  /**
   * Send cancel message and clear session
   */
  async handleCancel(message, sessionManager) {
    const chatId = message.from;
    this.clearSession(sessionManager, chatId);
    await this.reply(
      message,
      'Terima kasih. Sesi ditutup. Ketik menu command untuk memulai lagi.'
    );
  }
}

export default BaseHandler;

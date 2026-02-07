import StatusCommandHandler from './commands/StatusCommand.js';

/**
 * Handler Registry
 * Central place to register all message handlers with the router
 */
export class HandlerRegistry {
  constructor() {
    this.handlers = [];
  }

  /**
   * Initialize and register all handlers
   */
  initialize(router, whatsappService) {
    console.log('[HandlerRegistry] Initializing handlers...');

    // Register command handlers
    this._registerCommandHandlers(router, whatsappService);

    // Register menu handlers (to be implemented)
    // this._registerMenuHandlers(router, whatsappService);

    console.log(`[HandlerRegistry] Registered ${this.handlers.length} handlers`);
  }

  /**
   * Register all command handlers
   */
  _registerCommandHandlers(router, whatsappService) {
    const commandHandlers = [
      new StatusCommandHandler(),
      // Add more command handlers here
    ];

    commandHandlers.forEach((handler) => {
      handler.register(router, whatsappService);
      this.handlers.push(handler);
    });
  }

  /**
   * Register all menu handlers
   */
  _registerMenuHandlers() {
    // Menu handlers will be added here during migration
    // Example:
    // const menuHandlers = [
    //   new UserMenuHandler(),
    //   new ClientRequestHandler(),
    //   ...
    // ];
    //
    // menuHandlers.forEach((handler) => {
    //   handler.register(router, whatsappService);
    //   this.handlers.push(handler);
    // });
  }

  /**
   * Get all registered handlers
   */
  getHandlers() {
    return this.handlers;
  }
}

export default HandlerRegistry;

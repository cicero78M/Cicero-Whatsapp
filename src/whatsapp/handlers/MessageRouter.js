import { EventEmitter } from 'events';

/**
 * MessageRouter handles routing of incoming WhatsApp messages
 * to appropriate handlers based on message type, sender, content, etc.
 */
export class MessageRouter extends EventEmitter {
  constructor() {
    super();
    this.handlers = [];
    this.middleware = [];
    this.commandPrefix = process.env.WA_COMMAND_PREFIX || '!';
  }

  /**
   * Add middleware to the processing pipeline
   * Middleware can modify message or context before handlers
   */
  use(middleware) {
    if (typeof middleware !== 'function') {
      throw new Error('Middleware must be a function');
    }
    this.middleware.push(middleware);
    return this;
  }

  /**
   * Register a message handler
   * Handler format: { name, priority, filter, handler }
   */
  registerHandler(handlerConfig) {
    const {
      name,
      priority = 0,
      filter = () => true,
      handler,
    } = handlerConfig;

    if (!name || typeof handler !== 'function') {
      throw new Error('Handler must have a name and handler function');
    }

    this.handlers.push({
      name,
      priority,
      filter: typeof filter === 'function' ? filter : () => true,
      handler,
    });

    // Sort handlers by priority (higher priority first)
    this.handlers.sort((a, b) => b.priority - a.priority);

    console.log(`[MessageRouter] Registered handler: ${name} (priority: ${priority})`);
  }

  /**
   * Register a command handler (messages starting with command prefix)
   */
  registerCommand(command, handler, options = {}) {
    const { 
      priority = 0,
      requiresAuth = false,
    } = options;

    this.registerHandler({
      name: `command:${command}`,
      priority,
      filter: (message, context) => {
        const body = message.body?.trim() || '';
        const prefix = this.commandPrefix;
        
        console.log(`[MessageRouter] Command filter '${command}': checking body="${body}" against prefix="${prefix}${command}"`);
        
        // Check if message starts with command
        if (!body.startsWith(prefix + command)) {
          console.log(`[MessageRouter] Command '${command}' did not match`);
          return false;
        }

        // Extract arguments
        const args = body.slice(prefix.length + command.length).trim().split(/\s+/);
        context.command = {
          name: command,
          args,
          full: body,
        };

        console.log(`[MessageRouter] Command '${command}' matched! Args: ${JSON.stringify(args)}`);
        return true;
      },
      handler: async (message, context) => {
        // Check auth if required
        if (requiresAuth && !context.user) {
          await message.reply('⚠️ This command requires authentication.');
          return { handled: true };
        }

        return await handler(message, context);
      },
    });

    console.log(`[MessageRouter] Registered command: ${command}`);
  }

  /**
   * Register a menu state handler
   */
  registerMenuHandler(menuState, handler, options = {}) {
    const { priority = 0 } = options;

    this.registerHandler({
      name: `menu:${menuState}`,
      priority,
      filter: (message, context) => {
        return context.session?.state === menuState;
      },
      handler,
    });
  }

  /**
   * Process an incoming message through middleware and handlers
   */
  async processMessage(message, client, context = {}) {
    console.log(`[MessageRouter] Processing message from ${message.from}: ${message.body?.substring(0, 50) || '[no body]'}`);
    
    try {
      // Initialize context
      const ctx = {
        ...context,
        client,
        router: this,
        timestamp: Date.now(),
      };

      // Run middleware pipeline
      console.log(`[MessageRouter] Running ${this.middleware.length} middleware...`);
      for (const mw of this.middleware) {
        try {
          const result = await mw(message, ctx);
          
          // If middleware returns false, stop processing
          if (result === false) {
            console.log(`[MessageRouter] Message blocked by middleware`);
            return { handled: false, blocked: true };
          }

          // If middleware returns an object with handled: true, stop
          if (result && result.handled === true) {
            console.log(`[MessageRouter] Message handled by middleware`);
            return result;
          }
        } catch (error) {
          console.error('[MessageRouter] Middleware error:', error);
          this.emit('middleware_error', error, message, ctx);
        }
      }

      console.log(`[MessageRouter] Middleware pipeline complete, finding handlers...`);
      
      // Find matching handlers
      const matchingHandlers = this.handlers.filter((h) => {
        try {
          return h.filter(message, ctx);
        } catch (error) {
          console.error(`[MessageRouter] Filter error in handler ${h.name}:`, error);
          return false;
        }
      });

      if (matchingHandlers.length === 0) {
        console.log('[MessageRouter] No handler found for message');
        this.emit('no_handler', message, ctx);
        return { handled: false };
      }

      console.log(`[MessageRouter] Found ${matchingHandlers.length} matching handler(s)`);
      
      // Execute first matching handler
      const handler = matchingHandlers[0];
      console.log(`[MessageRouter] Processing with handler: ${handler.name}`);

      try {
        const result = await handler.handler(message, ctx);
        this.emit('message_handled', handler.name, message, ctx, result);
        console.log(`[MessageRouter] Handler ${handler.name} completed successfully`);
        return { handled: true, handler: handler.name, result };
      } catch (error) {
        console.error(`[MessageRouter] Handler error (${handler.name}):`, error);
        this.emit('handler_error', error, handler.name, message, ctx);
        
        // Try to send error message to user
        try {
          await message.reply('⚠️ An error occurred while processing your message. Please try again later.');
        } catch (replyError) {
          console.error('[MessageRouter] Failed to send error message:', replyError);
        }

        return { handled: true, error };
      }
    } catch (error) {
      console.error('[MessageRouter] Fatal error processing message:', error);
      this.emit('fatal_error', error, message, context);
      return { handled: false, error };
    }
  }

  /**
   * Remove a handler by name
   */
  removeHandler(name) {
    const index = this.handlers.findIndex((h) => h.name === name);
    if (index !== -1) {
      this.handlers.splice(index, 1);
      console.log(`[MessageRouter] Removed handler: ${name}`);
      return true;
    }
    return false;
  }

  /**
   * Get all registered handlers
   */
  getHandlers() {
    return this.handlers.map((h) => ({
      name: h.name,
      priority: h.priority,
    }));
  }

  /**
   * Clear all handlers
   */
  clearHandlers() {
    this.handlers = [];
    console.log('[MessageRouter] All handlers cleared');
  }

  /**
   * Clear all middleware
   */
  clearMiddleware() {
    this.middleware = [];
    console.log('[MessageRouter] All middleware cleared');
  }
}

export default MessageRouter;

# WhatsApp Bot Architecture Documentation

## Overview

The WhatsApp bot has been completely refactored using a modern, modular architecture built on top of `whatsapp-web.js` (wwebjs). This new implementation follows best practices for maintainability, scalability, and testability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    app.js (Entry Point)                     │
│  - Imports WhatsAppService via waService.js wrapper        │
│  - Starts Express server                                    │
│  - Loads cron jobs when clients are ready                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│          WhatsAppService (Main Orchestrator)                │
│  - Initializes all components                               │
│  - Manages client lifecycle                                 │
│  - Coordinates middleware and routing                       │
│  - Provides unified API for sending messages               │
└─────┬────────────────┬───────────────┬──────────────────────┘
      │                │               │
      ▼                ▼               ▼
┌──────────┐  ┌────────────────┐  ┌──────────────────┐
│ Client   │  │  Message       │  │  Handler         │
│ Manager  │  │  Router        │  │  Registry        │
└──────────┘  └────────────────┘  └──────────────────┘
      │                │                     │
      ▼                ▼                     ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────┐
│ WhatsApp     │  │  Middleware      │  │  Command &   │
│ Clients      │  │  - Deduplicator  │  │  Menu        │
│ - User       │  │  - Session Mgr   │  │  Handlers    │
│ - Gateway    │  │  - Logger        │  │              │
└──────────────┘  └──────────────────┘  └──────────────┘
```

## Core Components

### 1. WhatsAppService (`src/whatsapp/WhatsAppService.js`)

**Purpose**: Main orchestrator that ties all components together.

**Responsibilities**:
- Initialize all components (clients, router, middleware, handlers)
- Coordinate message flow from clients through middleware to handlers
- Provide unified API for sending messages
- Manage service lifecycle

**Key Methods**:
- `initialize()` - Initialize the service and all components
- `sendMessage(chatId, message)` - Send message via user client
- `sendGatewayMessage(chatId, message)` - Send message via gateway client
- `getStatus()` - Get status of all components
- `registerHandler()` - Register a new message handler
- `destroy()` - Cleanup and shutdown

### 2. ClientManager (`src/whatsapp/client/ClientManager.js`)

**Purpose**: Manages multiple WhatsApp clients.

**Responsibilities**:
- Create and configure WhatsApp clients
- Track client state and readiness
- Forward client events to subscribers
- Provide centralized client access

**Key Features**:
- Supports multiple concurrent clients (user, gateway, etc.)
- Event forwarding with client identification
- Default client management
- Status monitoring

### 3. WhatsAppClient (`src/whatsapp/client/WhatsAppClient.js`)

**Purpose**: Clean wrapper around whatsapp-web.js Client with best practices.

**Key Features**:
- **Event-Driven**: Emits events for QR, ready, messages, disconnection
- **Auto-Reconnection**: Intelligent reconnection with exponential backoff
- **QR Code Display**: Terminal QR code for easy authentication
- **State Management**: Tracks connection state and readiness
- **Error Handling**: Comprehensive error handling and logging

**Important Events**:
- `qr` - QR code received (scan to authenticate)
- `ready` - Client is authenticated and ready
- `authenticated` - Successful authentication
- `message` - Incoming message
- `disconnected` - Client disconnected
- `auth_failure` - Authentication failed

**Configuration Options**:
```javascript
{
  authDataPath: '/path/to/auth/data',
  maxReconnectAttempts: 5,
  reconnectDelay: 5000,
  puppeteerTimeout: 120000,
  executablePath: '/path/to/chrome'
}
```

### 4. MessageRouter (`src/whatsapp/handlers/MessageRouter.js`)

**Purpose**: Routes incoming messages to appropriate handlers.

**Key Features**:
- **Middleware Pipeline**: Process messages through middleware chain
- **Priority-Based Routing**: Handlers have priorities for execution order
- **Filter System**: Each handler has a filter to determine if it should handle a message
- **Command Support**: Built-in command handler registration
- **Menu State Support**: Menu-based handler registration

**Handler Registration**:
```javascript
router.registerHandler({
  name: 'my-handler',
  priority: 100,
  filter: (message, context) => message.body.includes('keyword'),
  handler: async (message, context) => {
    await message.reply('Response');
    return { handled: true };
  }
});
```

**Command Registration**:
```javascript
router.registerCommand('status', async (message, context) => {
  await message.reply('Status: OK');
  return { handled: true };
}, {
  priority: 100,
  requiresAuth: false
});
```

### 5. Middleware

#### MessageDeduplicator (`src/whatsapp/middleware/MessageDeduplicator.js`)

**Purpose**: Prevents duplicate message processing.

**How it works**:
- Generates unique key for each message (based on message ID)
- Stores processed messages in cache with TTL (24 hours default)
- Blocks duplicate messages from being processed
- Automatic cleanup of expired entries

#### SessionManager (`src/whatsapp/middleware/SessionManager.js`)

**Purpose**: Manages user sessions and menu states.

**Features**:
- Per-chat session storage
- State machine support for menu flows
- Automatic expiration (30 minutes default)
- Data persistence across message flows

**Usage**:
```javascript
// In a handler
const session = context.session;
session.state = 'waiting-for-name';
session.data.step = 1;

// Later messages
if (session.state === 'waiting-for-name') {
  // Handle name input
}
```

### 6. Handler System

#### BaseHandler (`src/whatsapp/handlers/BaseHandler.js`)

**Purpose**: Base class for all message handlers.

**Utilities Provided**:
- `reply(message, text)` - Reply to a message
- `sendMessage(client, chatId, text)` - Send a message
- `setState(sessionManager, chatId, state, data)` - Set session state
- `getSessionData(sessionManager, chatId, key)` - Get session data
- `clearSession(sessionManager, chatId)` - Clear session
- `isCancelCommand(text)` - Check if user typed 'batal'
- `handleCancel(message, sessionManager)` - Handle cancel command

#### HandlerRegistry (`src/whatsapp/handlers/HandlerRegistry.js`)

**Purpose**: Central registry for all message handlers.

**Responsibilities**:
- Register all command handlers
- Register all menu handlers
- Organize handlers by type
- Initialize handlers on service startup

## Message Flow

```
1. WhatsApp receives message
   ↓
2. WhatsAppClient emits 'message' event
   ↓
3. WhatsAppService receives event
   ↓
4. MessageRouter.processMessage() called
   ↓
5. Middleware pipeline executes:
   - MessageDeduplicator: Check if duplicate
   - SessionManager: Attach session to context
   - Logger: Log message
   ↓
6. Router finds matching handlers (by filter)
   ↓
7. Execute highest priority handler
   ↓
8. Handler processes message and returns result
   ↓
9. Response sent back to user
```

## Session-Based Menu Flow Example

```javascript
// Register menu handlers
router.registerMenuHandler('input-name', async (message, context) => {
  const name = message.body.trim();
  
  // Save to session
  context.session.data.name = name;
  
  // Move to next state
  context.session.state = 'input-age';
  
  await message.reply('Nama tersimpan. Sekarang masukkan umur Anda:');
  return { handled: true };
});

router.registerMenuHandler('input-age', async (message, context) => {
  const age = parseInt(message.body.trim());
  
  // Save to session
  context.session.data.age = age;
  
  // Complete the flow
  const { name } = context.session.data;
  await message.reply(`Terima kasih ${name}, umur ${age} tahun.`);
  
  // Clear session
  context.session.state = null;
  context.session.data = {};
  
  return { handled: true };
});
```

## Backward Compatibility

The refactored implementation maintains backward compatibility through a wrapper layer (`src/service/waService.js`). This wrapper provides the same exports as the old implementation:

- `waClient` - User client proxy
- `waGatewayClient` - Gateway client proxy  
- `waUserClient` - Alias for waClient
- `sessionManager` - Session manager instance
- `messageRouter` - Message router instance

**Old code continues to work**:
```javascript
import { waClient } from './service/waService.js';

await waClient.sendMessage(chatId, 'Hello');
```

**New code can use the service directly**:
```javascript
import { whatsappService } from './whatsapp/index.js';

await whatsappService.sendMessage(chatId, 'Hello');
```

## Environment Variables

### Client Configuration
- `USER_WA_CLIENT_ID` - Client ID for user client (default: 'wa-user')
- `GATEWAY_WA_CLIENT_ID` - Client ID for gateway client (default: 'wa-gateway')
- `WA_AUTH_DATA_PATH` - Path to auth data directory
- `WA_COMMAND_PREFIX` - Command prefix (default: '!')

### Debug & Logging
- `WA_DEBUG_LOGGING` - Enable debug logging (default: false)

## Creating New Handlers

### 1. Create a Command Handler

```javascript
// src/whatsapp/handlers/commands/MyCommand.js
import { BaseHandler } from '../BaseHandler.js';

export class MyCommandHandler extends BaseHandler {
  constructor() {
    super('MyCommand');
  }

  register(router, whatsappService) {
    router.registerCommand('mycommand', async (message, context) => {
      return await this.handleCommand(message, context);
    }, {
      priority: 100,
    });
  }

  async handleCommand(message, context) {
    await this.reply(message, 'Command executed!');
    return { handled: true };
  }
}
```

### 2. Register Handler

```javascript
// src/whatsapp/handlers/HandlerRegistry.js
import MyCommandHandler from './commands/MyCommand.js';

_registerCommandHandlers(router, whatsappService) {
  const commandHandlers = [
    new StatusCommandHandler(),
    new MyCommandHandler(), // Add here
  ];
  
  commandHandlers.forEach(handler => {
    handler.register(router, whatsappService);
    this.handlers.push(handler);
  });
}
```

## Best Practices

### 1. Handler Design
- **Single Responsibility**: Each handler should handle one type of interaction
- **Use Sessions**: Store multi-step flow data in sessions
- **Check for Cancel**: Always allow users to cancel with 'batal'
- **Error Handling**: Wrap handler logic in try-catch
- **User Feedback**: Always send a response to the user

### 2. Message Handling
- **Filter Early**: Use filters to reject irrelevant messages quickly
- **Priority Order**: Set priorities to control handler execution order
- **Context Usage**: Store handler-specific data in context, not global variables

### 3. Session Management
- **Timeout Awareness**: Sessions expire after 30 minutes of inactivity
- **Clear on Complete**: Clear session state when flow is complete
- **Validation**: Validate user input before saving to session

### 4. Client Usage
- **User Client**: Use for direct user interactions
- **Gateway Client**: Use for broadcasts and group messages
- **Check Ready**: Always check client is ready before sending

## Migration Guide

To migrate old handlers to the new architecture:

1. **Create Handler Class** extending `BaseHandler`
2. **Move Logic** from old function-based handlers to class methods
3. **Use Context** instead of global session storage
4. **Register Handler** in `HandlerRegistry`
5. **Test** the handler independently
6. **Update References** in cron jobs, services, etc.

## Testing

### Manual Testing
1. Start the app: `npm start`
2. Scan QR code in terminal
3. Send test messages to the bot
4. Check console logs for message flow

### Command Testing
```
Send: !status
Expected: Status message with client information
```

### Menu Testing
```
Send: userrequest
Expected: Menu prompts with session state tracking
```

## Troubleshooting

### Client Won't Connect
- Check `WA_AUTH_DATA_PATH` is accessible
- Delete auth data and re-authenticate
- Check Chrome/Chromium is installed
- Verify puppeteer settings

### Messages Not Routing
- Check handler is registered in `HandlerRegistry`
- Verify filter function returns true
- Check handler priority order
- Enable debug logging

### Session Issues
- Sessions expire after 30 minutes
- Check session state is being set correctly
- Verify SessionManager middleware is registered

## Performance Considerations

- **Message Deduplication**: 24-hour cache prevents reprocessing
- **Session Cleanup**: Automatic cleanup every 5 minutes
- **Connection Pooling**: Reuse WhatsApp client connections
- **Async Processing**: All message handling is asynchronous

## Security

- **Auth Data**: Stored securely in configured directory
- **Session Isolation**: Each chat has isolated session
- **Input Validation**: Always validate user input
- **Command Auth**: Support for requiring authentication on commands
- **No Secrets in Logs**: Sensitive data is not logged

## Future Enhancements

- [ ] Redis-based session storage for multi-instance support
- [ ] Message queue integration (BullMQ) for async processing
- [ ] Webhook support for external integrations
- [ ] Handler hot-reloading during development
- [ ] Metrics and monitoring dashboard
- [ ] Unit tests for all handlers
- [ ] Integration tests for message flows

## Support

For issues or questions about the WhatsApp bot architecture:
1. Check this documentation
2. Review handler examples in `src/whatsapp/handlers/`
3. Check console logs for error messages
4. Consult wwebjs documentation: https://wwebjs.dev/

---

*Last Updated: 2026-02-07*
*Version: 2.0.0*

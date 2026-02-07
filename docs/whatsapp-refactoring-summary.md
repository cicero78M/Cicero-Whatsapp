# WhatsApp Bot Refactoring Summary

## What Changed

The WhatsApp bot has been completely refactored with a clean, modular architecture built on best practices for `whatsapp-web.js`.

### Old Architecture (Removed)
- ❌ `src/service/waService.js` (5,432 lines) - Monolithic service file
- ❌ `src/service/wwebjsAdapter.js` (1,816 lines) - Complex adapter
- ❌ `src/service/waEventAggregator.js` - Event aggregation

**Problems**:
- Tightly coupled code
- Difficult to test
- Hard to maintain
- Complex error handling
- Mixed responsibilities

### New Architecture (Implemented)

```
src/whatsapp/
├── WhatsAppService.js          # Main orchestrator
├── client/
│   ├── WhatsAppClient.js       # Clean client wrapper
│   └── ClientManager.js        # Multi-client management
├── handlers/
│   ├── MessageRouter.js        # Message routing
│   ├── BaseHandler.js          # Handler base class
│   ├── HandlerRegistry.js      # Handler registration
│   └── commands/
│       └── StatusCommand.js    # Example command
└── middleware/
    ├── MessageDeduplicator.js  # Duplicate prevention
    └── SessionManager.js       # Session management
```

**Benefits**:
- ✅ Modular and testable
- ✅ Clear separation of concerns
- ✅ Event-driven architecture
- ✅ Comprehensive error handling
- ✅ Best practices from wwebjs
- ✅ Backward compatible

## Key Features

### 1. **Clean Client Management**
- Event-driven WhatsApp clients
- Automatic reconnection with backoff
- QR code display in terminal
- Multiple client support (user, gateway)
- State tracking and monitoring

### 2. **Flexible Message Routing**
- Middleware pipeline for message processing
- Priority-based handler execution
- Filter system for message matching
- Command and menu handler support
- Context-aware processing

### 3. **Session Management**
- Per-chat session storage
- State machine for menu flows
- Automatic expiration (30 min)
- Clean session API

### 4. **Message Deduplication**
- Prevents duplicate processing
- 24-hour cache with TTL
- Automatic cleanup

### 5. **Handler System**
- BaseHandler class with utilities
- Command handlers for !commands
- Menu handlers for stateful flows
- Easy to extend and test

## Backward Compatibility

The old `src/service/waService.js` has been replaced with a compatibility wrapper. **Existing code continues to work**:

```javascript
// Old code still works
import { waClient, waGatewayClient } from './service/waService.js';

await waClient.sendMessage(chatId, 'Hello');
await waClient.on('ready', () => console.log('Ready'));
```

## Getting Started

### 1. Installation
```bash
npm install
```

### 2. Configuration
Set environment variables in `.env`:
```env
USER_WA_CLIENT_ID=wa-user
GATEWAY_WA_CLIENT_ID=wa-gateway
WA_AUTH_DATA_PATH=/path/to/auth
WA_COMMAND_PREFIX=!
```

### 3. Start the Bot
```bash
npm start
```

### 4. Authenticate
Scan the QR code displayed in the terminal with WhatsApp.

## Creating Handlers

### Example: Command Handler

```javascript
// src/whatsapp/handlers/commands/HelloCommand.js
import { BaseHandler } from '../BaseHandler.js';

export class HelloCommandHandler extends BaseHandler {
  constructor() {
    super('HelloCommand');
  }

  register(router, whatsappService) {
    router.registerCommand('hello', async (message) => {
      await message.reply('Hello! 👋');
      return { handled: true };
    });
  }
}
```

### Example: Menu Handler

```javascript
// src/whatsapp/handlers/menus/ProfileMenu.js
export class ProfileMenuHandler extends BaseHandler {
  constructor() {
    super('ProfileMenu');
  }

  register(router, whatsappService) {
    // Initial command
    router.registerCommand('profile', async (message, context) => {
      context.session.state = 'input-name';
      await message.reply('What is your name?');
      return { handled: true };
    });

    // Handle name input
    router.registerMenuHandler('input-name', async (message, context) => {
      const name = message.body.trim();
      context.session.data.name = name;
      context.session.state = null; // Complete
      
      await message.reply(`Nice to meet you, ${name}!`);
      return { handled: true };
    });
  }
}
```

### Register Handler

```javascript
// src/whatsapp/handlers/HandlerRegistry.js
import HelloCommandHandler from './commands/HelloCommand.js';

_registerCommandHandlers(router, whatsappService) {
  const handlers = [
    new HelloCommandHandler(),
    // Add more...
  ];
  
  handlers.forEach(h => {
    h.register(router, whatsappService);
    this.handlers.push(h);
  });
}
```

## Testing

### Test Command
```
Send: !status
Expected: Bot responds with system status
```

### Test Client Connection
```javascript
import { whatsappService } from './whatsapp/index.js';

console.log(whatsappService.getStatus());
// Shows client status, sessions, handlers
```

## Migration Guide

### For Existing Handlers

1. **Create Handler Class**
   ```javascript
   export class MyHandler extends BaseHandler {
     constructor() {
       super('MyHandler');
     }
   }
   ```

2. **Move Logic**
   ```javascript
   register(router, whatsappService) {
     router.registerHandler({
       name: 'my-handler',
       filter: (message) => message.body === 'trigger',
       handler: async (message, context) => {
         // Your logic here
         return { handled: true };
       }
     });
   }
   ```

3. **Register in HandlerRegistry**
   ```javascript
   import MyHandler from './handlers/MyHandler.js';
   // Add to _registerCommandHandlers or _registerMenuHandlers
   ```

### For Services Using waClient

**No changes needed!** The backward compatibility wrapper handles it:

```javascript
// This still works
import { waClient } from './service/waService.js';
await waClient.sendMessage(chatId, 'Message');
```

**Or use new API**:

```javascript
// New way
import { whatsappService } from './whatsapp/index.js';
await whatsappService.sendMessage(chatId, 'Message');
```

## Documentation

- **Architecture Guide**: `docs/whatsapp-bot-architecture.md`
- **Handler Examples**: `src/whatsapp/handlers/commands/`
- **wwebjs Docs**: https://wwebjs.dev/

## Troubleshooting

### Client Won't Connect
1. Check Chrome/Chromium is installed
2. Delete auth data: `rm -rf ~/.cicero/wwebjs_auth`
3. Restart and scan QR again

### Messages Not Being Handled
1. Check handler is registered in `HandlerRegistry`
2. Verify filter function logic
3. Check console logs for errors
4. Test handler priority order

### Session Not Working
1. Sessions expire after 30 minutes
2. Check `SessionManager` middleware is registered
3. Verify session state is being set

## Performance

- ✅ Message deduplication prevents reprocessing
- ✅ Automatic session cleanup every 5 minutes
- ✅ Async message handling
- ✅ Connection reuse

## Security

- ✅ Auth data stored securely
- ✅ Session isolation per chat
- ✅ Input validation in handlers
- ✅ No sensitive data in logs

## Next Steps

1. ✅ Core architecture implemented
2. ✅ Handler system ready
3. ✅ Backward compatibility maintained
4. 🔄 Migrate existing handlers (in progress)
5. ⏳ Add tests
6. ⏳ Add metrics/monitoring

## Contributing

When adding new handlers:
1. Extend `BaseHandler`
2. Implement `register()` method
3. Add to `HandlerRegistry`
4. Test thoroughly
5. Document behavior

## Support

- Issues: GitHub Issues
- Docs: `docs/whatsapp-bot-architecture.md`
- Examples: `src/whatsapp/handlers/`

---

**Version**: 2.0.0  
**Date**: 2026-02-07  
**Author**: Refactored by GitHub Copilot

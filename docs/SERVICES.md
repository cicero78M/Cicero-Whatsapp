# Services Documentation
*Last updated: 2026-02-06*

This document provides a comprehensive overview of all business logic services in the Cicero WhatsApp Backend.

## Overview

The `src/service/` directory contains **50+ service modules** that implement all business logic. Services are organized by functional domain and follow a consistent pattern of separation from controllers and models.

## Service Categories

### WhatsApp Services (6 services)

#### Core WhatsApp Services

**waService.js** - Main WhatsApp client management
- Admin/operator WhatsApp session management
- Message sending and receiving
- QR code authentication
- Connection state management
- Event handlers (ready, message, auth_failure)

**waUserService.js** - User-facing WhatsApp client
- User request handling
- User menu interactions
- Session isolated from admin client
- Dedicated client ID (`USER_WA_CLIENT_ID`)

**waGatewayService.js** - Gateway/broadcast client
- Mass message distribution
- Report broadcasting to groups
- Directorate communication
- Separate session (`GATEWAY_WA_CLIENT_ID`)

**waOutbox.js** - Message queue management
- Message queuing and throttling
- Delivery retry logic
- Failed message handling
- Rate limiting

**waAutoComplaintService.js** - Automated complaint forwarding
- Complaint routing logic
- Automatic forwarding to admins
- Complaint status tracking

**wwebjsAdapter.js** - WhatsApp Web.js adapter
- Low-level WhatsApp Web.js integration
- Browser automation (Puppeteer)
- Session storage (LocalAuth)
- Protocol timeout management
- Reconnection logic with backoff

---

### Social Media Services (15+ services)

#### Instagram Services

**instagramApi.js** - Instagram API client
- Low-level API communication
- Request/response handling
- Error handling and retries

**instaPostService.js** - Instagram post management
- Post creation and updates
- Post retrieval and filtering
- Post statistics calculation

**instaLikeService.js** - Instagram like tracking
- Like recording and updates
- Like count aggregation
- User engagement tracking

**instaCommentService.js** - Instagram comment tracking
- Comment collection
- Comment count tracking
- User comment activity

**instaProfileService.js** - Instagram profile management
- Profile data management
- Profile caching
- Profile updates

**instaRapidService.js** - RapidAPI Instagram integration
- RapidAPI endpoint communication
- Primary and fallback key support
- Response normalization
- Rate limit handling

**instaStoryService.js** - Instagram story tracking
- Story collection
- Story expiration handling

#### TikTok Services

**tiktokApi.js** - TikTok API client
- Low-level TikTok API communication
- Request/response handling

**tiktokPostService.js** - TikTok video management
- Video data management
- Video statistics tracking

**tiktokCommentService.js** - TikTok comment tracking
- Comment collection and storage
- Comment count aggregation

**tiktokRapidService.js** - RapidAPI TikTok integration
- RapidAPI TikTok endpoint communication
- Primary and fallback key/host support
- Timezone normalization (UTC → Asia/Jakarta)
- Response format normalization

**tiktokSnapshotService.js** - TikTok daily snapshots
- Daily engagement snapshots
- Historical tracking

#### Satbinmas Services

**satbinmasOfficialAccountService.js** - Satbinmas account management
- Official account tracking
- Account validation

**satbinmasOfficialMediaService.js** - Satbinmas media tracking
- Official media post tracking
- Engagement monitoring

---

### Reporting Services (15+ services)

#### Daily Reports

**likesRecapExcelService.js** - Daily likes recap
- Generates Excel file with daily Instagram likes
- Per-user like counts
- Client/division grouping
- Date range filtering

**commentRecapExcelService.js** - Daily comments recap
- Generates Excel file with daily TikTok comments
- Per-user comment counts
- Client/division grouping

**dailyEngagementService.js** - Daily engagement summary
- Combined Instagram + TikTok engagement
- Daily totals and rankings

#### Weekly/Monthly Reports

**weeklyLikesRecapExcelService.js** - Weekly likes recap
- 7-day Instagram like summary
- Weekly rankings
- Trend analysis

**monthlyLikesRecapExcelService.js** - Monthly likes recap
- 30-day Instagram like summary
- Monthly rankings
- Progress tracking

**weeklyCommentRecapExcelService.js** - Weekly comments recap
- 7-day TikTok comment summary

**monthlyCommentRecapExcelService.js** - Monthly comments recap
- 30-day TikTok comment summary

#### Specialized Reports

**engagementRankingExcelService.js** - Engagement ranking reports
- Ranked list of top performers
- Multiple engagement metrics
- Configurable time ranges

**linkReportExcelService.js** - Link amplification reports
- Link sharing tracking
- Amplification metrics
- Distribution analysis

**kasatkerReportService.js** - Kasatker (unit leader) reports
- Unit-level summaries
- Leadership dashboards

**kasatBinmasLikesRecapService.js** - Kasatbinmas likes recap
- Binmas-specific like tracking
- Hierarchical reporting

**satbinmasMediaReportService.js** - Satbinmas media reports
- Official account engagement
- Media performance metrics

---

### Core Business Services (15+ services)

#### User & Client Services

**clientService.js** - Client business logic
- Client creation and management
- Client validation
- Client statistics

**userService.js** - User business logic
- User creation and updates
- Role management
- Profile management

**dashboardUserService.js** - Dashboard user management
- Dashboard-specific user logic
- Registration approval workflow
- Premium subscription tracking

**penmasUserService.js** - Penmas user management
- Penmas operator management
- Editorial workflow users

#### Authentication & Security

**authService.js** - Authentication logic
- JWT token generation
- Token validation
- Password hashing (bcrypt)
- Login attempt tracking

**otpService.js** - OTP generation and validation
- 6-digit OTP generation
- 15-minute expiration
- OTP validation
- Redis storage for tracking

**passwordResetService.js** - Password reset logic
- Reset token generation
- Token validation (15 min expiry)
- Password update

#### Premium & Subscriptions

**premiumService.js** - Premium subscription logic
- Tier management (Free, Basic, Premium)
- Feature access validation
- Subscription creation

**premiumExpiryService.js** - Premium expiration handling
- Daily expiration checks
- Automatic tier downgrade
- Expiration notifications

**premiumRequestService.js** - Premium request workflow
- Request creation and tracking
- Admin approval process
- Status updates

#### Request & Approval

**approvalRequestService.js** - Approval workflow logic
- Request creation
- Approval/rejection handling
- Status tracking
- Notification dispatch

**complaintService.js** - Complaint handling
- Complaint submission
- Complaint routing
- Status tracking

---

### Communication Services (4 services)

**emailService.js** - Email delivery
- SMTP integration (Nodemailer)
- OTP email templates
- Complaint notification emails
- Password reset emails
- Configurable SMTP settings

**telegramService.js** - Telegram bot integration
- Bot message sending
- Admin notifications
- Approval request notifications
- Interactive buttons for approve/deny
- Replaces WhatsApp approval mechanism

**googleContactsService.js** - Google Contacts synchronization
- Google People API integration
- Contact caching (in-memory)
- Phone number lookup
- Domain-wide delegation (service account)
- Configurable cache TTL

**notificationService.js** - Multi-channel notifications
- WhatsApp notifications
- Email notifications
- Telegram notifications
- Notification queuing

---

### Infrastructure Services (5 services)

**rabbitMQService.js** - RabbitMQ queue management
- Queue connection management
- Message publishing
- Message consumption
- Error handling

**otpQueue.js** - OTP queue processing
- Synchronous OTP email delivery
- Previously used BullMQ, now synchronous via emailService

**profileCacheService.js** - Profile caching
- Redis-based profile caching
- Automatic cache invalidation
- Configurable TTL (`CONTACT_CACHE_TTL_MS`)

**backupService.js** - Database backup
- PostgreSQL dump generation
- Google Drive upload
- Backup rotation
- Scheduled daily backups (04:00 WIB)

**driveService.js** - Google Drive integration
- File upload to Drive
- Folder management
- Service account authentication

---

### Utility Services (5+ services)

**excelService.js** - Excel file generation
- Workbook creation
- Worksheet formatting
- Cell styling
- Formula support
- Used by all recap services

**analyticService.js** - Analytics tracking
- Visitor log tracking
- Usage statistics
- Trend analysis

**changeLogService.js** - Change logging
- System change tracking
- Audit trail
- User action logging

**systemConfigService.js** - System configuration
- Dynamic configuration management
- Feature flags
- Runtime settings

**validationService.js** - Input validation
- Email validation
- Phone number validation
- NRP validation
- Input sanitization

---

## Service Design Patterns

### Dependency Injection
Services are injected into controllers, never instantiated directly:
```javascript
import clientService from '../service/clientService.js';

export async function getClient(req, res) {
  const client = await clientService.getById(req.params.id);
  res.json({ success: true, data: client });
}
```

### Error Handling
Services throw errors that are caught by controller try-catch and global error handler:
```javascript
// Service
export async function getById(clientId) {
  const client = await Client.findByPk(clientId);
  if (!client) {
    throw new Error('Client not found');
  }
  return client;
}

// Controller
try {
  const client = await clientService.getById(req.params.id);
  res.json({ success: true, data: client });
} catch (error) {
  next(error); // Handled by errorHandler middleware
}
```

### Async/Await
All services use async/await for asynchronous operations:
```javascript
export async function createUser(userData) {
  const existingUser = await User.findOne({ where: { nrp: userData.nrp } });
  if (existingUser) {
    throw new Error('User already exists');
  }
  return await User.create(userData);
}
```

### Service Composition
Services can call other services:
```javascript
// premiumService.js
import dashboardUserService from './dashboardUserService.js';
import emailService from './emailService.js';

export async function activatePremium(userId, tier) {
  const user = await dashboardUserService.getById(userId);
  // Update premium tier
  await emailService.sendPremiumActivationEmail(user.email);
}
```

### Singleton Pattern
Some services are singletons (e.g., WhatsApp clients):
```javascript
// waService.js
let waClient = null;

export function getClient() {
  if (!waClient) {
    throw new Error('WhatsApp client not initialized');
  }
  return waClient;
}

export async function initialize() {
  if (waClient) return;
  waClient = new Client({ /* config */ });
  await waClient.initialize();
}
```

---

## Testing Services

Services are tested using Jest:

```javascript
// tests/services/clientService.test.js
import clientService from '../../src/service/clientService.js';

describe('clientService', () => {
  it('should create a client', async () => {
    const client = await clientService.create({
      client_id: 'TEST',
      client_name: 'Test Client'
    });
    expect(client.client_id).toBe('TEST');
  });
});
```

Run tests:
```bash
npm test
```

---

## Service Dependencies

### External Dependencies
- **PostgreSQL**: Database storage (via Sequelize models)
- **Redis**: Caching and sessions
- **RabbitMQ**: Message queue (optional)
- **Google APIs**: Contacts, Drive
- **RapidAPI**: Instagram, TikTok data
- **SMTP**: Email delivery
- **Telegram**: Bot notifications
- **WhatsApp Web.js**: WhatsApp integration

### Internal Dependencies
Services depend on:
- Models (`src/model/`)
- Utilities (`src/utils/`)
- Configuration (`src/config/`)
- Other services (composition)

---

## Performance Considerations

### Caching Strategy
- Profile data cached in Redis (5 minutes default)
- Google Contacts cached in-memory (configurable TTL)
- WhatsApp session state in WeakMap

### Rate Limiting
- WhatsApp message sending throttled via `waOutbox.js`
- RapidAPI calls limited by provider
- Request deduplication via Redis (5 minutes)

### Database Optimization
- Connection pooling (PostgreSQL)
- Prepared statements (Sequelize)
- Indexes on frequently queried fields

---

## Configuration

Services use environment variables from `src/config/env.js`:

```ini
# WhatsApp
USER_WA_CLIENT_ID=wa-userrequest-prod
GATEWAY_WA_CLIENT_ID=wa-gateway-prod

# RapidAPI
RAPIDAPI_KEY=your-key
RAPIDAPI_FALLBACK_KEY=fallback-key

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password

# Google
GOOGLE_SERVICE_ACCOUNT=/path/to/service-account.json
GOOGLE_IMPERSONATE_EMAIL=admin@example.com

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_ADMIN_CHAT_ID=your-chat-id
```

---

## Related Documentation

- [STRUCTURE.md](../STRUCTURE.md) - Repository structure
- [API_ENDPOINTS.md](API_ENDPOINTS.md) - API documentation
- [database_structure.md](database_structure.md) - Database schema
- [whatsapp_client_lifecycle.md](whatsapp_client_lifecycle.md) - WhatsApp details

---

## Contributing

When adding new services:
1. Place in appropriate subdirectory or `src/service/`
2. Use async/await for asynchronous code
3. Throw errors for exception handling
4. Add JSDoc comments
5. Write unit tests
6. Update this documentation

See [pull_request_guidelines.md](pull_request_guidelines.md) for more details.

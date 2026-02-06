# Cicero WhatsApp Backend - Repository Structure
*Last updated: 2026-02-06*

## Overview

This document provides a detailed breakdown of the repository structure, explaining the purpose and contents of each directory and major component.

## Root Directory

```
Cicero-Whatsapp/
├── app.js                      # Application entry point
├── package.json                # NPM dependencies and scripts
├── ecosystem.config.js         # PM2 process manager configuration
├── jest.config.js             # Jest testing configuration
├── eslint.config.js           # ESLint code style configuration
├── nodemon.json               # Nodemon development server config
├── .prettierrc                # Prettier code formatting config
├── .gitignore                 # Git ignore patterns
├── .env.example               # Environment variable template
├── README.md                  # Main project documentation
├── LICENSE                    # MIT License
├── src/                       # Source code directory (see below)
├── tests/                     # Jest test files
├── docs/                      # Detailed documentation (50+ files)
├── sql/                       # Database schema and migrations
├── scripts/                   # Utility scripts
└── laphar/                    # Laporan harian (daily report) storage
```

## Source Code Structure (`src/`)

### Configuration (`src/config/`)
Environment and infrastructure configuration:
- `env.js` - Environment variable validation using Envalid (40+ variables)
- `redis.js` - Redis client singleton and connection management
- `dashboardPremium.js` - Premium subscription tier definitions

### Database Layer (`src/db/`)
Database adapters and connection management:
- `pool.js` - PostgreSQL connection pool configuration
- `adapter.js` - Database adapter abstraction layer
- Supports PostgreSQL (primary), MySQL, and SQLite

### Models (`src/model/`)
**35+ Sequelize/PostgreSQL models** organized by domain:

#### User & Client Models
- `userModel.js` - Police user profiles with roles
- `clientModel.js` - Organization clients (police departments)
- `dashboardUserModel.js` - Dashboard access users
- `penmasUserModel.js` - Penmas system users
- `userSocialContactModel.js` - Social media contact info
- `deviceModel.js` - Device registration for push notifications

#### Social Media Models
- `instaPostModel.js` - Instagram posts
- `instaProfileModel.js` - Instagram user profiles
- `instaLikeModel.js` - Instagram like tracking
- `instaCommentModel.js` - Instagram comment tracking
- `instaStoryModel.js` - Instagram stories
- `tiktokPostModel.js` - TikTok posts
- `tiktokCommentModel.js` - TikTok comment tracking
- `tiktokSnapshotModel.js` - TikTok daily snapshots
- `satbinmasOfficialAccountModel.js` - Official Satbinmas accounts
- `satbinmasOfficialMediaModel.js` - Satbinmas media posts

#### Request & Workflow Models
- `approvalRequestModel.js` - Directorate approval workflows
- `premiumRequestModel.js` - Premium subscription requests
- `dashboardPremiumRequestModel.js` - Dashboard premium requests
- `complaintModel.js` - User complaint submissions
- `editorialEventModel.js` - Penmas editorial events

#### Analytics & Reporting Models
- `linkReportModel.js` - Link amplification reports
- `visitorLogModel.js` - Dashboard visitor tracking
- `cronJobConfigModel.js` - Cron job configuration
- `changeLogModel.js` - System change logs
- `systemConfigModel.js` - System-wide configuration
- `notificationModel.js` - Notification queue

### Controllers (`src/controller/`)
**6 Express controllers** handling HTTP requests:
- `userController.js` - User CRUD operations, role management
- `clientController.js` - Client management, profile operations
- `approvalRequestController.js` - Directorate approval workflows
- `premiumRequestController.js` - Premium subscription management
- `claimController.js` - OTP-based user verification
- `complaintController.js` - Complaint submission handling

### Services (`src/service/`)
**50+ business logic services** organized by function:

#### WhatsApp Services
- `waService.js` - Core WhatsApp client management
- `waUserService.js` - User-facing WhatsApp client
- `waGatewayService.js` - Gateway/broadcast WhatsApp client
- `waOutbox.js` - Message queue and delivery management
- `waAutoComplaintService.js` - Automated complaint forwarding
- `wwebjsAdapter.js` - WhatsApp Web.js adapter

#### Social Media Services
- `instagramApi.js` - Instagram API client
- `instaPostService.js` - Instagram post management
- `instaLikeService.js` - Instagram like tracking
- `instaCommentService.js` - Instagram comment tracking
- `instaProfileService.js` - Instagram profile management
- `instaRapidService.js` - RapidAPI Instagram integration
- `tiktokApi.js` - TikTok API client
- `tiktokPostService.js` - TikTok post management
- `tiktokCommentService.js` - TikTok comment tracking
- `tiktokRapidService.js` - RapidAPI TikTok integration

#### Reporting Services
- `likesRecapExcelService.js` - Daily likes recap Excel generation
- `commentRecapExcelService.js` - Daily comments recap Excel
- `weeklyLikesRecapExcelService.js` - Weekly likes recap
- `monthlyLikesRecapExcelService.js` - Monthly likes recap
- `engagementRankingExcelService.js` - Engagement ranking reports
- `linkReportExcelService.js` - Link amplification reports
- `kasatkerReportService.js` - Kasatker reports
- `kasatBinmasLikesRecapService.js` - Kasatbinmas reports

#### Core Services
- `clientService.js` - Client business logic
- `premiumService.js` - Premium subscription logic
- `premiumExpiryService.js` - Premium expiration handling
- `emailService.js` - SMTP email delivery
- `otpService.js` - OTP generation and validation
- `otpQueue.js` - OTP queue management
- `googleContactsService.js` - Google Contacts sync
- `telegramService.js` - Telegram bot integration
- `rabbitMQService.js` - RabbitMQ queue management
- `profileCacheService.js` - Profile caching (Redis)

### Handlers (`src/handler/`)
WhatsApp message handlers and menu logic:

#### Menu Handlers (`src/handler/menu/`)
**7 menu handler modules**:
- `userMenuHandlers.js` - User profile management, verification
- `clientRequestHandlers.js` - Client complaint workflows
- `oprRequestHandlers.js` - Operator request management
- `dashRequestHandlers.js` - Dashboard request flows
- `dirRequestHandlers.js` - Directorate operations & reports
- `wabotDitbinmasHandlers.js` - Ditbinmas bot-specific logic
- `menuPromptHelpers.js` - Menu formatting & UI helpers

#### Other Handlers
- `commandHandler.js` - WhatsApp command processing
- `messageHandler.js` - Incoming message routing
- `sessionHandler.js` - Session state management

### Cron Jobs (`src/cron/`)
**30+ scheduled jobs** organized in buckets:

#### Cron Manifest
- `cronManifest.js` - Job registration and bucket configuration
- `cronScheduler.js` - Job scheduling and execution

#### Always-Running Jobs
- `cronDbBackup.js` - Daily database backup to Google Drive
- `cronPremiumExpiry.js` - Premium subscription expiration

#### WhatsApp-Dependent Jobs
- `cronDirRequestFetchSosmed.js` - Instagram/TikTok data fetching
- `cronOprRequestDailyReport.js` - Operator daily reports
- `cronOprRequestMonthlyReport.js` - Operator monthly reports

#### dirRequest Subdirectory (`src/cron/dirRequest/`)
Directorate-specific cron jobs:
- `index.js` - dirRequest job registration
- `cronDirRequestDitbinmasGroupRecap.js` - Group recap distribution
- `cronDirRequestSatbinmasMedia.js` - Satbinmas media reports
- `cronDirRequestReminder.js` - Daily reminders
- `cronDirRequestBidhumasEvening.js` - BIDHUMAS evening reports

### Routes (`src/routes/`)
**5 main route modules**:
- `authRoutes.js` - Authentication endpoints
- `userRoutes.js` - User management endpoints
- `clientRoutes.js` - Client management endpoints
- `approvalRoutes.js` - Approval workflow endpoints
- `claimRoutes.js` - OTP verification endpoints
- `healthRoutes.js` - Health check endpoints

### Middleware (`src/middleware/`)
**9 middleware modules**:
- `authMiddleware.js` - JWT/operator allowlist authentication
- `authRequired.js` - Route protection
- `dashboardAuth.js` - Dashboard authentication
- `dashboardPremiumGuard.js` - Premium tier validation
- `penmasAuth.js` - Penmas system authentication
- `premiumTierMiddleware.js` - Premium tier middleware
- `dedupRequestMiddleware.js` - Request deduplication (Redis)
- `sensitivePathGuard.js` - Sensitive path protection
- `errorHandler.js` - Global error handling
- `debugHandler.js` - Debug logging

### Utilities (`src/utils/`)
**21 utility modules**:

#### WhatsApp Utilities
- `waHelper.js` - WhatsApp message formatting & sending
- `sessionsHelper.js` - WhatsApp session state management
- `recipientHelper.js` - Message recipient resolution

#### Data Processing
- `excelHelper.js` - Excel file generation
- `sortingHelper.js` - Data sorting utilities
- `analyzeInstagram.js` - Instagram engagement analysis
- `tiktokHelper.js` - TikTok data processing

#### General Utilities
- `utilsHelper.js` - General utility functions
- `logger.js` - Structured logging (Jakarta timezone)
- `constants.js` - Application-wide constants
- `cronScheduler.js` - Cron job scheduling
- `dateHelper.js` - Date/time utilities
- `validator.js` - Input validation
- `sanitizer.js` - Data sanitization

### Repository Layer (`src/repository/`)
Database query helpers and abstractions:
- `userRepository.js` - User queries
- `clientRepository.js` - Client queries
- `postRepository.js` - Social media post queries
- `engagementRepository.js` - Engagement metric queries

### Static Data (`src/data/`)
Static datasets and mappings:
- `satkerMapping.js` - Police unit mapping data
- `regionMapping.js` - Regional mapping data

## Documentation (`docs/`)

**50+ documentation files** covering:

### Architecture & Design
- `enterprise_architecture.md` - System architecture overview
- `combined_overview.md` - Repository suite overview
- `business_process.md` - Business process flows
- `metadata_flow.md` - Metadata flow diagrams

### API Documentation
- `login_api.md` - Authentication API (18KB)
- `claim_api.md` - OTP verification API
- `aggregator_api.md` - Aggregator API
- `instaPostsApi.md` - Instagram posts API
- `instaRapidApi.md` - Instagram RapidAPI integration
- `instaRekapLikesApi.md` - Instagram recap API
- `tiktokRekapKomentarApi.md` - TikTok recap API
- `linkReportsApi.md` - Link reports API
- `amplifyRekapApi.md` - Amplify recap API
- `amplifyRekapLinkApi.md` - Amplify recap link API
- `frontend_complaint_api_guide.md` - Complaint API guide

### WhatsApp Documentation
- `whatsapp_client_lifecycle.md` - Client lifecycle (33KB)
- `wa_dirrequest.md` - Directorate request handling (38KB)
- `wa_operator_request.md` - Operator request handling (12KB)
- `wa_user_registration.md` - User registration flow
- `wa_best_practices.md` - WhatsApp best practices (16KB)
- `waFileSendingBestPractices.md` - File sending best practices
- `wa_troubleshooting.md` - Troubleshooting guide
- `wa_message_reception_troubleshooting.md` - Message reception issues
- `wa_ready_event_fix.md` - Ready event fixes
- `wa_browser_lock_fix.md` - Browser lock fixes
- `wa_memory_leak_fix.md` - Memory leak fixes
- `wa_fix_summary.md` - Fix summary
- `wa_no_logs_troubleshooting.md` - No logs troubleshooting

### Feature Documentation
- `premium_subscription.md` - Premium subscription system (11KB)
- `satbinmas_official_accounts.md` - Satbinmas accounts (18KB)
- `google_contacts_integration.md` - Google Contacts sync
- `telegram_bot_setup.md` - Telegram bot setup (6KB)
- `complaint_formats.md` - Complaint formats
- `complaint_response.md` - Complaint response handling
- `laporan_harian_engagement.md` - Daily engagement reports
- `activity_schedule.md` - Activity scheduling

### Database & Infrastructure
- `database_structure.md` - Database schema (23KB)
- `redis.md` - Redis configuration
- `rabbitmq.md` - RabbitMQ setup
- `pg_backup_gdrive.md` - Database backup to Google Drive

### Development & Operations
- `naming_conventions.md` - Code naming conventions
- `pull_request_guidelines.md` - PR guidelines
- `backend_login_best_practices.md` - Login best practices
- `frontend_login_scaling.md` - Login scaling
- `user_creation_rules.md` - User creation rules
- `user_role_deactivation.md` - Role deactivation
- `roleToClientMapping.md` - Role to client mapping
- `penmas_api_design.md` - Penmas API design
- `reverse_proxy_config.md` - Reverse proxy config
- `server_migration.md` - Server migration guide
- `workflow_usage_guide.md` - Workflow usage guide
- `vision_mission_kpi.md` - Vision, mission & KPIs
- `fix-groupmetadata-availability.md` - Group metadata fixes
- `SOLUSI_403_KOMPLAIN_API.md` - 403 complaint API solution

## Testing (`tests/`)

Jest test files organized by component:
- Unit tests for services
- Integration tests for API endpoints
- Test utilities and mocks

## Database (`sql/`)

Database schema and migration files:
- `schema.sql` - Initial database schema
- Migration scripts for schema updates

## Scripts (`scripts/`)

Utility scripts for maintenance and operations:
- Database migration scripts
- Data import/export utilities
- Deployment helpers

## Key Patterns & Conventions

### Architecture Patterns
- **Service Layer Pattern** - All business logic in services
- **Repository Pattern** - Database queries abstracted in repositories
- **MVC Pattern** - Models, Controllers, and Service/Handler layers
- **Dependency Injection** - Services injected into controllers

### Code Organization
- **Feature-based** - Related functionality grouped together
- **Separation of Concerns** - Clear boundaries between layers
- **Single Responsibility** - Each module has one clear purpose

### Naming Conventions
See `docs/naming_conventions.md` for details:
- JavaScript: `camelCase` for functions and variables
- Database: `snake_case` for table and column names
- Files: `camelCase.js` for JavaScript files
- Constants: `UPPER_SNAKE_CASE`

### Session Management
- WeakMap-based session storage for WhatsApp conversations
- Session timeout handling
- Multi-step workflow state management

### Error Handling
- Try-catch blocks throughout
- Global error handler middleware
- Structured error responses
- Logging with Jakarta timezone

### Async/Await
- Consistent async/await usage
- Promise-based error handling
- No callback pyramids

## Statistics

- **Total Lines of Code**: ~50,000+
- **Controllers**: 6
- **Models**: 35+
- **Services**: 50+
- **Cron Jobs**: 30+
- **Middleware**: 9
- **Utilities**: 21+
- **Handler Modules**: 7
- **API Routes**: 5 main routers
- **Documentation Files**: 50+
- **Test Files**: 20+

## Technology Stack

### Core
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: JavaScript (ESM modules)

### Database
- **Primary**: PostgreSQL
- **ORM**: Sequelize
- **Cache**: Redis

### WhatsApp
- **Library**: whatsapp-web.js 1.23.0
- **Browser**: Puppeteer/Chrome

### External APIs
- **Instagram/TikTok**: RapidAPI
- **Email**: Nodemailer (SMTP)
- **Google**: Google People API (Contacts)
- **Telegram**: node-telegram-bot-api

### Queue & Jobs
- **Message Queue**: RabbitMQ (optional)
- **Job Scheduler**: node-cron
- **Task Queue**: BullMQ (with Redis)

### Development
- **Testing**: Jest
- **Linting**: ESLint 9
- **Formatting**: Prettier
- **Process Manager**: PM2

## Environment Variables

See `.env.example` for full list. Key categories:

### Database
- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_PORT`, `DB_DRIVER`

### Redis & Queue
- `REDIS_URL`, `AMQP_URL`

### WhatsApp
- `ADMIN_WHATSAPP`, `GATEWAY_WHATSAPP_ADMIN`
- `APP_SESSION_NAME`, `USER_WA_CLIENT_ID`, `GATEWAY_WA_CLIENT_ID`
- `WA_AUTH_DATA_PATH`, `WA_AUTH_CLEAR_SESSION_ON_REINIT`
- `WA_WEB_VERSION_CACHE_URL`, `WA_WEB_VERSION`

### Authentication
- `JWT_SECRET`, `SECRET_KEY`

### External Services
- `RAPIDAPI_KEY`, `RAPIDAPI_FALLBACK_KEY`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `GOOGLE_SERVICE_ACCOUNT`, `GOOGLE_IMPERSONATE_EMAIL`
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`

### Features
- `ENABLE_DIRREQUEST_GROUP`
- `ALLOW_DUPLICATE_REQUESTS`
- `ADMIN_NOTIFY_LOGIN`
- `LAPHAR_ARCHIVE`

## Related Repositories

This backend is part of the **Cicero platform**:

1. **Cicero_V2** (this repository) - Node.js/Express backend
2. **Cicero_Web** - Next.js dashboard frontend
3. **pegiat_medsos_apps** - Android mobile application

See `docs/combined_overview.md` and `docs/enterprise_architecture.md` for integration details.

## Additional Resources

- [README.md](README.md) - Main documentation
- [docs/](docs/) - Detailed documentation
- [CONTRIBUTING.md](docs/pull_request_guidelines.md) - Contribution guidelines
- [LICENSE](LICENSE) - MIT License

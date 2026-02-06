# Cicero Enterprise Architecture
*Last updated: 2026-02-06*

This document provides a high level overview of the architecture behind Cicero Web, consisting of a **backend** service (`Cicero_V2`) and a **Next.js** based dashboard (`cicero-dashboard`).

## Overview

- **Frontend**: Next.js application located in the separate `Cicero_Web` repository
- **Backend**: Node.js/Express REST API in this repository (`Cicero-Whatsapp`)
- **Database**: PostgreSQL (primary) with Sequelize ORM - 35+ models
- **Queue**: RabbitMQ for high‑volume asynchronous jobs (optional)
- **Cache/Session**: Redis for caching, sessions, and request deduplication
- **Messaging**: Triple WhatsApp integration powered by `whatsapp-web.js`:
  - `waClient` - Admin/operator interactions (`APP_SESSION_NAME`)
  - `waUserClient` - User-facing menus (`USER_WA_CLIENT_ID`)
  - `waGatewayClient` - Broadcast/reporting (`GATEWAY_WA_CLIENT_ID`)
- **External APIs**: 
  - Instagram/TikTok data via RapidAPI (primary + fallback keys)
  - Google People API for Contacts sync
  - Telegram bot for admin notifications
  - SMTP for email delivery (OTP, notifications)

## Components

### Backend (`Cicero_V2` / `Cicero-Whatsapp`)

The backend exposes REST endpoints to manage clients, users, and social media analytics. Key modules include:

#### Core Application
- `app.js` – Express entry point registering middleware, routes, and scheduled cron buckets based on WhatsApp readiness

#### Configuration (`src/config/`)
- `env.js` – Environment variable validation using Envalid (40+ variables)
- `redis.js` – Redis client singleton and connection management
- `dashboardPremium.js` – Premium subscription tier definitions (Free, Basic, Premium)

#### Database Layer (`src/db/`)
- `pool.js` – PostgreSQL connection pool
- `adapter.js` – Database abstraction layer supporting PostgreSQL (primary), MySQL, SQLite

#### Controllers (`src/controller/`)
**6 Express controllers** handling HTTP requests:
- `userController.js` – User CRUD, role management, notification preferences
- `clientController.js` – Client management, profile operations, summaries
- `approvalRequestController.js` – Directorate approval workflows (Penmas)
- `premiumRequestController.js` – Premium subscription request management
- `claimController.js` – OTP-based user verification and claims
- `complaintController.js` – Complaint submission handling

#### Models (`src/model/`)
**35+ Sequelize models** organized by domain:
- **User/Client**: `userModel`, `clientModel`, `dashboardUserModel`, `penmasUserModel`
- **Social Media**: `instaPostModel`, `instaProfileModel`, `instaLikeModel`, `instaCommentModel`, `tiktokPostModel`, `tiktokCommentModel`, `satbinmasOfficialAccountModel`
- **Requests**: `approvalRequestModel`, `premiumRequestModel`, `complaintModel`
- **Analytics**: `linkReportModel`, `visitorLogModel`, `cronJobConfigModel`, `changeLogModel`

#### Services (`src/service/`)
**50+ business logic services** organized by function:
- **WhatsApp**: `waService.js`, `waUserService.js`, `waGatewayService.js`, `waOutbox.js`, `waAutoComplaintService.js`, `wwebjsAdapter.js`
- **Social Media**: `instagramApi.js`, `instaPostService.js`, `instaLikeService.js`, `tiktokApi.js`, `tiktokPostService.js`, `instaRapidService.js`, `tiktokRapidService.js`
- **Reporting**: `likesRecapExcelService.js`, `commentRecapExcelService.js`, `weeklyLikesRecapExcelService.js`, `engagementRankingExcelService.js`, `kasatkerReportService.js`
- **Core**: `clientService.js`, `premiumService.js`, `emailService.js`, `otpService.js`, `googleContactsService.js`, `telegramService.js`, `rabbitMQService.js`, `profileCacheService.js`

#### Handlers (`src/handler/`)
**WhatsApp message handlers** and menu logic:
- `menu/` – **7 menu handler modules**: `userMenuHandlers.js`, `clientRequestHandlers.js`, `oprRequestHandlers.js`, `dashRequestHandlers.js`, `dirRequestHandlers.js`, `wabotDitbinmasHandlers.js`, `menuPromptHelpers.js`
- `commandHandler.js` – WhatsApp command processing
- `messageHandler.js` – Incoming message routing
- `sessionHandler.js` – Session state management

#### Cron Jobs (`src/cron/`)
**30+ scheduled jobs** in buckets:
- `cronManifest.js` – Job registration and bucket configuration
- `cronScheduler.js` – Job scheduling and execution
- **Always**: `cronDbBackup.js` (daily 04:00), `cronPremiumExpiry.js`
- **WhatsApp-dependent**: `cronDirRequestFetchSosmed.js` (every 30 min, 06:00-22:00), `cronOprRequestDailyReport.js`
- **dirRequest/**: Directorate-specific jobs (10+ jobs) - `cronDirRequestDitbinmasGroupRecap.js`, `cronDirRequestSatbinmasMedia.js`, `cronDirRequestBidhumasEvening.js` (22:00)

#### Routes (`src/routes/`)
**8 route files** defining API endpoints:
- `index.js` – Main router composition
- `authRoutes.js` – Authentication (12+ endpoints for dashboard/penmas/user/client login)
- `userRoutes.js` – User management (10+ endpoints)
- `clientRoutes.js` – Client management (8 endpoints)
- `approvalRequestRoutes.js` – Approval workflows (3 endpoints)
- `premiumRequestRoutes.js` – Premium subscriptions (2 endpoints)
- `claimRoutes.js` – OTP verification (5 endpoints)
- `waHealthRoutes.js` – WhatsApp health checks (1 endpoint)

#### Middleware (`src/middleware/`)
**9 middleware modules**:
- `authMiddleware.js` – JWT/operator allowlist authentication
- `authRequired.js` – Route protection
- `dashboardAuth.js`, `dashboardPremiumGuard.js` – Dashboard authentication and premium validation
- `penmasAuth.js`, `premiumTierMiddleware.js` – Penmas auth and tier validation
- `dedupRequestMiddleware.js` – Request deduplication via Redis (5-minute window)
- `sensitivePathGuard.js` – Blocks access to .env-style paths
- `errorHandler.js` – Global error handling

#### Utilities (`src/utils/`)
**21+ utility modules**:
- **WhatsApp**: `waHelper.js`, `sessionsHelper.js`, `recipientHelper.js`
- **Data**: `excelHelper.js`, `sortingHelper.js`, `analyzeInstagram.js`, `tiktokHelper.js`
- **Core**: `utilsHelper.js`, `logger.js`, `constants.js`, `cronScheduler.js`, `dateHelper.js`, `validator.js`

#### Repository Layer (`src/repository/`)
Database query helpers: `userRepository.js`, `clientRepository.js`, `postRepository.js`, `engagementRepository.js`

#### Static Data (`src/data/`)
- `satkerMapping.js` – Police unit mapping data
- `regionMapping.js` – Regional mapping data

### Frontend (`cicero-dashboard`)

Located in the separate `Cicero_Web/cicero-dashboard` directory. The dashboard communicates with the backend using helper functions defined in `utils/api.ts`. Key aspects:

- Built with Next.js 14 using TypeScript and Tailwind CSS.
- Custom React hooks and context provide authentication and global state management.
- Pages under `app/` render analytics views for Instagram and TikTok, user directories, and client info.
- Environment variable `NEXT_PUBLIC_API_URL` configures the backend base URL.

## Integration Flow

1. **Authentication**
   - Dashboard users log in via `/api/auth/dashboard-login` and receive a JWT token + premium tier information
   - Penmas operators authenticate via `/api/auth/penmas-login` for editorial workflows
   - Regular users log in via `/api/auth/user-login` for mobile app access
   - Client operators authenticate via `/api/auth/login` for mobile client access
   - Backend returns JWT token stored in `localStorage` (dashboard/mobile) or HTTP-only cookie
   - Subsequent requests attach `Authorization: Bearer <token>` header or reuse the `token` cookie

2. **Data Retrieval**
   - Dashboard calls backend endpoints (`/api/users`, `/api/clients`, `/api/approvals`) using helper functions in `utils/api.ts`
   - Backend fetches Instagram/TikTok data from RapidAPI if necessary (with primary/fallback key support)
   - Results are stored in PostgreSQL and Redis cache for performance
   - Responses are normalized for consistent field names

3. **Social Media Tracking**
   - Cron job `cronDirRequestFetchSosmed.js` runs every 30 minutes (06:00-22:00 WIB)
   - Fetches Instagram posts/likes/comments and TikTok videos/comments via RapidAPI
   - Updates database and broadcasts deltas via WhatsApp when new content is available
   - Profile caching via Redis reduces API calls

4. **WhatsApp Menu Interactions**
   - Users send messages to one of 3 WhatsApp clients (admin, user, gateway)
   - `messageHandler.js` routes messages to appropriate menu handler (7 modules)
   - Menu handlers maintain session state via `sessionsHelper.js` WeakMap
   - Multi-step workflows track user progress through conversation flows
   - Responses formatted via `waHelper.js` and sent through WhatsApp

5. **Automated Reporting**
   - 30+ cron jobs generate reports on schedule:
     - Daily: Operator reports, engagement recaps
     - Weekly: Weekly likes recap
     - Monthly: Monthly engagement summaries
     - Evening (22:00): BIDHUMAS evening reports
   - Excel files generated via `excelHelper.js` and services
   - Reports distributed via WhatsApp gateway client to appropriate groups/recipients

6. **Approval Workflows**
   - Penmas users create approval requests via `/api/approvals`
   - Requests trigger WhatsApp or Telegram notifications to admins
   - Admins approve/reject via WhatsApp commands or Telegram bot
   - Status updates propagate back to database and notify requester

7. **Premium Management**
   - Users request premium subscriptions via `/api/premium-requests`
   - Admin approval process via Telegram or WhatsApp
   - Daily cron job `cronPremiumExpiry.js` checks expiration
   - Expired subscriptions automatically downgraded to lower tier
   - Premium guards on endpoints enforce tier restrictions

8. **OTP Verification**
   - User requests OTP via `/api/claim/request-otp` (email-based)
   - OTP generated and sent synchronously via SMTP (`emailService.js`)
   - User verifies via `/api/claim/verify-otp` (15-minute expiry)
   - Verified users can update profile data (`/api/claim/update`)

9. **Queue Processing**
   - High‑volume tasks published to RabbitMQ via `rabbitMQService.js` (optional)
   - Background workers process queued tasks asynchronously
   - OTP emails sent synchronously (no queue delay)

10. **Database Backup**
    - Daily cron job `cronDbBackup.js` runs at 04:00 WIB
    - Creates PostgreSQL dump using `pg_dump`
    - Uploads dump to Google Drive folder (`GOOGLE_DRIVE_FOLDER_ID`)
    - Reuses Google credentials from Contacts sync

## Deployment Considerations

- Both frontend and backend are Node.js applications and can run on the same host or separately.
- Environment variables are managed via `.env` files (`.env` for backend, `.env.local` for frontend).
- Use PM2 for clustering and process management in production.
- Monitor PostgreSQL, Redis, and RabbitMQ health for reliability.

## Diagram

Below is a conceptual diagram of the main components and their interactions:

```
+-------------+      HTTPS       +--------------+
|  Browser    | <--------------> |  Next.js UI  |
+-------------+                  +--------------+
        |                               |
        | REST API calls                 | fetch() via utils/api.ts
        v                               v
+-------------+     Express      +----------------+
|  Backend    | <--------------> |  PostgreSQL DB |
|  (Node.js)  |                  +----------------+
+-------------+
     |  ^            Redis & RabbitMQ            ^
     |  |--------------------------------------- |
     |        External Services (Instagram, TikTok, WhatsApp, SMTP, Google People API)
     |             via RapidAPI, whatsapp-web.js, Nodemailer, Google SDK
```

The frontend communicates only with the backend. The backend orchestrates data retrieval, persistence, caching, and messaging integrations.


Refer to [docs/naming_conventions.md](naming_conventions.md) for code style guidelines.

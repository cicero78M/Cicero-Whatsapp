# Cicero Repository Suite Overview
*Last updated: 2026-02-06*

This document summarizes the three main repositories that make up the **Cicero** platform. Each repository has a specific role, but all work together to provide social media monitoring and reporting.

## Repositories

### 1. Cicero_V2 (Backend)
- [GitHub: cicero78M/Cicero_V2](https://github.com/cicero78M/Cicero_V2)
- **Node.js/Express REST API** for social media monitoring (Instagram/TikTok), WhatsApp messaging orchestration, and Penmas editorial workflow.
- **Architecture**: 6 controllers, 35+ models, 50+ services, 30+ cron jobs, 9 middleware, 21+ utilities
- **WhatsApp Integration**: Three independent sessions (`waClient`, `waUserClient`, `waGatewayClient`) for admin, user, and broadcast operations
- **Menu System**: 7 specialized menu handler modules for different user roles (user, client, operator, dashboard, directorate, ditbinmas)
- **Authentication**: Multi-tier auth system (Dashboard users, Penmas operators, regular users, mobile clients)
- **Premium System**: Tiered subscription model (Free, Basic, Premium) with expiration management
- **Social Media**: Instagram/TikTok tracking via RapidAPI with primary and fallback key support
- **Reporting**: 30+ automated cron jobs for daily, weekly, and monthly reports (Excel generation)
- **Scheduled Tasks**: 
  - Always-running: Database backup (daily 04:00), premium expiry checks
  - WhatsApp-dependent: Social media fetching (every 30 min, 06:00-22:00)
  - Directorate jobs: Daily recaps, reminders, evening reports (22:00 BIDHUMAS)
- **OTP System**: Email-based OTP verification via SMTP (synchronous delivery)
- **Infrastructure**: PostgreSQL (35+ models), Redis (caching), RabbitMQ (optional queue), Google Drive backups
- **External Services**: Google Contacts sync, Telegram bot notifications, email delivery
- See [README.md](../README.md) for comprehensive documentation and [STRUCTURE.md](../STRUCTURE.md) for detailed architecture.

### 2. Cicero_Web (Dashboard)
- [GitHub: cicero78M/Cicero_Web](https://github.com/cicero78M/Cicero_Web)
- Next.js dashboard repository.
- Communicates with the backend using helper functions in `utils/api.ts`.
- Pages under `app/` display Instagram and TikTok analytics as well as user directories.
- Configured through the `NEXT_PUBLIC_API_URL` environment variable.

### 3. pegiat_medsos_apps (Android App)
- GitHub repository for the mobile client (pegiat_medsos_apps).
- Lightweight Android application for field agents with OTP-based data claim and premium subscription upsell screens.
- Uses a login screen to obtain a JWT from the backend.
- Displays profile information and Instagram posts for the logged in user.
- Provides a dashboard, reporting, and premium request submission via simple activities.

## Integration Flow
1. **Authentication**: Dashboard, Android app, and Penmas users authenticate against the backend API via dedicated endpoints (`/api/auth/dashboard-login`, `/api/auth/user-login`, `/api/auth/penmas-login`)
2. **Data Access**: Clients call endpoints such as `/api/users`, `/api/clients`, `/api/approvals`, and `/api/claim/*` to retrieve and update data
3. **Social Media Tracking**: Backend collects Instagram/TikTok posts and metrics via RapidAPI (every 30 minutes, 06:00-22:00 WIB)
4. **Report Generation**: Scheduled jobs generate daily, weekly, and monthly Excel reports and distribute via WhatsApp
5. **WhatsApp Menus**: Users interact with 7 specialized menu handlers (user, client, operator, dashboard, directorate, ditbinmas)
6. **Approval Workflows**: Penmas editorial events trigger approval requests reviewed via WhatsApp or Telegram
7. **Premium Management**: Premium subscription requests are processed and expiration is monitored daily
8. **Background Processing**: Heavy tasks can be processed asynchronously using RabbitMQ when enabled
9. **OTP Verification**: Email-based OTP for user claims and password resets (synchronous SMTP delivery)

## Key Statistics

### Backend (Cicero_V2)
- **Code Organization**: 6 controllers, 35+ models, 50+ services, 8 route files
- **Automation**: 30+ cron jobs organized in buckets (always, waClient, dirRequest)
- **WhatsApp**: 3 independent clients, 7 menu handler modules
- **Infrastructure**: 9 middleware, 21+ utilities, 20+ test files
- **Documentation**: 50+ markdown files covering all aspects
- **Database**: PostgreSQL with 35+ Sequelize models
- **APIs**: 40+ REST endpoints with JWT authentication

### Frontend (Cicero_Web)
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Features**: Analytics dashboards, user directories, client management
- **Authentication**: JWT-based with premium tier support

### Mobile (pegiat_medsos_apps)
- **Platform**: Android native application
- **Features**: OTP-based claims, premium requests, profile management
- **Authentication**: JWT with local storage

Together these repositories form a complete system: the backend orchestrates data collection, WhatsApp messaging, and business logic; the Next.js dashboard presents analytics to administrators; and the Android app enables field personnel to interact with the same data while on the go.

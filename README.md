# CICERO_Whatsapp
*Last updated: 2026-02-06*

## Description

**Cicero WhatsApp Backend** is a streamlined WhatsApp-based backend system focused on menu access and request management. The service provides WhatsApp menu interfaces for different user roles and handles user requests, complaints, and approvals through WhatsApp interactions.

Two WhatsApp sessions are maintained—one for operator interactions and another as a gateway for directorate communications—while OTP distribution operates via instant email delivery for user verification.

## Key Capabilities

- **WhatsApp Menu Access** for multiple user roles:
  - Client menu (complaint handling, user information)
  - Direktorat menu (directorate operations)
  - Operator menu (operator functions)
  - User menu (profile management, verification)

- **Request Management**:
  - Approval requests workflow
  - Premium subscription requests
  - User complaint handling via WhatsApp
  - OTP-based user claim verification

- **Core Services**:
  - WhatsApp client management
  - User authentication and authorization
  - Email notifications
  - Database backup and scheduled jobs

## Requirements
- Node.js 20 or newer
- PostgreSQL and Redis (configure `.env` accordingly)
- Run `npm install` before starting

---

## Folder Structure

```
Cicero_V2/
├── app.js                       # Application entry point
├── package.json                 # NPM configuration
├── src/
│   ├── config/                  # Environment and Redis config
│   ├── db/                      # Database adapters
│   ├── controller/              # Express controllers
│   ├── model/                   # Database models
│   ├── cron/                    # Scheduled jobs
│   ├── handler/
│   │   └── menu/                # WhatsApp menu logic
│   ├── service/                 # Business services
│   ├── repository/              # Query helpers
│   ├── utils/                   # Utility functions
│   ├── routes/                  # Express routers
│   ├── middleware/              # Global middleware
│   └── data/                    # Static datasets
└── tests/                       # Jest tests
```

---

## API Overview

The API exposes minimal endpoints focused on WhatsApp menu functionality:

### Available Routes

#### Authentication & User Management
- `/api/auth` - User authentication (login/register)
- `/api/users` - User CRUD operations
- `/api/claim` - User claim verification via OTP

#### Client Management
- `/api/clients` - Client CRUD operations
- `/api/clients/:client_id/users` - Get client users
- `/api/clients/:client_id/summary` - Get client summary

#### Request Management
- `/api/approvals` - Approval request operations (direktorat workflow)
- `/api/premium-requests` - Premium subscription requests

#### Health & Monitoring
- `/api/health/wa` - WhatsApp connection health status
- `/` - Basic health check

### Authentication

Most endpoints require authentication via JWT token:
```
Authorization: Bearer <your-jwt-token>
```

Basic health checks are available without authentication. `GET` or `POST /` returns `{ "status": "ok" }` for load balancers or uptime probes.

---

## WhatsApp Menu System

The system provides interactive WhatsApp menus for different user roles:

### Client Menu (`clientrequest`)
- User information display
- Complaint submission and handling
- Update data requests
- Contact management

### Direktorat Menu (`dirrequest`)
- Directorate-level operations
- User directory access
- Report requests
- Admin notifications

### Operator Menu (`oprrequest`)
- Operator functions
- Daily operations
- Request handling

### User Menu
- Profile management
- Username updates
- Verification requests
- Account information

---

## Security

- JWT-based authentication for API endpoints
- OTP verification for sensitive operations
- Rate limiting and request deduplication
- Sensitive path protection
- Session management via Redis

Security note: requests that attempt to access `.env`-style paths are short-circuited with a 404 response to prevent accidental exposure of configuration files.

---

Example request:
```bash
curl -X GET "https://api.example.com/api/dashboard/anev?time_range=30d&role=ditbinmas&scope=org" \
  -H "Authorization: Bearer <dashboard-jwt>" \
  -H "X-Client-Id: DITBINMAS"
```

Example response (truncated):
```json
{
  "success": true,
  "data": {
    "user_directory": [
      {
        "user_id": "u-1",
        "nama": "USER SATKER",
        "divisi": "SUBBID PENMAS",
        "client_id": "DITBINMAS",
        "kontak_sosial": {
          "instagram": "user_ig",
          "tiktok": "user_tt"
        }
      }
    ],
    "instagram_engagement": {
      "total_posts": 12,
      "total_likes": 320,
      "per_user": [
        {
          "user_id": "u-1",
          "nama": "USER SATKER",
          "divisi": "SUBBID PENMAS",
          "client_id": "DITBINMAS",
          "username": "user_ig",
          "kontak_sosial": {
            "instagram": "user_ig",
            "tiktok": "user_tt"
          },
          "likes": 10
        }
      ]
    },
    "tiktok_engagement": {
      "total_posts": 8,
      "total_comments": 110,
      "per_user": [
        {
          "user_id": "u-1",
          "nama": "USER SATKER",
          "divisi": "SUBBID PENMAS",
          "client_id": "DITBINMAS",
          "username": "user_tt",
          "kontak_sosial": {
            "instagram": "user_ig",
            "tiktok": "user_tt"
          },
          "comments": 4
        }
      ]
    },
    "filters": {
      "client_id": "DITBINMAS",
      "role": "ditbinmas",
      "scope": "org",
      "regional_id": "JATIM",
      "time_range": "30d",
      "start_date": "2025-01-09T00:00:00+07:00",
      "end_date": "2025-02-07T23:59:59.999+07:00",
      "permitted_time_ranges": ["today", "7d", "30d", "90d", "custom", "all"]
    },
    "aggregates": {
      "total_users": 45,
      "instagram_posts": 12,
      "tiktok_posts": 8,
      "total_likes": 320,
      "total_comments": 110,
      "expected_actions": 20,
      "compliance_per_pelaksana": [
        {
          "user_id": "u-1",
          "nama": "USER SATKER",
          "likes": 10,
          "comments": 4,
          "total_actions": 14,
          "completion_rate": 0.7
        }
      ]
    }
  }
}
```

Development reminder: after updating this endpoint or its documentation, run `npm run lint` and `npm test` to align with repository guidelines.

## Logging Timezone

Application logs are timestamped using the Asia/Jakarta timezone by the console wrapper in `src/utils/logger.js`. Expect log prefixes in the format `YYYY-MM-DDTHH:mm:ss.SSS+07:00` for consistent Jakarta-local monitoring.

## Deployment & Environment

1. **Clone and install dependencies**
    ```bash
    git clone <repo-url>
    cd Cicero_V2
    npm install
    ```
2. **Copy `.env.example` to `.env`** and update the values:
    ```ini
    PORT=3000
    DB_USER=cicero
    DB_HOST=localhost
    DB_NAME=cicero_db
    DB_PASS=secret
    DB_PORT=5432
    DB_DRIVER=postgres
    REDIS_URL=redis://localhost:6379
    ADMIN_WHATSAPP=628xxxxxx,628yyyyyy
    GATEWAY_WHATSAPP_ADMIN=628zzzzzz
    TELEGRAM_BOT_TOKEN=your-telegram-bot-token
    TELEGRAM_ADMIN_CHAT_ID=your-telegram-admin-chat-id
    APP_SESSION_NAME=wa-admin
    USER_WA_CLIENT_ID=wa-userrequest-prod
    GATEWAY_WA_CLIENT_ID=wa-gateway-prod
    WA_AUTH_DATA_PATH=/var/lib/cicero/wa-sessions
    WA_AUTH_CLEAR_SESSION_ON_REINIT=false
    WA_WEB_VERSION_CACHE_URL=https://raw.githubusercontent.com/wppconnect-team/wa-version/main/versions.json
    WA_WEB_VERSION=
    WA_WEB_VERSION_RECOMMENDED=
    WA_WWEBJS_BROWSER_LOCK_BACKOFF_MS=20000
    WA_WWEBJS_PROTOCOL_TIMEOUT_MS=120000
    WA_WWEBJS_PROTOCOL_TIMEOUT_MS_USER=120000
    WA_WWEBJS_PROTOCOL_TIMEOUT_MS_GATEWAY=180000
    WA_WWEBJS_PROTOCOL_TIMEOUT_MAX_MS=300000
    WA_WWEBJS_PROTOCOL_TIMEOUT_BACKOFF_MULTIPLIER=1.5
    ENABLE_DIRREQUEST_GROUP=true
    CORS_ORIGIN=http://localhost:3000
    ALLOW_DUPLICATE_REQUESTS=false
    SECRET_KEY=your-secret
    JWT_SECRET=your-jwt-secret
    RAPIDAPI_KEY=xxxx
    RAPIDAPI_FALLBACK_KEY=xxxx-secondary
    RAPIDAPI_FALLBACK_HOST=tiktok-api6.p.rapidapi.com
    AMQP_URL=amqp://localhost
    DEBUG_FETCH_INSTAGRAM=false
    GOOGLE_CONTACT_SCOPE=https://www.googleapis.com/auth/contacts
    GOOGLE_SERVICE_ACCOUNT=/path/to/service-account.json
    GOOGLE_IMPERSONATE_EMAIL=admin@example.com
    BACKUP_DIR=./backups
    GOOGLE_DRIVE_FOLDER_ID=your-drive-folder-id
    SMTP_HOST=smtp.example.com
    SMTP_PORT=587
    SMTP_USER=otp@example.com
    SMTP_PASS=super-secret
    SMTP_FROM="Cicero OTP" <otp@example.com>
    CONTACT_CACHE_TTL_MS=300000
    DASHBOARD_RESET_TOKEN_EXPIRY_MINUTES=15
    DASHBOARD_PASSWORD_RESET_URL=https://dashboard.example.com/reset
    DASHBOARD_URL=https://dashboard.example.com
    ADMIN_NOTIFY_LOGIN=true
    DIRREQUEST_ENGAGE_RANK_RECIPIENT=628xxxx@c.us
    LAPHAR_ARCHIVE=false
    ```
   Use `DB_DRIVER=postgres`, `postgresql`, or `pg` when connecting to Postgres so the backend applies the session settings (`app.current_*`) required by database row-level security. Switching `DB_DRIVER` to another value disables these Postgres-only settings.
   `ADMIN_WHATSAPP` accepts numbers with or without the `@c.us` suffix. When the suffix is omitted, the application automatically appends it.
   `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ADMIN_CHAT_ID` configure the Telegram bot for dashboard user approval (see [docs/telegram_bot_setup.md](docs/telegram_bot_setup.md)). When configured, approval notifications are sent via Telegram instead of WhatsApp. The WhatsApp approval mechanism (`approvedash#`, `denydash#`) is now deprecated.
   `USER_WA_CLIENT_ID` defines the session identifier used by the user-facing WhatsApp client. Change it to isolate session data if needed.
   `USER_WA_CLIENT_ID` dan `GATEWAY_WA_CLIENT_ID` wajib unik (berbeda dari default maupun satu sama lain). Contoh benar: `USER_WA_CLIENT_ID=wa-userrequest-prod` dan `GATEWAY_WA_CLIENT_ID=wa-gateway-prod`.
   `USER_WA_CLIENT_ID` **harus lowercase dan tidak boleh default `wa-userrequest`**. Service akan menghentikan proses sejak awal jika nilai masih default, mengandung huruf besar, atau folder `session-<clientId>` di `WA_AUTH_DATA_PATH` memakai casing berbeda.
   `GATEWAY_WA_CLIENT_ID` **harus lowercase dan tidak boleh default `wa-gateway`**. Service akan menghentikan proses sejak awal jika nilai masih default, mengandung huruf besar, atau folder `session-<clientId>` di `WA_AUTH_DATA_PATH` memakai casing berbeda.
   Saat mengganti `GATEWAY_WA_CLIENT_ID`, bersihkan session lama di `WA_AUTH_DATA_PATH` dengan cara rename atau hapus folder `session-<clientId>` yang lama agar tidak meninggalkan sesi usang.
   `GATEWAY_WHATSAPP_ADMIN` identifies the WhatsApp account that receives gateway connection updates.
   `APP_SESSION_NAME` is the session folder name used for the main WhatsApp client; override it when running multiple instances on the same host.
   `WA_AUTH_DATA_PATH` overrides the LocalAuth session directory (default: `~/.cicero/wwebjs_auth`). Ensure the directory is owned by or writable to the runtime user; if the configured path is not writable, the adapter logs an error, falls back to the recommended path, and proceeds only when the fallback directory can be created and written.
   `WA_WWEBJS_ALLOW_SHARED_SESSION` (default `false`) controls the shared-session guard that aborts initialization when another process is actively using the same `session-<clientId>` lock. Keep it `false` in clustered deployments (PM2/systemd) and instead provide a distinct `WA_AUTH_DATA_PATH` per process or use `WA_WWEBJS_FALLBACK_AUTH_DATA_PATH`/`WA_WWEBJS_FALLBACK_USER_DATA_DIR_SUFFIX` (example: `WA_WWEBJS_FALLBACK_USER_DATA_DIR_SUFFIX=worker-${PM2_INSTANCE_ID}`).
   `WA_AUTH_CLEAR_SESSION_ON_REINIT=true` forces the adapter to remove the `session-<clientId>` folder before reinitializing after `auth_failure` or `LOGGED_OUT`. The fallback readiness monitor also triggers a reinit **with clear session** for the `WA-GATEWAY` and `WA-USER` clients when `getState` stays `unknown` past the retry limit, but only if auth-failure indicators are present and the `session-<clientId>` folder exists. Back up the session folder before manual cleanup or when troubleshooting repeated auth failures so recovery is possible.
   Fallback readiness logs in `scheduleFallbackReadyCheck` include the client label (for example `WA-GATEWAY`), the active `clientId`, `connectInFlight`, `awaitingQrScan`, `lastDisconnectReason`, and the LocalAuth session path (`session-<clientId>` under `WA_AUTH_DATA_PATH`) to help identify which session needs attention when `getState` returns `unknown` or retries. If a connect is already in progress, the fallback readiness check defers and reschedules instead of incrementing retries to avoid redundant reconnect attempts.
   `WA_FALLBACK_READY_COOLDOWN_MS` controls how long fallback readiness waits after hitting the max reinit attempts before resetting retry counters and starting a new recovery cycle (default 300000 ms) so post-restart monitoring continues.
   `WA_WEB_VERSION_CACHE_URL` points to a remote JSON document that whatsapp-web.js reads to align with the latest WhatsApp Web build. Keep it set to a reachable endpoint to re-enable web version caching, and leave it empty only when you explicitly want to skip remote cache fetching in constrained environments. When `WA_WEB_VERSION_CACHE_URL`, `WA_WEB_VERSION`, and `WA_WEB_VERSION_RECOMMENDED` are empty, the adapter explicitly disables the local web cache to avoid `LocalWebCache.persist` errors (re-enable by setting either `WA_WEB_VERSION_CACHE_URL` or a pinned version). The adapter fetches and validates the cache payload before using it—if the response is missing an expected version string or the URL fails/404s, it logs warnings such as `Web version cache fetch failed (404)` and disables `webVersionCache` so whatsapp-web.js falls back to defaults. The cache payload must include a version string matching `\d+\.\d+(\.\d+)?` in a `version`, `webVersion`, `wa_version`, or `waVersion` field (or as a plain string). Set `WA_WEB_VERSION` to pin a specific version string (for example, `2.3000.0`) when the automatic cache path is unavailable or the cache payload fails validation; the value must match `\d+\.\d+(\.\d+)?`. `WA_WEB_VERSION_RECOMMENDED` can hold the recommended pinned version for your environment and is used only when `WA_WEB_VERSION` is empty (for example, set it via deployment config management to enforce a tested baseline). Leaving all three values empty disables the cache entirely and can trigger more frequent re-initialization when file-sending traffic spikes (for example, menu 44 Excel delivery).

   Contoh payload cache yang valid (JSON):
   ```json
   {
     "version": "2.3000.1019311536",
     "platform": "web",
     "releaseDate": "2024-04-01"
   }
   ```
   Perbarui pin (`WA_WEB_VERSION` atau `WA_WEB_VERSION_RECOMMENDED`) saat WhatsApp Web merilis update besar dan log `initialize`/`load` menunjukkan error setelah update (misalnya blank page atau error `LocalWebCache.persist`/`Cannot read properties of null`). Biasanya cukup sinkronkan ke versi terbaru dari payload cache yang sudah tervalidasi.
   `WA_WWEBJS_PROTOCOL_TIMEOUT_MS` sets the Puppeteer protocol timeout used by whatsapp-web.js for `Runtime.callFunctionOn` and other DevTools protocol calls. Keep the default `120000` ms for typical deployments, and increase it (for example `180000`) when you expect slow or high-latency connections to WhatsApp Web.
   Per-client override is available in two formats: a stable role alias (based on the client ID prefix) and a clientId-specific suffix. Role alias mapping uses `WA_WWEBJS_PROTOCOL_TIMEOUT_MS_GATEWAY` for client IDs that start with `wa-gateway` and `WA_WWEBJS_PROTOCOL_TIMEOUT_MS_USER` for IDs that start with `wa-user`. For example, for `wa-gateway-prod` you can set `WA_WWEBJS_PROTOCOL_TIMEOUT_MS_GATEWAY=180000`, or use the explicit client suffix `WA_WWEBJS_PROTOCOL_TIMEOUT_MS_WA_GATEWAY_PROD=180000` (client ID uppercased with non-alphanumerics replaced by underscores). Recommended production setup: keep `WA_WWEBJS_PROTOCOL_TIMEOUT_MS=120000` for WA admin, and raise the per-client override for user/gateway clients that see frequent `Runtime.callFunctionOn timed out` errors.
   The adapter can auto-increase the protocol timeout after runtime timeouts during initialization. Control the cap with `WA_WWEBJS_PROTOCOL_TIMEOUT_MAX_MS` (default 300000) and the growth rate with `WA_WWEBJS_PROTOCOL_TIMEOUT_BACKOFF_MULTIPLIER` (default 1.5). Set the max to a value higher than your per-client timeout if you want auto-bumps to take effect.
   `ENABLE_DIRREQUEST_GROUP=false` disables all Ditbinmas dirRequest cron jobs at once while leaving other schedules intact.
   `GOOGLE_SERVICE_ACCOUNT` may be set to a JSON string or a path to a JSON file. If the value starts with `/` or ends with `.json`, the application reads the file; otherwise it parses the variable directly as JSON. `GOOGLE_IMPERSONATE_EMAIL` should be set to the Workspace user to impersonate when performing contact operations.
   `SMTP_*` variables enable OTP and complaint notifications through email (`claimRoutes.js`). Leave them unset to disable email delivery in development.
   `CONTACT_CACHE_TTL_MS` controls how long Google contact lookups stay cached in memory.
   `DASHBOARD_RESET_TOKEN_EXPIRY_MINUTES` and `DASHBOARD_PASSWORD_RESET_URL` customise dashboard password reset links.
   `RAPIDAPI_KEY` wajib diisi untuk semua fetch Instagram/TikTok. Endpoint seperti `/api/insta/rapid-info` akan mengembalikan error operasional (500/503) bila `RAPIDAPI_KEY` belum di-set, sebelum melakukan request keluar.
   `RAPIDAPI_FALLBACK_KEY` and `RAPIDAPI_FALLBACK_HOST` allow the TikTok fetcher to call an alternate RapidAPI host (`/user/videos`) when the primary `tiktok-api23` host fails or returns an empty payload. If the primary host only returns posts outside of the current Jakarta day (no tasks for today), the fetcher retries via the fallback host using the username to avoid missing same-day content—but only during the 11:00–17:15 WIB window to align with operational hours. The fallback endpoint should return a `videos` or `result.videos` array containing TikTok objects with identifiers (`video_id`/`id`) and timestamps (`create_time`/`createTime`) so the backend can normalize them.
   Untuk Instagram, `RAPIDAPI_FALLBACK_KEY`/`RAPIDAPI_FALLBACK_HOST` digunakan sebagai host cadangan saat host utama mengembalikan 401/403 (mis. key utama invalid atau rate limit). Isi `RAPIDAPI_FALLBACK_HOST` dengan host RapidAPI Instagram yang kompatibel agar fungsi `instaRapidService` otomatis retry menggunakan key/host cadangan.

3. **Set up Redis**
    ```bash
    sudo apt-get install redis-server
    sudo systemctl enable redis-server
    sudo systemctl start redis-server
    ```
4. **Set up RabbitMQ**
   ```bash
   sudo apt-get install rabbitmq-server
   sudo systemctl enable rabbitmq-server
   sudo systemctl start rabbitmq-server
   ```
5. **Initialize the database** using scripts in `sql/schema.sql`.
6. **Start the application**
    ```bash
    npm start
    ```
    Or with PM2 (uses `ecosystem.config.js`):
    ```bash
    pm2 start ecosystem.config.js --env production
    ```
    The PM2 config watches only the code paths (`app.js`, `src/`) in non-production mode and ignores data folders/files to prevent restart loops when uploads or exports change. Ignored paths include `laphar/`, `logs/`, `uploads/`, `backups/`, and file patterns such as `*.txt`, `*.csv`, `*.tsv`, `*.log`, `*.json`, `*.xlsx`, `*.xls`, `*.zip`. In production, `watch` is disabled (`watch: false`) so restarts occur only on deploy/manual restart.
7. **Lint & Test**
    ```bash
    npm run lint
    npm test
    ```

---

## Google Contacts Integration

The application can synchronize Google Workspace contacts using the People API. Contacts are cached in-memory based on `CONTACT_CACHE_TTL_MS` to reduce API churn, and stored phone numbers are reused by WhatsApp helpers. Configure the integration as follows:

1. **Enable the People API** in your Google Cloud project.
2. **Create a service account** and enable **Domain-wide delegation**.
3. **Grant domain-wide delegation** in the Google Admin console:
   - Note the service account's client ID.
   - Under **Security → API controls → Domain-wide delegation**, add a new client with that client ID and the scope defined in `GOOGLE_CONTACT_SCOPE`.
4. **Set environment variables**:
   - `GOOGLE_SERVICE_ACCOUNT` – JSON key or file path for the service account.
   - `GOOGLE_CONTACT_SCOPE` – OAuth scope for contacts, e.g. `https://www.googleapis.com/auth/contacts`.
   - `GOOGLE_IMPERSONATE_EMAIL` – Workspace user email to impersonate when accessing contacts.
   - `CONTACT_AUTH_COOLDOWN_MS` – cooldown before re-attempting Google auth after missing/invalid credentials (defaults to 300000 ms).
   - `BACKUP_DIR` – temporary folder for local database dumps.
   - `GOOGLE_DRIVE_FOLDER_ID` – Google Drive folder ID to receive backups.

For detailed setup and usage examples, see [`docs/google_contacts_integration.md`](docs/google_contacts_integration.md).

---

## Database Backup & Backups to Drive

Example commands for backing up and restoring the database:

```bash
pg_dump -U <dbuser> -h <host> -d <dbname> > cicero_backup.sql
psql -U <dbuser> -h <host> -d <dbname> < cicero_backup.sql
```

A cron job (`src/cron/cronDbBackup.js`) runs daily at **04:00** (Asia/Jakarta), storing dumps in `BACKUP_DIR` and uploading them to the Drive folder defined by `GOOGLE_DRIVE_FOLDER_ID`. Backups reuse the same Google credentials used for contact sync.

---

## WhatsApp Sessions & Cron Buckets

WhatsApp sessions are launched from `app.js`: `waClient` for operator interactions, `waUserClient` for user-request flows, and `waGatewayClient` for broadcast/reporting flows. Cron buckets remain paused until each session signals readiness, preventing duplicate schedules after restarts. Manifest entries in `src/cron/cronManifest.js` drive the always/`waClient` buckets, while all Ditbinmas dirRequest jobs are bundled in `src/cron/dirRequest/index.js` and registered via `registerDirRequestCrons(waGatewayClient)` so they share the same gateway context and can be toggled with `ENABLE_DIRREQUEST_GROUP`.

- The three WhatsApp sessions initialize in parallel, so QR/ready delays or failures in one session will not block the other sessions from connecting. Each client keeps its own `[WA]`, `[WA-USER]`, or `[WA-GATEWAY]` startup/error logs for easier traceability.
- WhatsApp readiness is tracked per client. Message handlers await the specific client's `waitForWaReady()` before processing, and the service logs `READY` for WA/WA-USER/WA-GATEWAY when `ready`, `change_state`, or `getState()` checks confirm a connected session.
- Fallback readiness checks run after initialization for **all** WhatsApp clients. After ~60 seconds the service calls `getState()` and logs messages such as `[WA-USER] getState: CONNECTED` or `[WA-GATEWAY] getState error: ...`. If `isReady()`/`getState()` reports `CONNECTED/open`, the fallback is marked complete (one-shot per start/restart) and will not reschedule until the next reset triggered by `qr`, `authenticated`, `auth_failure`, disconnect/change_state, or a new `connect()`/`reinitialize()` call.
- Reconnects are guarded by a shared connect lock: if a client is already initializing, further `connect()` calls (including hard-init retries or disconnect-driven reconnects) will wait for or skip the in-flight promise instead of launching a parallel session. This keeps the default retry timing the same (e.g., 5s reconnect delay, exponential hard-init retry delays) while preventing overlapping initializations.

- `src/cron/cronDirRequestFetchSosmed.js` now runs as a standalone cron in the `always` manifest bucket and fires every 30 minutes from **06:00–22:00** (Asia/Jakarta), so it does not wait for any WhatsApp gateway/user readiness before refreshing Ditbinmas Instagram/TikTok data and broadcasting deltas when available.

- The Instagram laphar cron (`cronInstaLaphar.js`) has been retired and removed from the manifest and seed data. New deployments will no longer register or seed this job; existing environments can safely drop its `cron_job_config` row if present.

- The dirRequest cron group now focuses on reminder, Satbinmas media, and BIDHUMAS evening schedules; custom sequence and combined recap jobs are no longer registered in this bucket.

- `src/cron/cronDirRequestBidhumasEvening.js` adds a **22:00** (Asia/Jakarta) BIDHUMAS-only cron that first runs `runDirRequestFetchSosmed({ forceEngagementOnly: true })` (refresh likes/comments only, skipping new post fetches) and then executes dirRequest menus **6** and **9** specifically for the BIDHUMAS WhatsApp group and its super admin recipients. The job shares the dirRequest bucket and inherits the same WhatsApp readiness guardrails as the other dirRequest schedules.

The OTP worker (`src/service/otpQueue.js`) now resolves immediately because OTP emails are sent synchronously via SMTP to minimise delays.

---

## Troubleshooting

- **DB connection errors** – check database credentials and PostgreSQL status.
- **WhatsApp not connected** – rescan the QR code, confirm session folders (`APP_SESSION_NAME`, `USER_WA_CLIENT_ID`, `GATEWAY_WA_CLIENT_ID`), and check for unsupported version logs. If browser traces include `static.whatsapp.net` stack frames that mention updating WhatsApp, either set `WA_WEB_VERSION_CACHE_URL` to a reachable mirror or pin `WA_WEB_VERSION` to the latest release from the cache JSON. If the remote endpoint is unavailable, leave `WA_WEB_VERSION_CACHE_URL` empty to disable cache fetching and rely on a pinned `WA_WEB_VERSION`.
- **`Could not find Chrome` / `Could not find browser` errors** – whatsapp-web.js launches Chrome via Puppeteer. Install Chrome with `npx puppeteer browsers install chrome` (uses the Puppeteer cache) or install the OS package for Chrome/Chromium. If Chrome is preinstalled or the cache path is customized, set `WA_PUPPETEER_EXECUTABLE_PATH` (preferred), `PUPPETEER_EXECUTABLE_PATH`, and/or `PUPPETEER_CACHE_DIR`. The adapter will also attempt auto-discovery in the Puppeteer cache (defaults to `~/.cache/puppeteer`), looking for paths like `~/.cache/puppeteer/chrome/linux-<version>/chrome-linux64/chrome` (example: `/home/gonet/.cache/puppeteer/chrome/linux-143.0.7499.192/chrome-linux64/chrome`). Initialization treats missing Chrome as a fatal error and skips automatic retries until the browser is installed, but it now verifies the executable path first; if the path is accessible, the error is treated as misleading and retries continue. When a missing-Chrome error occurs while an executable path is set, logs now include the resolved path, `stat.mode` permissions, and the `access` error code, with remediation hints such as `chmod +x` or `mount -o remount,exec` when relevant. Example log lines: `Error: Could not find Chrome (ver. 121.0.6167.85)` or `Error: Could not find browser executable`.
- **`browser is already running` / lock recovery loops** – the adapter detects active Puppeteer locks and logs the `profilePath` plus PID so ops can terminate the correct Chromium process. If the lock remains active beyond `WA_WWEBJS_LOCK_FALLBACK_THRESHOLD` and a fallback userDataDir cannot be applied, initialization now exits with `WA_WWEBJS_LOCK_ACTIVE` instead of retrying forever. See `docs/whatsapp_client_lifecycle.md` for the full recovery flow.
- **`LocalWebCache.persist` stack trace / `Cannot read properties of null (reading '1')`** – this usually means the `WA_WEB_VERSION_CACHE_URL` payload is mismatched or blocked. Clear `WA_WEB_VERSION_CACHE_URL` when the endpoint is unstable, or pin `WA_WEB_VERSION` to a valid build string (e.g., `2.3000.0`). When the cache is disabled, `whatsapp-web.js` will fall back to its default version resolution.
- **Email OTP delivery failed** – verify `SMTP_*` variables and network egress.
- **External API errors** – verify `RAPIDAPI_KEY` and check application logs.
- **Cron jobs not running** – confirm cron buckets activated after WhatsApp readiness and verify timezone settings (`Asia/Jakarta`).

---

## Security Notes

- Do not upload `.env` to a public repository.
- All POST/PUT endpoints perform strict validation.
- Only admins from the environment variables can trigger manual WhatsApp commands.
- Back up the database regularly and test recovery procedures.

## Request Deduplication

The middleware in [`src/middleware/dedupRequestMiddleware.js`](src/middleware/dedupRequestMiddleware.js) hashes non-GET requests and caches them in Redis for five minutes. Identical requests sent again within that window receive an HTTP 429 response. Claim endpoints under `/api/claim` are exempt so that the OTP flow can be retried without delay. Set `ALLOW_DUPLICATE_REQUESTS=true` to bypass this protection during development.

---

## Scaling & Monitoring

- Use PM2 clusters and separate processes if load is high.
- Monitor database health, cron jobs, and WhatsApp logs.
- Add indexes to frequently queried fields.
- Cache Instagram and TikTok profiles in Redis (`profileCacheService.js`) to improve response times.

### TikTok fetch timezone handling

- TikTok timestamps from RapidAPI are treated as **UTC** and normalized during upsert so the database stores them consistently.
- Date-based filters for `tiktok_post.created_at` convert the stored value from UTC to **Asia/Jakarta** before casting to `date` (e.g., `(created_at AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Jakarta'`) to avoid off-by-one errors around midnight.
- When adding new fetchers or reports that rely on TikTok posting dates, reuse this double `AT TIME ZONE` pattern to keep late-night UTC posts counted on the correct Jakarta calendar day.

## High Volume Queue (RabbitMQ)

- Use RabbitMQ to process large jobs asynchronously.
- Configure the connection URL in `AMQP_URL`.
- Implement helper functions (e.g. `publishToQueue` and `consumeQueue`) as needed for your project.

---

## License

See the LICENSE file in this repository.

## Contributors & Support

Contact the repository admin for access, issues, or additional contributors.

---

> This documentation is automatically generated based on code analysis and development history.

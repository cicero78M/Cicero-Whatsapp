# Cron Jobs Documentation
*Last updated: 2026-02-06*

This document provides comprehensive documentation for all scheduled tasks (cron jobs) in the Cicero WhatsApp Backend.

## Overview

The system runs **30+ scheduled jobs** organized into **3 buckets**:
- **always** - Run regardless of WhatsApp client status (4 jobs)
- **waClient** - Require WhatsApp client connectivity (7 jobs)
- **dirRequest** - Directorate-specific workflows (8+ jobs)

All jobs use **Asia/Jakarta timezone** and are registered in `src/cron/cronManifest.js`.

## Cron Job Buckets

### Bucket Activation

- **always**: Start immediately when app launches
- **waClient**: Start when `waClient` signals ready
- **dirRequest**: Managed separately via `registerDirRequestCrons(waGatewayClient)`

### Feature Toggle

Set `ENABLE_DIRREQUEST_GROUP=false` to disable all dirRequest jobs.

---

## Always-Running Jobs (4 jobs)

Jobs that run regardless of WhatsApp client status.

### 1. Database Backup (`cronDbBackup.js`)

**Schedule**: `0 4 * * *` (04:00 WIB daily)

**Purpose**: 
- Creates PostgreSQL database dump using `pg_dump`
- Uploads dump file to Google Drive
- Maintains backup rotation

**Dependencies**:
- `GOOGLE_SERVICE_ACCOUNT` - Service account credentials
- `GOOGLE_DRIVE_FOLDER_ID` - Target Drive folder
- `BACKUP_DIR` - Local temporary backup directory
- Database credentials (`DB_HOST`, `DB_USER`, etc.)

**Process**:
1. Create dump: `pg_dump -U <user> -h <host> -d <db> > backup.sql`
2. Upload to Google Drive
3. Clean up local dump file
4. Log success/failure

**Notes**: Reuses Google credentials from Contacts sync.

---

### 2. Social Media Fetching (`cronDirRequestFetchSosmed.js`)

**Schedule**: 
- `0,30 6-21 * * *` (Every 30 minutes, 06:00-21:30 WIB)
- `0 22 * * *` (22:00 WIB)

**Purpose**:
- Fetch Instagram posts, likes, and comments via RapidAPI
- Fetch TikTok videos and comments via RapidAPI
- Update engagement metrics in database
- Broadcast deltas (new posts/engagement) via WhatsApp

**WhatsApp Clients**: waGatewayClient (primary), waClient, waUserClient (fallbacks)

**Dependencies**:
- `RAPIDAPI_KEY`, `RAPIDAPI_FALLBACK_KEY`
- Active clients with Instagram/TikTok enabled
- WhatsApp clients ready

**Process**:
1. Get all active Ditbinmas clients
2. Fetch Instagram posts for each user (via `instaRapidService`)
3. Fetch TikTok posts for each user (via `tiktokRapidService`)
4. Update database with new posts and engagement
5. Calculate deltas (new posts, like increases, comment increases)
6. Broadcast summary via WhatsApp if changes detected

**Special Behavior**:
- Post fetching disabled after 17:15 WIB (engagement-only after that time)
- BIDHUMAS evening job (22:00) runs engagement-only refresh
- Primary/fallback RapidAPI key support for resilience

**Notes**: This is the core social media tracking job that feeds all reporting.

---

### 3. Premium Expiry (`cronPremiumExpiry.js`)

**Schedule**: `0 0 * * *` (00:00 WIB daily)

**Purpose**:
- Check all premium subscriptions for expiration
- Automatically downgrade expired subscriptions to lower tier
- Send expiration notifications

**Dependencies**:
- Dashboard user premium subscription records
- Email service (optional notifications)

**Process**:
1. Query all premium subscriptions where `premium_end_date < NOW()`
2. Downgrade tier: Premium → Basic → Free
3. Update database records
4. Send expiration notification emails (if configured)
5. Log expiration summary

**Notes**: Part of the premium subscription lifecycle.

---

### 4. Amplify Routine Update (`cronOprRequestAmplifyRoutineUpdate.js`)

**Schedule**: `55,25 8-21 * * *` (Every hour at :25 and :55, 08:00-21:00 WIB)

**Purpose**:
- Refresh oprrequest tugas rutin (routine task) amplification content
- Update Instagram post data for active org clients during business hours

**Dependencies**:
- Active org clients with amplification enabled
- Instagram accounts registered (`client_insta`)

**Process**:
1. Get active org clients with amplification
2. Refresh Instagram content for routine tasks
3. Update database with latest post data

**Notes**: Runs during business hours only to stay current with Instagram content.

---

## WhatsApp-Dependent Jobs (7 jobs)

Jobs that require WhatsApp client connectivity.

### 1. Link Recap Distribution (`cronRekapLink.js`)

**Schedule**: `5 15,18,21 * * *` (15:05, 18:05, 21:05 WIB daily)

**Purpose**:
- Distribute amplification link recaps to clients
- Send to operators, super admins, and groups
- Track link sharing metrics

**WhatsApp Client**: waClient

**Dependencies**:
- Active org clients with amplification enabled
- Operator/super admin WhatsApp numbers
- Group WhatsApp IDs (optional)

**Process**:
1. Generate link recap report (Excel format)
2. Send to operator WhatsApp
3. Send to super admin WhatsApp (if configured)
4. Send to group WhatsApp (if configured)
5. Log delivery status

**Notes**: Three daily distributions align with workflow checkpoints.

---

### 2. Monthly Amplify Report (`cronAmplifyLinkMonthly.js`)

**Schedule**: `0 23 28-31 * *` (23:00 WIB on last day of month)

**Purpose**:
- Generate monthly amplification spreadsheet
- Deliver Excel file to operators
- Track monthly performance

**WhatsApp Client**: waClient

**Dependencies**:
- Active org clients with amplification enabled
- Operator WhatsApp registered

**Process**:
1. Check if last day of month
2. Generate monthly Excel report
3. Send Excel file via WhatsApp to operators
4. Archive report

**Notes**: Runs on days 28-31 but checks internally for actual last day.

---

### 3. Rekap Update (`cronDirRequestRekapUpdate.js`)

**Schedule**: `0 8-18/4 * * *` (08:00, 12:00, 16:00, 18:00 WIB)

**Purpose**:
- Send Ditbinmas executive summaries
- Distribute rekap updates to admins
- Broadcast to Ditbinmas group

**WhatsApp Client**: waClient

**Dependencies**:
- DITBINMAS client configured
- Admin WhatsApp IDs
- Ditbinmas broadcast group (optional)

**Process**:
1. Generate executive summary
2. Send to admin contacts
3. Broadcast to Ditbinmas group if configured

**Notes**: Four times daily for consistent updates throughout workday.

---

### 4. Ditsamapta Incomplete Data Recap (`cronDirRequestRekapBelumLengkapDitsamapta.js`)

**Schedule**: `15 6 * * *` (06:15 WIB daily)

**Purpose**:
- Identify users with incomplete Instagram/TikTok data
- Send recap to Ditsamapta admin/super/operator
- Prompt data completion

**WhatsApp Client**: waClient

**Dependencies**:
- DITSAMAPTA client configured
- Super admin & operator contacts

**Process**:
1. Query users with missing Instagram or TikTok accounts
2. Generate incomplete data report
3. Send to Ditsamapta contacts only (not full admin list)

**Notes**: Early morning reminder for data completion.

---

### 5. Absensi Update Data Username (`cronOprRequestAbsensiUpdateDataUsername.js`)

**Schedule**: `45 6 * * *` (06:45 WIB daily)

**Purpose**:
- Send oprrequest attendance update data username recaps
- Distribute to org client WhatsApp groups

**WhatsApp Client**: waGatewayClient (primary), waClient (fallback)

**Dependencies**:
- Active org clients with social media
- Group WhatsApp registered

**Process**:
1. Generate username update attendance report
2. Send to client WhatsApp group

**Notes**: Morning report for attendance tracking.

---

### 6. Absensi Engagement (`cronOprRequestAbsensiEngagement.js`)

**Schedule**: `20 15,18,20 * * *` (15:20, 18:20, 20:20 WIB daily)

**Purpose**:
- Send oprrequest engagement attendance recaps
- Track Instagram AND TikTok engagement
- Distribute to group, operator, and super admin

**WhatsApp Client**: waGatewayClient (primary), waClient (fallback)

**Dependencies**:
- Active org clients with Instagram AND TikTok enabled
- Operator & super admin contacts
- Group WhatsApp (optional)

**Process**:
1. Calculate engagement metrics (likes + comments)
2. Generate attendance report
3. Send to group WhatsApp
4. Send to operator WhatsApp
5. Send to super admin WhatsApp

**Notes**: Three daily checkpoints align with workday schedule.

---

### 7. Operator Daily Report (`cronOprRequestDailyReport.js`)

**Schedule**: `7 21 * * *` (21:07 WIB daily)

**Purpose**:
- Send daily amplification reports (tugas rutin #1 & #2)
- Deliver to operator WhatsApp
- End-of-day summary

**WhatsApp Client**: waClient

**Dependencies**:
- Active org clients with amplification enabled
- Operator WhatsApp registered

**Process**:
1. Generate daily amplification report
2. Calculate completion rates for tugas rutin #1 and #2
3. Send summary to operator

**Notes**: Evening report provides full-day overview.

---

## DirectRequest Jobs (8+ jobs)

Directorate-specific workflows managed by `registerDirRequestCrons()`.

### 1. BIDHUMAS Evening Report (`cronDirRequestBidhumasEvening.js`)

**Schedule**: Called manually (not cron-scheduled)

**Purpose**:
- Run engagement-only refresh (`forceEngagementOnly: true`)
- Execute dirRequest menu actions 6 and 9 for BIDHUMAS
- Send evening reports to BIDHUMAS group and super admin

**WhatsApp Client**: waGatewayClient (primary), waClient, waUserClient (fallbacks)

**Dependencies**:
- BIDHUMAS client configured
- Group & super admin WhatsApp contacts

**Menu Actions**:
- **Menu 6**: Engagement ranking report
- **Menu 9**: Daily recap report

**Process**:
1. Run `runDirRequestFetchSosmed({ forceEngagementOnly: true })`
2. Execute menu 6 for BIDHUMAS group
3. Execute menu 9 for BIDHUMAS super admin
4. Log completion

**Notes**: Typically called at 22:00 WIB for end-of-day reporting.

---

### 2. DITBINMAS Group Recap (`cronDirRequestDitbinmasGroupRecap.js`)

**Schedule**: Called manually

**Purpose**:
- Send menu actions 21 and 22 to DITBINMAS group
- Distribute group-level recaps

**WhatsApp Client**: waGatewayClient (primary)

**Menu Actions**:
- **Menu 21**: Weekly recap
- **Menu 22**: Monthly recap

**Dependencies**:
- DITBINMAS client with group contact

---

### 3. DITBINMAS Absensi Today (`cronDirRequestDitbinmasAbsensiToday.js`)

**Schedule**: Called manually

**Purpose**:
- Send today's attendance data (menu 5 & 10)
- Target specific phone number (081331780006)

**WhatsApp Client**: waGatewayClient (primary)

**Menu Actions**:
- **Menu 5**: Today's Instagram attendance
- **Menu 10**: Today's TikTok attendance

---

### 4. DITBINMAS Super Admin Daily (`cronDirRequestDitbinmasSuperAdminDaily.js`)

**Schedule**: Called manually

**Purpose**:
- Send daily recap to DITBINMAS super admins
- Execute menu actions 6, 9, 34, 35

**Menu Actions**:
- **Menu 6**: Engagement ranking
- **Menu 9**: Daily recap
- **Menu 34**: Super admin report 1
- **Menu 35**: Super admin report 2

**Dependencies**:
- DITBINMAS super admin contacts

---

### 5. DITBINMAS Operator Daily (`cronDirRequestDitbinmasOperatorDaily.js`)

**Schedule**: Called manually

**Purpose**:
- Send daily report to DITBINMAS operators
- Execute menu action 30

**Menu Actions**:
- **Menu 30**: Operator daily report

**Dependencies**:
- DITBINMAS operator contacts

---

### 6. Custom Sequence Orchestrator (`cronDirRequestCustomSequence.js`)

**Schedule**: Called manually

**Purpose**:
- Orchestrate complex multi-step sequences
- Coordinate: fetch sosmed → DITBINMAS recap → BIDHUMAS menus

**WhatsApp Clients**: waGatewayClient, waClient, waUserClient

**Capabilities**:
- Run full sosmed fetch
- Execute DITBINMAS recaps
- Run BIDHUMAS evening sequence
- Chain multiple jobs together

**Notes**: Used by other dirRequest jobs for workflow orchestration.

---

### 7. Satbinmas Official Media (`cronDirRequestSatbinmasOfficialMedia.js`)

**Schedule**: Called manually

**Purpose**:
- Send Satbinmas Official Instagram & TikTok recaps
- Distribute to admin recipients
- Track official account performance

**WhatsApp Clients**: waGatewayClient, waClient, waUserClient (fallbacks)

**Dependencies**:
- Admin WhatsApp IDs (`ADMIN_WHATSAPP`)
- Satbinmas official account data

---

### 8. WA Notification Reminder (`cronWaNotificationReminder.js`)

**Schedule**: Called manually

**Purpose**:
- Send personalized engagement reminders to active users
- Target users with incomplete Instagram/TikTok tasks
- DITBINMAS/BIDHUMAS clients only

**WhatsApp Clients**: waGatewayClient, waClient, waUserClient (fallbacks)

**Dependencies**:
- Active users with WhatsApp registered
- User opt-in enabled (`wa_notification_enabled`)
- DITBINMAS or BIDHUMAS clients

**Process**:
1. Query users with incomplete tasks
2. Filter by opt-in status
3. Send personalized reminder message
4. Log delivery status

---

## Other Cron Jobs (Not Scheduled)

### Absensi Opr Direktorat (`cronAbsensiOprDirektorat.js`)

**Status**: Exported function, no schedule

**Purpose**: Send attendance dashboard data for all active directorates to admin WhatsApp IDs

---

### Absensi User Data (`cronAbsensiUserData.js`)

**Status**: Exported function, no schedule

**Purpose**: Send list of users missing WhatsApp/Instagram/TikTok registration data to admins

---

## Cron Job Architecture

### Manifest Registration

Jobs are registered in `src/cron/cronManifest.js`:

```javascript
export const cronJobs = {
  always: [
    { job: cronDbBackup, name: 'cronDbBackup' },
    { job: cronDirRequestFetchSosmed, name: 'cronDirRequestFetchSosmed' },
    { job: cronPremiumExpiry, name: 'cronPremiumExpiry' },
    { job: cronOprRequestAmplifyRoutineUpdate, name: 'cronOprRequestAmplifyRoutineUpdate' }
  ],
  waClient: [
    { job: cronRekapLink, name: 'cronRekapLink' },
    { job: cronAmplifyLinkMonthly, name: 'cronAmplifyLinkMonthly' },
    { job: cronDirRequestRekapUpdate, name: 'cronDirRequestRekapUpdate' },
    // ... more jobs
  ]
};
```

### Job Activation

```javascript
// app.js
import { initializeCronJobs } from './src/cron/cronManifest.js';
import { registerDirRequestCrons } from './src/cron/dirRequest/index.js';

// Always bucket starts immediately
initializeCronJobs();

// waClient bucket starts when client ready
waClient.on('ready', () => {
  initializeCronJobs('waClient', waClient);
});

// dirRequest bucket
if (env.ENABLE_DIRREQUEST_GROUP) {
  registerDirRequestCrons(waGatewayClient);
}
```

### Single-Flight Handler

DirRequest jobs use single-flight pattern to prevent concurrent execution:

```javascript
let isRunning = false;

export async function runJob() {
  if (isRunning) {
    console.log('[CRON] Job already running, skipping');
    return;
  }
  
  isRunning = true;
  try {
    // Execute job logic
  } finally {
    isRunning = false;
  }
}
```

---

## WhatsApp Client Fallback

Jobs use fallback mechanism for resilience:

```javascript
function getWhatsAppClient() {
  if (waGatewayClient && isReady(waGatewayClient)) {
    return waGatewayClient;
  }
  if (waClient && isReady(waClient)) {
    return waClient;
  }
  if (waUserClient && isReady(waUserClient)) {
    return waUserClient;
  }
  throw new Error('No WhatsApp client available');
}
```

---

## Rate Limiting & Throttling

Default 2000ms delay between messages:

```javascript
await sendMessageWithDelay(client, recipient, message, 2000);
```

Configurable via `dirRequestThrottle.js`.

---

## Timezone Configuration

All jobs use Asia/Jakarta timezone:

```javascript
import { CronJob } from 'cron';

new CronJob(
  '0 4 * * *',  // 04:00 WIB
  jobFunction,
  null,
  true,
  'Asia/Jakarta'
);
```

---

## Logging & Debugging

Jobs log via structured logger:

```javascript
import { sendDebug } from '../utils/waHelper.js';
import logger from '../utils/logger.js';

// Console log (Jakarta timezone)
logger.info('[CRON] Job started');

// WhatsApp debug message to admins
await sendDebug(client, '[CRON] Job completed successfully');
```

---

## Environment Configuration

### Required Variables

```ini
# Timezone (implicit)
TZ=Asia/Jakarta

# Feature toggles
ENABLE_DIRREQUEST_GROUP=true

# WhatsApp clients
ADMIN_WHATSAPP=628xxx,628yyy
GATEWAY_WHATSAPP_ADMIN=628zzz

# Database backup
GOOGLE_SERVICE_ACCOUNT=/path/to/service-account.json
GOOGLE_DRIVE_FOLDER_ID=folder-id
BACKUP_DIR=./backups

# Social media
RAPIDAPI_KEY=your-key
RAPIDAPI_FALLBACK_KEY=fallback-key
```

---

## Monitoring & Troubleshooting

### Check Cron Status

Jobs log startup and completion:
```
[CRON] cronDbBackup started
[CRON] cronDbBackup completed successfully
```

### Debug Mode

Enable debug logging:
```ini
DEBUG_FETCH_INSTAGRAM=true
```

### Manual Execution

Run jobs manually:
```javascript
import cronDbBackup from './src/cron/cronDbBackup.js';
await cronDbBackup();
```

---

## Testing Cron Jobs

### Unit Tests

```javascript
// tests/cron/cronDbBackup.test.js
import cronDbBackup from '../../src/cron/cronDbBackup.js';

describe('cronDbBackup', () => {
  it('should create backup successfully', async () => {
    await cronDbBackup();
    // Verify backup file created
  });
});
```

### Integration Tests

Test with actual WhatsApp client (staging):
```bash
npm run test:integration
```

---

## Performance Considerations

- **Parallel Execution**: Jobs in different buckets can run simultaneously
- **Resource Usage**: Social media fetching is most resource-intensive
- **Database Load**: Ensure proper indexing for cron queries
- **WhatsApp Rate Limits**: Throttling prevents blocking

---

## Related Documentation

- [STRUCTURE.md](../STRUCTURE.md) - Repository structure
- [SERVICES.md](SERVICES.md) - Service layer documentation
- [whatsapp_client_lifecycle.md](whatsapp_client_lifecycle.md) - WhatsApp details
- [wa_dirrequest.md](wa_dirrequest.md) - Directorate request workflows

---

## Contributing

When adding new cron jobs:
1. Create job file in `src/cron/`
2. Register in `cronManifest.js` (appropriate bucket)
3. Use Asia/Jakarta timezone
4. Add single-flight handler for idempotency
5. Include structured logging
6. Handle errors gracefully
7. Update this documentation

See [pull_request_guidelines.md](pull_request_guidelines.md) for more details.

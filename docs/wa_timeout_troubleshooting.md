# WhatsApp Client Ready Timeout Troubleshooting Guide

## Problem Description

The WhatsApp client times out during initialization with an error message like:

```
Client wa-user-prod ready timeout after 120000ms. Client authenticated but WhatsApp Web page did not fully load.
```

This error occurs when the WhatsApp Web page takes too long to fully load after authentication, even though the client has successfully authenticated with WhatsApp servers.

## Root Cause

The timeout is related to the **DevTools Protocol (Puppeteer)** communication between Node.js and the Chromium browser running WhatsApp Web. The issue can be caused by:

1. **Network latency**: Slow connection to WhatsApp Web servers
2. **High server load**: WhatsApp Web servers responding slowly
3. **Resource constraints**: Limited CPU/memory on the host system
4. **Browser initialization delays**: Chromium taking longer to start or load WhatsApp Web
5. **Geographic distance**: Physical distance from WhatsApp data centers

## Solution 1: Increase Timeout Values (Recommended)

### Quick Fix

Add or update these environment variables in your `.env` file:

```bash
# Increase default protocol timeout from 120s to 180s (3 minutes)
WA_WWEBJS_PROTOCOL_TIMEOUT_MS=180000

# Per-client overrides (optional, for specific clients that need more time)
WA_WWEBJS_PROTOCOL_TIMEOUT_MS_USER=180000
WA_WWEBJS_PROTOCOL_TIMEOUT_MS_GATEWAY=240000

# Maximum timeout cap for auto-backoff (5 minutes)
WA_WWEBJS_PROTOCOL_TIMEOUT_MAX_MS=300000

# Backoff multiplier for automatic timeout increase
WA_WWEBJS_PROTOCOL_TIMEOUT_BACKOFF_MULTIPLIER=1.5
```

### Explanation

- **WA_WWEBJS_PROTOCOL_TIMEOUT_MS**: Base timeout for all clients (default: 180000ms = 3 minutes)
- **Per-client overrides**: Allow specific clients to have different timeouts
  - `_USER` suffix: For clients starting with `wa-user`
  - `_GATEWAY` suffix: For clients starting with `wa-gateway`
- **MAX_MS**: Maximum timeout ceiling for automatic backoff
- **BACKOFF_MULTIPLIER**: How much to increase timeout on each retry

### When to Use

- **180000ms (3 min)**: Standard production deployment
- **240000ms (4 min)**: High-latency networks or distant servers
- **300000ms (5 min)**: Extremely poor network conditions or resource-constrained environments

## Solution 2: Optimize Puppeteer Configuration

The system includes optimized Puppeteer settings for better stability:

```javascript
// Already configured in WhatsAppClient.js
args: [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',              // Reduce shared memory usage
  '--disable-accelerated-2d-canvas',
  '--disable-gpu',
  '--single-process',                      // Run in single process
  '--disable-blink-features=AutomationControlled',  // Prevent detection
  '--disable-features=site-per-process',   // Reduce memory usage
  '--js-flags=--max-old-space-size=2048',  // Increase JS memory limit
]
```

These settings are already applied by default. No action needed.

## Solution 3: System-Level Optimizations

### 1. Ensure Adequate Resources

```bash
# Check available memory
free -h

# Check CPU load
top

# Ensure at least 2GB RAM and 2 CPU cores available for WhatsApp clients
```

### 2. Install/Update Chrome

```bash
# Install Chrome if not present
npx puppeteer browsers install chrome

# Or specify custom Chrome path
export WA_PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### 3. Check Network Connectivity

```bash
# Test latency to WhatsApp servers
ping web.whatsapp.com

# Check DNS resolution
nslookup web.whatsapp.com

# Test HTTP connectivity
curl -I https://web.whatsapp.com
```

## Solution 4: Monitor and Diagnose

### Enable Enhanced Logging

The system now includes enhanced logging to track initialization timing:

```
[WhatsApp] Client wa-user-prod authenticated
[WhatsApp] Client wa-user-prod - Waiting for WhatsApp Web to fully load...
[WhatsApp] ✅ Client wa-user-prod is READY! (load time: 45234ms)
```

The `load time` shows how long it took from authentication to ready state.

### Check Health Endpoint

```bash
curl http://localhost:3000/api/health/wa | jq
```

Look for:
- `clients[].isReady`: Should be `true`
- `clients[].isConnecting`: Should be `false`
- Check for error messages

## Solution 5: Retry Mechanism

The system includes automatic retry with exponential backoff:

1. **First attempt**: Uses configured timeout (e.g., 180000ms)
2. **Retry 1**: Timeout increases by multiplier (e.g., 180000 * 1.5 = 270000ms)
3. **Retry 2**: Continues increasing up to MAX_MS cap
4. **Max retries**: System will retry up to 5 times before failing

This is automatic and requires no configuration beyond setting the base timeout and max values.

## Common Scenarios and Solutions

### Scenario 1: Consistent Timeouts on Initialization

**Symptom**: Every server restart results in timeout

**Solution**: 
1. Increase `WA_WWEBJS_PROTOCOL_TIMEOUT_MS` to 240000 (4 minutes)
2. Check network latency: `ping web.whatsapp.com`
3. Ensure Chrome is installed and accessible
4. Check system resources (RAM, CPU)

### Scenario 2: Intermittent Timeouts

**Symptom**: Sometimes works, sometimes times out

**Solution**:
1. Enable auto-backoff: Set `WA_WWEBJS_PROTOCOL_TIMEOUT_MAX_MS=300000`
2. Monitor network stability
3. Check for resource contention (other processes using CPU/memory)
4. Review WhatsApp Web service status

### Scenario 3: Only Gateway Client Times Out

**Symptom**: User client works, but gateway client times out

**Solution**:
```bash
# Give gateway client more time
WA_WWEBJS_PROTOCOL_TIMEOUT_MS_GATEWAY=300000
```

### Scenario 4: All Clients Timeout After Update

**Symptom**: Worked before, broken after system/code update

**Solution**:
1. Clear WhatsApp session data: `rm -rf ~/.cicero/wwebjs_auth/*`
2. Re-scan QR codes
3. Check if Chrome was updated/removed
4. Review recent configuration changes

## Prevention and Best Practices

### 1. Set Conservative Timeouts in Production

```bash
# Recommended production values
WA_WWEBJS_PROTOCOL_TIMEOUT_MS=180000
WA_WWEBJS_PROTOCOL_TIMEOUT_MAX_MS=300000
WA_WWEBJS_PROTOCOL_TIMEOUT_BACKOFF_MULTIPLIER=1.5
```

### 2. Monitor Initialization Times

Track the `load time` metric from logs to establish baseline:
- **Good**: < 60 seconds
- **Acceptable**: 60-120 seconds
- **Concerning**: > 120 seconds (investigate)

### 3. Set Up Alerts

Monitor for repeated timeout errors and alert if:
- Multiple consecutive initialization failures
- Initialization time exceeds 2 minutes consistently
- Any client remains in "connecting" state for > 5 minutes

### 4. Regular Health Checks

```bash
# Automated health check
*/5 * * * * curl -s http://localhost:3000/api/health/wa | jq '.clients[] | select(.isReady == false)'
```

## Debugging Steps

If the issue persists after trying the solutions above:

### 1. Collect Diagnostic Information

```bash
# Check environment variables
env | grep WA_

# Check Chrome installation
which chromium-browser
which google-chrome

# Check system resources
free -h && df -h && uptime

# Check network
ping -c 5 web.whatsapp.com
traceroute web.whatsapp.com
```

### 2. Enable Verbose Logging

Look for these log patterns:
```
[WhatsApp] Creating underlying whatsapp-web.js client for wa-user-prod...
[WhatsApp] Setting up event listeners for wa-user-prod...
[WhatsApp] Initializing whatsapp-web.js client wa-user-prod...
[WhatsApp] Client wa-user-prod authenticated
[WhatsApp] Client wa-user-prod - Waiting for WhatsApp Web to fully load...
[WhatsApp] ✅ Client wa-user-prod is READY! (load time: XXXXXms)
```

If logs stop after "authenticated" but before "READY", it's a WhatsApp Web page loading issue.

### 3. Test with Minimal Configuration

Create a test environment with:
```bash
WA_WWEBJS_PROTOCOL_TIMEOUT_MS=300000
# Remove all other WA_* overrides
```

### 4. Check WhatsApp Web Status

Visit https://downdetector.com/status/whatsapp/ to check for known outages.

## Emergency Workaround

If you need the service running immediately and can't wait for timeouts:

```bash
# Set very high timeout (10 minutes) temporarily
WA_WWEBJS_PROTOCOL_TIMEOUT_MS=600000

# Restart service
pm2 restart cicero-whatsapp

# Monitor logs closely
pm2 logs cicero-whatsapp
```

⚠️ **Warning**: This is a temporary workaround. Investigate the root cause and apply proper fixes.

## Related Documentation

- `/docs/wa_best_practices.md` - Complete WhatsApp configuration guide
- `/docs/whatsapp_client_lifecycle.md` - Client lifecycle and timeout mechanics
- `/docs/wa_troubleshooting.md` - General WhatsApp troubleshooting
- `/.env.example` - Environment variable examples

## Support

If none of the solutions work:

1. Collect all diagnostic information from the "Debugging Steps" section
2. Include recent logs showing the timeout error
3. Document your environment (OS, Node version, network setup)
4. Note any recent changes (system updates, configuration changes, etc.)
5. Check GitHub issues for similar problems

# API Endpoints Reference
*Last updated: 2026-02-06*

This document provides a complete reference of all API endpoints in the Cicero WhatsApp Backend.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via JWT token:

```bash
Authorization: Bearer <your-jwt-token>
```

Some endpoints are public (marked with ❌ in the Auth column).

## Health Check

### Root Health Check

```http
GET / 
POST /
```

**Description**: Basic health check for load balancers  
**Auth**: ❌ None  
**Response**:
```json
{
  "status": "ok"
}
```

---

## Authentication & User Management (`/api/auth`)

### Penmas Authentication

#### Register Penmas Operator
```http
POST /api/auth/penmas-register
```

**Auth**: ❌ None  
**Body**:
```json
{
  "username": "string",
  "password": "string",
  "role": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "user_id": "string"
}
```

#### Login Penmas Operator
```http
POST /api/auth/penmas-login
```

**Auth**: ❌ None  
**Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "success": true,
  "token": "jwt-token",
  "user": { /* user object */ }
}
```

---

### Dashboard Authentication

#### Register Dashboard User
```http
POST /api/auth/dashboard-register
```

**Auth**: ❌ None  
**Body**:
```json
{
  "username": "string",
  "password": "string",
  "whatsapp": "string",
  "role_id": "string (optional)",
  "client_ids": ["array of client IDs (optional)"]
}
```

**Response**:
```json
{
  "success": true,
  "dashboard_user_id": "string",
  "status": "pending"
}
```

**Note**: New dashboard users must be approved by admin before gaining access.

#### Login Dashboard User
```http
POST /api/auth/dashboard-login
```

**Auth**: ❌ None  
**Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "dashboard_user_id": "string",
    "username": "string",
    "role_id": "string",
    "client_ids": ["array"],
    "status": "approved"
  },
  "premium": {
    "tier": "free|basic|premium",
    "features": ["array of features"],
    "expiry_date": "ISO date or null"
  }
}
```

---

### Password Reset

#### Request Password Reset
```http
POST /api/auth/dashboard-password-reset/request
POST /api/password-reset/request  (alias)
```

**Auth**: ❌ None  
**Body**:
```json
{
  "username": "string",
  "contact": "email or whatsapp"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Reset link sent via WhatsApp/Email"
}
```

**Note**: Sends reset token via Telegram bot or WhatsApp to admin.

#### Confirm Password Reset
```http
POST /api/auth/dashboard-password-reset/confirm
POST /api/password-reset/confirm  (alias)
```

**Auth**: ❌ None  
**Body**:
```json
{
  "token": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### Mobile Client Authentication

#### Login Client Operator (Mobile App)
```http
POST /api/auth/login
```

**Auth**: ❌ None  
**Body**:
```json
{
  "client_id": "string",
  "client_operator": "string"
}
```

**Response**:
```json
{
  "success": true,
  "token": "jwt-token",
  "client": { /* client object */ }
}
```

---

### User Authentication

#### Register User
```http
POST /api/auth/user-register
```

**Auth**: ❌ None  
**Body**:
```json
{
  "nrp": "string",
  "nama": "string",
  "client_id": "string",
  "whatsapp": "string (optional)",
  "divisi": "string (optional)",
  "jabatan": "string (optional)",
  "title": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "user_id": "string"
}
```

#### Login User
```http
POST /api/auth/user-login
```

**Auth**: ❌ None  
**Body**:
```json
{
  "nrp": "string",
  "whatsapp": "string or password"
}
```

**Response**:
```json
{
  "success": true,
  "token": "jwt-token",
  "user": { /* user object */ }
}
```

---

### Analytics Tracking

#### Track Web Visit
```http
GET /api/auth/open
```

**Auth**: ❌ None  
**Description**: Tracks web page visits for analytics  
**Response**:
```json
{
  "success": true
}
```

---

## User Management (`/api/users`)

All user endpoints require authentication via `authRequired` middleware.

### Get All Users
```http
GET /api/users
GET /api/users/list
```

**Auth**: ✅ Required  
**Response**: Array of user objects

### Get Users by Client
```http
GET /api/users/by-client/:client_id
```

**Auth**: ✅ Required  
**Parameters**: `client_id` (path)  
**Response**: Array of users for the specified client

### Get Full User Details by Client
```http
GET /api/users/by-client-full/:client_id
```

**Auth**: ✅ Required  
**Parameters**: `client_id` (path)  
**Response**: Detailed user information including social contacts

### Get User by ID
```http
GET /api/users/:id
```

**Auth**: ✅ Required  
**Parameters**: `id` (path)  
**Response**: Single user object

### Create User
```http
POST /api/users
POST /api/users/create
```

**Auth**: ✅ Required  
**Body**:
```json
{
  "nrp": "string",
  "nama": "string",
  "client_id": "string",
  "whatsapp": "string (optional)",
  "divisi": "string (optional)",
  "jabatan": "string (optional)",
  "instagram": "string (optional)",
  "tiktok": "string (optional)"
}
```

### Update User
```http
PUT /api/users/:id
```

**Auth**: ✅ Required  
**Parameters**: `id` (path)  
**Body**: User fields to update

### Update WhatsApp Notification Preference
```http
PUT /api/users/:id/wa-notification
```

**Auth**: ✅ Required  
**Parameters**: `id` (path)  
**Body**:
```json
{
  "wa_notification_enabled": true
}
```

### Update User Roles
```http
PUT /api/users/:id/roles
```

**Auth**: ✅ Required  
**Parameters**: `id` (path)  
**Body**:
```json
{
  "roles": ["role1", "role2"]
}
```

### Delete User
```http
DELETE /api/users/:id
```

**Auth**: ✅ Required  
**Parameters**: `id` (path)

---

## Client Management (`/api/clients`)

### Get All Clients
```http
GET /api/clients
```

**Auth**: ❌ None  
**Response**: Array of all clients

### Get Active Clients
```http
GET /api/clients/active
```

**Auth**: ❌ None  
**Response**: Array of active clients only

### Get Client Profile
```http
GET /api/clients/profile
```

**Auth**: ❌ None  
**Response**: Client profile information

### Get Client by ID
```http
GET /api/clients/:client_id
```

**Auth**: ❌ None  
**Parameters**: `client_id` (path)  
**Response**: Single client object

### Get Client Users
```http
GET /api/clients/:client_id/users
```

**Auth**: ✅ Required  
**Parameters**: `client_id` (path)  
**Response**: Array of users belonging to the client

### Get Client Summary
```http
GET /api/clients/:client_id/summary
```

**Auth**: ✅ Required  
**Parameters**: `client_id` (path)  
**Response**: Client summary with statistics

### Update Client
```http
PUT /api/clients/:client_id
```

**Auth**: ❌ None  
**Parameters**: `client_id` (path)  
**Body**: Client fields to update

### Delete Client
```http
DELETE /api/clients/:client_id
```

**Auth**: ❌ None  
**Parameters**: `client_id` (path)

---

## Approval Requests (`/api/approvals`)

All approval endpoints require Penmas authentication.

### Get Approvals
```http
GET /api/approvals
```

**Auth**: ✅ Penmas Token  
**Response**: Array of approval requests

### Create Approval Request
```http
POST /api/approvals
```

**Auth**: ✅ Penmas Token  
**Body**:
```json
{
  "title": "string",
  "description": "string",
  "requester_id": "string",
  "approval_type": "string"
}
```

### Update Approval
```http
PUT /api/approvals/:id
```

**Auth**: ✅ Penmas Token  
**Parameters**: `id` (path)  
**Body**: Approval fields to update

---

## Premium Requests (`/api/premium-requests`)

### Create Premium Request
```http
POST /api/premium-requests
```

**Auth**: ❌ None  
**Body**:
```json
{
  "dashboard_user_id": "string",
  "requested_tier": "basic|premium",
  "duration_months": 1,
  "notes": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "premium_request_id": "string",
  "status": "pending"
}
```

### Update Premium Request
```http
PUT /api/premium-requests/:id
```

**Auth**: ❌ None  
**Parameters**: `id` (path)  
**Body**:
```json
{
  "status": "approved|rejected",
  "admin_notes": "string (optional)"
}
```

---

## User Claims (`/api/claim`)

OTP-based user verification endpoints.

### Request OTP
```http
POST /api/claim/request-otp
```

**Auth**: ❌ None  
**Body**:
```json
{
  "nrp": "string",
  "email": "string"
}
```

**Response**:
```json
{
  "success": true,
  "message": "OTP sent to email"
}
```

**Note**: OTP is valid for 15 minutes.

### Verify OTP
```http
POST /api/claim/verify-otp
```

**Auth**: ❌ None  
**Body**:
```json
{
  "nrp": "string",
  "email": "string",
  "otp": "string"
}
```

**Response**:
```json
{
  "success": true,
  "verified": true
}
```

### Get User Claim Data
```http
POST /api/claim/user-data
```

**Auth**: ❌ None  
**Body**:
```json
{
  "nrp": "string",
  "email": "string"
}
```

**Response**:
```json
{
  "success": true,
  "user": { /* user object */ }
}
```

### Update User Claim Data
```http
PUT /api/claim/update
```

**Auth**: ❌ None  
**Body**:
```json
{
  "nrp": "string",
  "email": "string",
  "instagram": "string (optional)",
  "tiktok": "string (optional)",
  "whatsapp": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Data updated successfully"
}
```

### Validate Email
```http
POST /api/claim/validate-email
```

**Auth**: ❌ None  
**Body**:
```json
{
  "email": "string"
}
```

**Response**:
```json
{
  "success": true,
  "valid": true
}
```

---

## WhatsApp Health (`/api/health/wa`)

### Get WhatsApp Status
```http
GET /api/health/wa
```

**Auth**: ❌ None  
**Response**:
```json
{
  "status": "ok",
  "shouldInitWhatsAppClients": true,
  "clients": {
    "waClient": {
      "ready": true,
      "clientId": "wa-admin",
      "state": "CONNECTED"
    },
    "waUserClient": {
      "ready": true,
      "clientId": "wa-userrequest-prod",
      "state": "CONNECTED"
    },
    "waGatewayClient": {
      "ready": true,
      "clientId": "wa-gateway-prod",
      "state": "CONNECTED"
    }
  },
  "messageDeduplication": {
    "enabled": true,
    "ttl": 300000
  }
}
```

---

## Error Responses

All endpoints follow a consistent error response format:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded or duplicate request |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

---

## Rate Limiting

### Request Deduplication

Non-GET requests are deduplicated using Redis for 5 minutes. If an identical request is sent within the deduplication window, it will receive:

```json
{
  "error": "Duplicate request detected"
}
```

**HTTP Status**: 429 Too Many Requests

**Exempt Endpoints**:
- `/api/claim/*` - OTP flow endpoints

**Disable in Development**:
Set `ALLOW_DUPLICATE_REQUESTS=true` in `.env`

---

## Authentication Details

### JWT Token Format

JWT tokens include the following claims:

```json
{
  "user_id": "string",
  "username": "string",
  "role": "string",
  "client_id": "string (optional)",
  "exp": 1234567890,
  "iat": 1234567890
}
```

### Token Expiration

- Dashboard tokens: 30 days
- User tokens: 30 days
- Password reset tokens: 15 minutes

### Usage

Include the token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Or in the `token` cookie (set automatically by login endpoints).

---

## Pagination

Endpoints that return large datasets support pagination:

```http
GET /api/users?page=1&limit=50
```

**Parameters**:
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 50, max: 100)

**Response**:
```json
{
  "success": true,
  "data": [/* results */],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 500,
    "totalPages": 10
  }
}
```

---

## CORS Configuration

CORS is configured via `CORS_ORIGIN` environment variable:

```ini
CORS_ORIGIN=http://localhost:3000,https://dashboard.example.com
```

Credentials (cookies, authorization headers) are supported for origins in the allowlist.

---

## WebSocket Support

Currently not implemented. All communication is via REST API.

---

## Testing Endpoints

Use curl or any HTTP client:

```bash
# Health check
curl http://localhost:3000/

# Login
curl -X POST http://localhost:3000/api/auth/dashboard-login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secret"}'

# Authenticated request
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Additional Documentation

- [Login API Details](login_api.md) - Comprehensive login documentation
- [Claim API](claim_api.md) - OTP verification flow
- [Premium Subscription](premium_subscription.md) - Premium tier details
- [Database Structure](database_structure.md) - Database schema reference

---

## Version History

- **2026-02-06**: Initial comprehensive API documentation
- Endpoint paths and responses reflect current codebase structure

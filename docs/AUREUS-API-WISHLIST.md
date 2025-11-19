# AUREUS - API Wishlist for White-Label Integration

**Version:** 1.0  
**Date:** November 2024  
**Confidential - NDA Protected**

This document outlines the API endpoints and integration points we expect from a white-label lottery platform to seamlessly integrate with Aureus.

---

## 🔐 Authentication & Player Management

### 1. Player Account Sync
**Endpoint:** `POST /api/player/sync`

**Purpose:** Sync wallet address with white-label player account

**Request:**
```json
{
  "walletAddress": "0x47d918C2e303855da1AD3e08A4128211284aD837",
  "username": "PlayerUsername",
  "metadata": {
    "telegramUsername": "@player",
    "referralCode": "ABC123"
  }
}
```

**Response:**
```json
{
  "playerId": "player_123456",
  "status": "active",
  "kycStatus": "verified",
  "geoBlocked": false,
  "createdAt": "2024-11-01T00:00:00Z"
}
```

---

### 2. Player Status Check
**Endpoint:** `GET /api/player/{walletAddress}/status`

**Purpose:** Check player account status, KYC, geo-blocking

**Response:**
```json
{
  "playerId": "player_123456",
  "walletAddress": "0x47d918C2e303855da1AD3e08A4128211284aD837",
  "status": "active",
  "kycStatus": "verified",
  "kybStatus": "not_required",
  "geoBlocked": false,
  "allowedCountries": ["US", "CA", "GB"],
  "restrictedCountries": ["FR", "DE"],
  "accountBalance": {
    "usdc": "1000.00",
    "fiat": "1000.00"
  }
}
```

---

## 🎫 Ticket Management

### 3. Ticket Purchase
**Endpoint:** `POST /api/tickets/purchase`

**Purpose:** Purchase tickets via white-label system

**Request:**
```json
{
  "playerId": "player_123456",
  "walletAddress": "0x47d918C2e303855da1AD3e08A4128211284aD837",
  "ticketCount": 10,
  "paymentMethod": "usdc", // or "card", "fiat"
  "paymentDetails": {
    "transactionHash": "0x...", // for crypto
    "cardToken": "...", // for card
    "amount": "10.00"
  },
  "discountCode": "QUICK10" // optional
}
```

**Response:**
```json
{
  "success": true,
  "ticketIds": [
    "ticket_001",
    "ticket_002",
    // ... 10 tickets
  ],
  "totalCost": "10.00",
  "discountApplied": "0.50",
  "finalAmount": "9.50",
  "transactionId": "txn_123456",
  "drawNumber": 42
}
```

---

### 4. Ticket History
**Endpoint:** `GET /api/tickets/{playerId}/history`

**Purpose:** Get player's ticket purchase history

**Query Parameters:**
- `limit` (default: 50)
- `offset` (default: 0)
- `drawNumber` (optional filter)

**Response:**
```json
{
  "tickets": [
    {
      "ticketId": "ticket_001",
      "drawNumber": 42,
      "purchaseDate": "2024-11-01T10:00:00Z",
      "status": "active", // active, won, lost, expired
      "price": "1.00"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

---

## 🎰 Draw Management

### 5. Draw Webhook (Incoming)
**Endpoint:** `POST /api/draws/webhook`

**Purpose:** Receive draw notifications from white-label system

**Expected Payload:**
```json
{
  "eventType": "draw_scheduled" | "draw_started" | "draw_completed" | "draw_cancelled",
  "drawId": "draw_123456",
  "drawType": "main" | "bonus",
  "drawNumber": 42,
  "scheduledTime": "2024-11-01T21:00:00Z",
  "ticketCount": 5000,
  "prizePool": {
    "main": "4250.00",
    "bonus": "250.00",
    "treasury": "500.00"
  },
  "winners": [ // only for draw_completed
    {
      "playerId": "player_123456",
      "walletAddress": "0x...",
      "ticketId": "ticket_001",
      "prize": "4250.00"
    }
  ],
  "randomnessProof": "0x...", // VRF proof
  "timestamp": "2024-11-01T21:00:00Z"
}
```

---

### 6. Draw Status
**Endpoint:** `GET /api/draws/{drawId}/status`

**Purpose:** Check current draw status

**Response:**
```json
{
  "drawId": "draw_123456",
  "drawType": "main",
  "drawNumber": 42,
  "status": "scheduled" | "in_progress" | "completed" | "cancelled",
  "scheduledTime": "2024-11-01T21:00:00Z",
  "completedTime": "2024-11-01T21:05:00Z",
  "ticketCount": 5000,
  "prizePool": "4250.00",
  "winner": {
    "playerId": "player_123456",
    "walletAddress": "0x...",
    "prize": "4250.00"
  }
}
```

---

## 💰 Payouts & Treasury

### 7. Payout Request
**Endpoint:** `POST /api/payouts/request`

**Purpose:** Request prize payout

**Request:**
```json
{
  "playerId": "player_123456",
  "walletAddress": "0x47d918C2e303855da1AD3e08A4128211284aD837",
  "drawId": "draw_123456",
  "prizeAmount": "4250.00",
  "currency": "usdc"
}
```

**Response:**
```json
{
  "payoutId": "payout_123456",
  "status": "pending" | "processing" | "completed" | "failed",
  "estimatedCompletion": "2024-11-01T21:10:00Z",
  "transactionHash": "0x...", // when completed
  "fee": "0.00"
}
```

---

### 8. Treasury Balance
**Endpoint:** `GET /api/treasury/balance`

**Purpose:** Get treasury balance and statistics

**Response:**
```json
{
  "totalBalance": "50000.00",
  "currency": "usdc",
  "breakdown": {
    "collected": "500000.00",
    "distributed": "450000.00",
    "pending": "5000.00"
  },
  "lastUpdated": "2024-11-01T20:00:00Z"
}
```

---

## 📊 Reporting & Analytics

### 9. Platform Statistics
**Endpoint:** `GET /api/stats/platform`

**Purpose:** Get platform-wide statistics

**Response:**
```json
{
  "totalPlayers": 10000,
  "activePlayers": 5000,
  "totalTicketsSold": 500000,
  "totalPrizesDistributed": "425000.00",
  "currentJackpot": "4250.00",
  "averageTicketPrice": "1.00",
  "retentionRate": 0.65,
  "lastDraw": {
    "drawId": "draw_123456",
    "timestamp": "2024-11-01T21:00:00Z",
    "winner": "0x...",
    "prize": "4250.00"
  }
}
```

---

### 10. Compliance Export
**Endpoint:** `GET /api/compliance/export`

**Purpose:** Export compliance data (KYC, transactions, payouts)

**Query Parameters:**
- `startDate` (ISO 8601)
- `endDate` (ISO 8601)
- `format` (json, csv, xlsx)
- `type` (kyc, transactions, payouts, all)

**Response:**
- File download (CSV/JSON/XLSX) or JSON array

---

## 🔔 Notifications

### 11. Notification Preferences
**Endpoint:** `PUT /api/notifications/preferences`

**Purpose:** Update player notification preferences

**Request:**
```json
{
  "playerId": "player_123456",
  "preferences": {
    "email": {
      "drawReminders": true,
      "winnerAnnouncements": true,
      "promotions": false
    },
    "sms": {
      "drawReminders": false,
      "winnerAnnouncements": true
    },
    "push": {
      "drawReminders": true,
      "winnerAnnouncements": true,
      "ticketPurchases": false
    }
  }
}
```

---

## 🎨 Branding & Customization

### 12. Brand Assets
**Endpoint:** `GET /api/brand/assets`

**Purpose:** Get white-label brand assets (logos, colors, fonts)

**Response:**
```json
{
  "logo": {
    "primary": "https://cdn.example.com/logo-primary.png",
    "secondary": "https://cdn.example.com/logo-secondary.png",
    "favicon": "https://cdn.example.com/favicon.ico"
  },
  "colors": {
    "primary": "#8B5CF6",
    "secondary": "#3B82F6",
    "accent": "#F59E0B"
  },
  "fonts": {
    "heading": "Inter",
    "body": "Inter"
  },
  "customDomain": "aureus.example.com"
}
```

---

## 🔒 Security & Rate Limiting

### Expected Security Features
- ✅ API key authentication (for server-to-server)
- ✅ JWT tokens (for user sessions)
- ✅ Rate limiting (per IP, per user)
- ✅ CORS configuration
- ✅ Request signing (HMAC) for webhooks

### Rate Limits (Expected)
- **Player endpoints:** 100 requests/minute
- **Admin endpoints:** 1000 requests/minute
- **Webhooks:** No limit (but signed)

---

## 📝 Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid wallet address format",
    "details": {
      "field": "walletAddress",
      "reason": "Must be a valid Ethereum address"
    },
    "timestamp": "2024-11-01T20:00:00Z"
  }
}
```

### Error Codes
- `INVALID_REQUEST` - Bad request format
- `UNAUTHORIZED` - Missing/invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error
- `SERVICE_UNAVAILABLE` - Service temporarily down

---

## 🧪 Testing & Sandbox

### Sandbox Environment
- **Base URL:** `https://sandbox.ilottosolution.com/api`
- **Test Credentials:** (To be provided)
- **Test Wallet:** `0x0000000000000000000000000000000000000000`
- **Webhook Testing:** Webhook.site or ngrok

---

## 📞 Integration Support

**For technical questions:**
- API documentation
- Integration guides
- Code examples
- Support tickets

**For business questions:**
- Pricing & revenue share
- SLA & uptime guarantees
- Compliance & licensing
- Custom development

---

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Confidential - NDA Protected**




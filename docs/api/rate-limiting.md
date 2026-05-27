# API Rate Limiting & Abuse Protection

This document outlines the security specifications for throttling incoming API traffic on the Next.js server to prevent abuse, scraping, and brute-force attempts.

---

## ⚡ 1. Throttling Tiers by Endpoint

We categorize API endpoints into three security classes, each with distinct rate limits:

| Tier | Endpoints | Limit / IP | Penalty on Violation |
|:---|:---|:---|:---|
| **Auth Spams** | `/api/auth/sign-in/*`, `/api/auth/sign-up/*` | **5 requests / min** | 15-minute complete IP block |
| **Write CRUD** | `POST /api/links`, `PATCH /api/links/*`, `DELETE /api/links/*` | **30 requests / min** | Throttled with `429 Too Many Requests` |
| **Read Sync** | `GET /api/links`, `GET /api/links/sync` | **60 requests / min** | Throttled with `429 Too Many Requests` |

---

## 🛡️ 2. Throttling Header Standard

When a client makes a request, the backend automatically appends rate-limiting indicators in the response headers:

* **`X-RateLimit-Limit`**: Maximum number of allowed requests in the current window.
* **`X-RateLimit-Remaining`**: Number of remaining requests available before being throttled.
* **`X-RateLimit-Reset`**: Unix timestamp indicating when the current quota window resets.

### Example Throttled Response (`429 Too Many Requests`)
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please slow down and try again in 42 seconds."
  }
}
```

---

## ⚙️ 3. Server Architecture (Token Bucket / Sliding Window)

1. **Sliding Window Log Algorithm:**
   * Utilizes a fast memory cache store on the server.
   * Tracks timestamps of incoming requests per IP/User session in a sliding window.
2. **Database Fallback:**
   * The rate limiter is placed at the very entry point of Next.js routing (via Middleware/Proxy) to drop unauthorized or spammed requests before running expensive database queries.

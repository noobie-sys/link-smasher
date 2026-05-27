# Authentication Rules (Better Auth)

use latest better auth docs for implementation.

## Authentication Strategy

Supported methods:

1. Google OAuth
2. Email + Password

Priority:

- Google OAuth → Preferred login method
- Email/password → Secondary login method
- Anonymous users → Not allowed

Reason:

Google OAuth reduces password handling complexity and decreases credential-related attack surfaces.

---

# Security Architecture

Session Strategy:

- Use secure HttpOnly cookies
- Use SameSite=Lax or SameSite=Strict
- Use Secure=true in production
- Never store authentication tokens in localStorage
- Never store session tokens in sessionStorage
- Session expiration should exist
- Enable session rotation

Password Strategy:

Password requirements:

Minimum:

- 8+ characters
- At least:
  - 1 uppercase
  - 1 lowercase
  - 1 number
  - 1 special character

Recommended:

Passphrases instead of short complex passwords

Example:

Bad:
Password123

Good:
myDogRunsAt5AM!Coffee

Hashing:

- Never store raw passwords
- Never create custom hashing logic
- Use framework-supported secure hashing

---

# Email Verification Rules

Required:

- Email verification mandatory before full account access
- Unverified users get limited access

Allowed:

- Login
- Verification resend

Not allowed:

- Sensitive actions
- Profile modification
- Payment actions

---

# Google OAuth Rules

Required:

- Request minimum permissions only

Allowed:

- email
- profile

Not allowed:

- unnecessary Google scopes
- contacts access
- drive access
- calendar access

---

# Rate Limiting Rules

Required:

Login endpoint:

- 5 attempts per minute per IP

Password reset:

- 3 requests per 15 minutes

Signup:

- 5 requests per hour

Verification resend:

- 3 requests per hour

Locking:

After repeated failures:

- temporary cooldown
- exponential backoff

---

# Session Rules

Required:

- Session expiration
- Session rotation
- Logout invalidates session
- Invalidate old sessions after password change
- Invalidate old sessions after email change

Optional:

- Allow the user to see active sessions
- Allow "logout from all devices."

---

# CSRF Rules

Required:

- CSRF protection enabled
- State validation for OAuth flows
- Origin validation for sensitive actions

---

# Database Rules

Required:

Store:

- user id
- email
- verified status
- provider
- timestamps

Do not store:

- raw password
- OAuth access token
- OAuth refresh token, unless required
- sensitive provider data

---

# Logging Rules

Log:

- login success
- login failures
- password changes
- email changes
- session revocation

Never log:

- passwords
- tokens
- cookies
- secrets
- authorization headers

---

# Environment Rules

Secrets:

Required:

- AUTH_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET

Rules:

- Never hardcode secrets
- Never commit .env files
- Rotate production secrets periodically
- Separate dev and production credentials

---

# What Should Be Done

✓ Validate every input

✓ Use HTTPS everywhere

✓ Restrict OAuth scopes

✓ Add account recovery flow

✓ Add logout from all devices

✓ Add suspicious login monitoring

✓ Expire sessions

✓ Add brute-force protection

✓ Keep dependencies updated

✓ Validate server-side even if frontend validates

---

# What Should Never Be Done

✗ Never store tokens in localStorage

✗ Never expose secrets to frontend

✗ Never trust client input

✗ Never disable email verification

✗ Never create custom auth logic

✗ Never return detailed authentication errors

Bad:

"Email exists"

Better:

"Invalid credentials"

✗ Never use weak passwords

✗ Never allow unlimited login attempts

✗ Never keep sessions alive indefinitely

✗ Never skip the logout session invalidation

# Security Architecture Rules

This document details the mandatory security parameters for sessions, tokens, passwords, and server protections. Under no circumstances should these security configurations be disabled or weakened in code.

---

## 🔒 1. Session Storage & Cookie Strategy

To combat Cross-Site Scripting (XSS) and token theft, session management **MUST** be cookie-based:

- **Do Not**: Store session tokens, secrets, or JWT values in `localStorage` or `sessionStorage` in the client application.
- **Do**: Enable the `HttpOnly` flag on all authentication cookies. This blocks client-side JavaScript access to session tokens, protecting them from XSS extraction.
- **Do**: Set the `Secure` flag to `true` in production configurations. This ensures cookies are transmitted exclusively over encrypted HTTPS connections.
- **Do**: Enforce strict or lax SameSite cookie settings (`SameSite=Lax` or `SameSite=Strict`).
- **Do Not**: Use `SameSite=None` unless explicitly handling multi-domain iframe widgets with verified origins.
- **Do**: Enable session ID rotation upon every privilege change, such as during user login, password resets, or email changes.

---

## 🔑 2. Password Strength & Hashing

If password-based signup is implemented, developers and AI agents **MUST** enforce the following controls:

### Minimum Verification Parameters

- **Length**: At least 8 characters long.
- **Complexity**: Must contain at least:
  - 1 uppercase letter
  - 1 lowercase letter
  - 1 numerical digit
  - 1 special character
- **Recommendations**: Encourage the use of passphrases (longer, multi-word phrases) rather than short, complex passwords, as they are easier for users to remember and harder for bots to crack.

### Hashing Standard

- **Do**: Employ secure cryptographic hashing algorithms supported by the framework (such as scrypt or bcrypt) with high work factors.
- **Do Not**: Store raw or unhashed passwords under any circumstances.
- **Do Not**: Create custom hashing algorithms or hand-crafted encryption schemes.

---

## 🛡️ 3. Rate Limiting & Brute-Force Defense

To mitigate credential stuffing, brute force, and subscription abuse, API endpoints **MUST** include IP-based server rate limiting:

### Enforcement Thresholds

- **Sign-in Endpoints**: Enforce a strict limit of 5 requests per 1 minute per IP address. Exceeded limits must trigger a temporary cooldown and exponential backoff.
- **Sign-up Endpoints**: Enforce a limit of 5 requests per 1 hour per IP address. Exceeded limits must block further sign-up attempts from the source.
- **Forget-Password Endpoints**: Limit requests to 3 per 40 minutes per IP address to block email dispatcher abuse.
- **Verification-Resend Endpoints**: Limit requests to 30 requests per 1 hour per IP address to prevent transactional email spam.

### Lockout Policy

- **Do Not**: Enforce permanent account lockouts upon failure, as this creates a denial-of-service vector where malicious users can block legitimate accounts.
- **Do**: Prefer exponential backoff delay policies (e.g., matching a 5-second wait, moving to a 15-second wait, and scaling to a 60-second wait on repeated failures).

---

## ✉️ 4. Email Verification Guards

For email/password users, verification is mandatory:

- **Do Not**: Permit unverified users to perform write operations, billing actions, or synchronize their Chrome extension.
- **Do**: Restrict unverified users strictly to:
  - Viewing a verification notice or card.
  - Triggering a verification email resend.
  - Logging out.

---

## 🌐 5. Google OAuth Minimal Scope Rule

- **Do**: Limit scopes requested from Google strictly to the absolute minimum required to establish identity: `email` and `profile`.
- **Do Not**: Request broad scopes (such as Drive, Contacts, Calendar, or Gmail permissions) unless explicitly requested and approved by the user. Requesting excessive scopes damages user trust and triggers costly security review processes during extensions store auditing.

---

## 🔗 6. CSRF Mitigation

- **Do**: Ensure Cross-Site Request Forgery (CSRF) validation is active on all POST API handlers.
- **Do**: Retain state validation parameters in OAuth redirect flows to guard against session replay attacks.

---

## 🛡️ 7. Input Validation Rules

- **Do**: Validate all inputs on both the client side and the server side.
- **Do**: Enforce strict schemas using Zod validation.
- **Do**: Perform thorough server-side validation inside Server Actions or API handlers before executing business logic, regardless of any client-side checks.

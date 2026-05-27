# Environment Variables & Audit Logging Rules

This document details the configuration rules for managing environment secrets and enforcing safe, non-PII (Personally Identifiable Information) audit logging across all microservices and platforms in this monorepo.

---

## 🔑 1. Environment Secrets Management

To protect credentials from static extraction, leakages, or source code exposure:

- **Do Not**: Hardcode, embed, or save raw secrets as plaintext strings in source code files, build scripts, or public documentation.
- **Do**: Maintain strictly isolated configuration credentials for Local Development, Staging, and Production environments. Dev configurations must never connect to production instances.
- **Do**: Exclude all environment configuration files (such as `.env`, `.env.local`, and `.env.production`) from source control by explicitly listing them in the project's `.gitignore` file.
- **Do**: Rotate production-grade credentials (such as database URLs and authentication signing secrets) periodically, or immediately if any exposure is suspected.
- **Do**: Provide a clean `.env.example` file listing only the required environment variable names (such as public app URLs, database connection variables, secret signing strings, and Google OAuth client credentials) with dummy placeholder instructions.

---

## 🪵 2. Safe Audit Logging Rules

While logs are vital to debug authentication flows and monitor for security threats, storing credentials or personal data creates massive compliance and security liabilities.

### A. Events That MUST Be Logged

- Successful logins (record event name and the verified user ID).
- Failed logins (record the failure reason and an obfuscated/truncated IP address).
- Password reset requests and triggers.
- Active session revocations and user sign-out requests.
- Profile security modifications (such as password changes or email updates).

### B. Information That MUST NEVER Be Logged

- Raw password strings entered by users.
- Active session cookies, cookie values, or JWT strings.
- HTTP authorization headers containing tokens.
- Social OAuth access tokens or refresh tokens.
- Complete email addresses or phone numbers in plaintext. (Emails should be masked or hashed in telemetry logs, such as masking all but the first two characters of the email handle).

### C. Safe Logger Sanitization Pattern

- **Do**: Implement a centralized sanitization wrapper in the logging utility before outputting any security metadata to log files or standard streams.
- **Do**: Establish a checklist of sensitive keywords to screen for (including "password", "token", "cookie", "auth", "secret", "authorization").
- **Do**: Recursively scan log payload keys; if any key matches a sensitive term, overwrite its value with a standardized redaction string.
- **Do**: Automatically detect email keys and split the local and domain components to obscure the mailbox name before logging.
- **Do**: Append structured tags and timestamps to all security logs to simplify security analysis and ingestion.

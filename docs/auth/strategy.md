# Authentication Strategy & Priority Guidelines

This document governs the high-level authentication entry points and paths. AI agents and developers **MUST** respect the hierarchy and constraints outlined below when adding buttons, forms, or user redirect flows.

---

## 🌟 Authentication Priority Hierarchy

To maximize conversion and minimize friction, prioritize login channels in the following order:

### A. Authentication Access Flow Description

1. **User Arrival**: The user lands on the authentication gateway interface.
2. **First Choice (Preferred)**: Provide prominent Google OAuth. Upon a single-click, users are directed to full dashboard access immediately.
3. **Second Choice (Fallback)**: Provide traditional email and password options.
   - If the user chooses email/password, verify if their email is verified.
   - **If Email is Verified**: Redirect to the full dashboard access.
   - **If Email is Unverified**: Redirect to a secure verification notice and cooling page.
4. **Forbidden Paths**: Guest access, sessionless, or anonymous access is explicitly denied to features consuming database resources or extension synchronization.

### 1. Google OAuth (Primary & Preferred Method)

- **Goal**: Minimize signup drop-off.
- **UX Treatment**: Place a highly prominent, colorful "Continue with Google" button at the absolute top position of any authentication layout.
- **Why**: Google OAuth bypasses password creation fatigue, reduces password reset loops, guarantees verified email addresses, and prevents credential stuffing or brute-force vulnerabilities.

### 2. Email + Password (Secondary Fallback Method)

- **Goal**: Provide an alternative for users without corporate or Google accounts.
- **UX Treatment**: Visually demote email inputs and traditional forms by placing them underneath a subtle text separator (such as "or") relative to the main Google OAuth button.
- **Rule**: Strictly validate password strength on both client and server sides, and enforce mandatory email verification constraints.

### 3. Anonymous Users (Strictly Prohibited)

- **Rule**: Anonymous, guest, or sessionless user access to features that consume database queries or interact with Chrome extension syncing **is NOT allowed**.
- **Why**: Prevents server-side DDOS abuse, database bloat, and orphaned records. Users must complete authentication before saving links or invoking API logic.

---

## 📝 Product Rationale for Reference

When asked to "redesign or streamline auth", developers and AI **MUST** prioritize a **passwordless-first philosophy**.

Passwords are a liability for solo-developers. Every password field requires:

1. Encryption pipelines.
2. Forget password and reset password web views.
3. Transactional mail triggers (which are expensive and frequently marked as spam).
4. Brute-force defense systems.

By funneling users through **Google OAuth**, the developer reduces operational overhead by up to **80%**, while retaining enterprise-grade credential security backed by Google's multi-factor systems.

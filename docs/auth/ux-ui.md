# Premium Auth UI/UX Design Standards

This document establishes the design principles, interaction patterns, and visual standards for the authentication interface in the **Link Smasher** web app.

Independent products succeed by offering **consumer-grade visual polish** that default browser states cannot deliver. AI agents and developers **MUST** use these rules to build visually stunning, highly interactive interfaces.

---

## 🎨 1. Aesthetic System

Authentication views must look modern, clean, and premium:

- **Dark-Mode First Glassmorphism**:
  - **Card Container**: Employ a deep slate background color (slate-900 equivalent) with a soft transparency level (around sixty-five percent opacity).
  - **Backdrop Blur**: Apply a strong backdrop filter blur effect (sixteen pixels or equivalent saturation level) to blend backgrounds smoothly.
  - **Border Treatment**: Add a thin, elegant, single-pixel semi-transparent white border (around eight percent opacity) to define the card boundary.
- **Modern Gradients**: Style priority CTA buttons using rich, dual-tone gradients (such as Indigo blending into Royal Blue, or Deep Purple shifting to Violet). **DO NOT** use default primary colors like plain red or plain blue.
- **Typography**: Utilize modern, high-legibility geometric sans-serif typefaces (such as _Inter_, _Outfit_, or _Cabinet Grotesk_).
- **Elevation**: Elevate interactive panels using soft, layered, multi-tier drop-shadows rather than hard solid borders.

---

## ⚡ 2. Loading & Submission States

To prevent double-submissions, API spam, and user confusion during verification processes, forms **MUST** enforce the following visual states:

### Step-by-Step Submission Behavior

1. **Instant Button Disabling**: The moment the user clicks the submit action, immediately disable the submit button to block double clicks.
2. **Input Field Locking**: Disable all input fields (email, password, etc.) while submission is in progress. This prevents users from altering credentials mid-flight.
3. **Tactile Button feedback**: Scale down the active button slightly using a smooth, spring-like transition (e.g., scale down to ninety-eight percent) to provide responsive mechanical feedback.
4. **Active Indicator Replacement**: Replace the static CTA button text with a high-framerate, smooth CSS-driven loading spinner accompanied by a clear notice (such as "Authenticating...").
5. **Color Transitions**: Transition the button's background to a muted, dark slate tone and fade the text slightly to indicate a busy status.

---

## 🚦 3. Reactive Field Validation

- **No Alert Prompts**: Never interrupt the user with browser alert popups or modal blocking alerts. Use inline, non-shifting text notices.
- **Modern CSS Validation Selectors**: Use modern browser user-valid states to apply styling _only_ after the user has finished typing and exited the active field focus (blur state).
- **Validation Outline Timing**: Avoid displaying angry red outlines or warnings while the user is still actively inputting their password or email. Apply gentle, supportive green border glows once fields are successfully validated on blur.
- **Dynamic Password Checklists**: Show a micro-checklist beneath password inputs as the user types, visually checking off complexity criteria (such as eight-plus characters, uppercase, and numbers) in real-time with green or gray badge indicators.

---

## 🔒 4. Account Enumeration Defense (Generic Errors)

To shield the user database against verification bots testing for active emails:

- **Rule**: Auth API endpoints and UI screens **MUST NOT** state explicitly whether a targeted email is already registered during sign-in, sign-up, or password recovery flows.
- **Prohibited Messages**:
  - _"Email address already exists in the system."_
  - _"Password is incorrect for this user."_
  - _"No account registered under that email address."_
- **Mandatory Messages**:
  - _"Invalid credentials. Please double-check your email and password."_ (Unified login fail response).
  - _"If that email exists in our system, a password-recovery link has been sent to it."_ (Unified recovery response).

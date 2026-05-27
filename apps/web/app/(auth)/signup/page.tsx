"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);

  // Real-time password strength checklist per docs/auth/ux-ui.md Section 3
  const passwordChecks = useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
  }, [password]);

  const isPasswordStrong = Object.values(passwordChecks).every(Boolean);

  async function handleGoogleSignIn() {
    setIsGooglePending(true);
    setError(null);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsGooglePending(false);
    }
  }

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!isPasswordStrong) {
      setError("Please meet all password requirements before continuing.");
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      const { error: authError } = await signUp.email({
        email,
        password,
        name,
        callbackURL: "/dashboard",
      });

      if (authError) {
        // Generic error message per docs/auth/ux-ui.md - Account Enumeration Defense
        setError("Unable to create account. Please check your details and try again.");
        setIsPending(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsPending(false);
    }
  }

  const isLoading = isPending || isGooglePending;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-white">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Get started with Link Smasher in seconds
        </p>
      </div>

      {/* Google OAuth Button - Priority 1 per docs/auth/strategy.md */}
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="group flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 font-medium text-white transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.08] hover:shadow-[0_0_20px_rgba(255,255,255,0.06)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGooglePending ? (
          <LoadingSpinner />
        ) : (
          <>
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </>
        )}
      </button>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/[0.08]" />
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
          or
        </span>
        <div className="h-px flex-1 bg-white/[0.08]" />
      </div>

      {/* Email/Password/Name Form */}
      <form onSubmit={handleEmailSignUp} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="signup-name"
            className="text-xs font-medium uppercase tracking-wider text-slate-400"
          >
            Full Name
          </label>
          <input
            id="signup-name"
            type="text"
            name="name"
            required
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-brand-indigo/50 focus:ring-2 focus:ring-brand-indigo/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="signup-email"
            className="text-xs font-medium uppercase tracking-wider text-slate-400"
          >
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            name="email"
            required
            placeholder="name@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-brand-indigo/50 focus:ring-2 focus:ring-brand-indigo/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="signup-password"
            className="text-xs font-medium uppercase tracking-wider text-slate-400"
          >
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            name="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-brand-indigo/50 focus:ring-2 focus:ring-brand-indigo/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Password strength checklist per docs/auth/ux-ui.md Section 3 */}
        {password.length > 0 && (
          <div className="flex flex-col gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
            <PasswordCheck passed={passwordChecks.length} label="At least 8 characters" />
            <PasswordCheck passed={passwordChecks.uppercase} label="One uppercase letter" />
            <PasswordCheck passed={passwordChecks.lowercase} label="One lowercase letter" />
            <PasswordCheck passed={passwordChecks.number} label="One number" />
            <PasswordCheck passed={passwordChecks.special} label="One special character" />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full rounded-xl px-4 py-3 font-medium transition-all duration-300 ${
            isPending
              ? "scale-[0.98] cursor-not-allowed bg-slate-800 text-slate-500"
              : "bg-gradient-to-r from-brand-indigo to-brand-violet text-white shadow-lg shadow-brand-indigo/25 hover:shadow-[0_0_24px_rgba(99,102,241,0.35)] hover:scale-[1.01] active:scale-[0.99]"
          }`}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner />
              Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {/* Sign in link */}
      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-indigo hover:text-brand-violet transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

function PasswordCheck({
  passed,
  label,
}: {
  passed: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-4 w-4 items-center justify-center rounded-full transition-colors duration-200 ${
          passed
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-white/[0.06] text-slate-600"
        }`}
      >
        {passed ? (
          <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <div className="h-1.5 w-1.5 rounded-full bg-current" />
        )}
      </div>
      <span
        className={`text-xs transition-colors duration-200 ${
          passed ? "text-emerald-400" : "text-slate-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin text-brand-indigo"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

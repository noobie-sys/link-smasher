"use client";

import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch (error) {
      console.error("Failed to sign out:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-brand-dark px-4">
      {/* Premium ambient backdrop orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-indigo/10 blur-[130px] animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/3 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-brand-magenta/8 blur-[110px] animate-pulse-slow [animation-delay:2.5s]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-30" />

      {/* Main glassmorphism card container */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.08] bg-[rgba(13,9,32,0.6)] p-8 text-center shadow-2xl backdrop-blur-xl">
        {/* Brand header */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-indigo to-brand-magenta shadow-xl shadow-brand-indigo/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-white animate-pulse"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
        </div>

        {/* Requirements: Just one H1 tag */}
        <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Dashboard
        </h1>

        {isPending ? (
          <div className="my-8 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-brand-magenta" />
          </div>
        ) : session?.user ? (
          <div className="my-6 space-y-2">
            <p className="text-slate-400">
              Welcome back,{" "}
              <span className="font-medium text-white">
                {session.user.name || session.user.email}
              </span>
            </p>
            <p className="text-xs text-slate-500">{session.user.email}</p>
          </div>
        ) : (
          <p className="my-6 text-slate-400">Loading session details...</p>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:bg-white/[0.08] hover:border-white/[0.15] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoggingOut ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

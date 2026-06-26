"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ─── Avatar Stack (mock social proof) ──────────────────────────────────────
const AVATARS = [
  "https://i.pravatar.cc/40?img=1",
  "https://i.pravatar.cc/40?img=2",
  "https://i.pravatar.cc/40?img=3",
  "https://i.pravatar.cc/40?img=4",
  "https://i.pravatar.cc/40?img=5",
];

// ─── Background SVG Blobs ───────────────────────────────────────────────────
function BackgroundShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Top-left flowing shape */}
      <svg
        className="absolute -top-32 -left-40 w-[700px] h-[700px] opacity-60"
        viewBox="0 0 700 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="300" cy="300" rx="300" ry="280" fill="url(#grad-tl)" />
        <defs>
          <radialGradient id="grad-tl" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7950F7" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#7950F7" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Bottom-right flowing shape */}
      <svg
        className="absolute -bottom-40 -right-40 w-[700px] h-[700px] opacity-50"
        viewBox="0 0 700 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="380" cy="380" rx="320" ry="290" fill="url(#grad-br)" />
        <defs>
          <radialGradient id="grad-br" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#7950F7" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Flowing wave lines — left */}
      <svg
        className="absolute top-0 left-0 w-full h-full opacity-[0.07]"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {[...Array(8)].map((_, i) => (
          <path
            key={i}
            d={`M${-200 + i * 30} ${100 + i * 60}C${200 + i * 20} ${
              -50 + i * 40
            } ${500 + i * 15} ${400 + i * 30} ${800 + i * 10} ${
              300 + i * 50
            }S${1200 + i * 8} ${700 + i * 20} ${1600 + i * 5} ${400 + i * 30}`}
            stroke="#7950F7"
            strokeWidth={1.5}
            fill="none"
          />
        ))}
      </svg>

      {/* Flowing wave lines — right side */}
      <svg
        className="absolute top-0 right-0 w-1/2 h-full opacity-[0.06]"
        viewBox="0 0 720 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {[...Array(6)].map((_, i) => (
          <path
            key={i}
            d={`M${700 - i * 25} ${-50 + i * 80}C${500 - i * 20} ${
              200 + i * 30
            } ${600 - i * 15} ${500 + i * 20} ${400 - i * 10} ${
              700 + i * 15
            }S${300 - i * 8} ${900 + i * 10} ${100 - i * 5} ${600 + i * 20}`}
            stroke="#7950F7"
            strokeWidth={1.5}
            fill="none"
          />
        ))}
      </svg>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-white overflow-hidden flex flex-col items-center justify-center">
      <BackgroundShapes />

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-2xl mx-auto py-16">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <Image
            src="/logo.png"
            alt="LNKR Logo"
            width={64}
            height={64}
            className="rounded-2xl"
            priority
          />
          <span className="text-[#0a0a0a] font-bold text-2xl tracking-tight font-display">
            LNKR
          </span>
        </div>

        {/* Coming Soon badge */}
        <div className="mb-5">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0a0a0a] text-white text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7950F7] animate-pulse" />
            Coming Soon
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-bold text-[#0a0a0a] tracking-tight leading-tight mb-4 font-display">
          Get your early access today!
        </h1>

        {/* Subtext */}
        <p className="text-[#6b6b6b] text-base sm:text-lg mb-10 max-w-md leading-relaxed">
          Be first to experience LNKR. Don&apos;t miss out — join the line for
          updates and early access.
        </p>

        {/* Waitlist Form */}
        <div className="w-full max-w-md mb-8">
          <WaitlistForm />
        </div>

        {/* Social proof */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-[#6b6b6b]">
            Join with{" "}
            <span className="font-semibold text-[#0a0a0a]">15,725+</span>{" "}
            others on waitlist
          </p>
          <div className="flex items-center -space-x-2">
            {AVATARS.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`User ${i + 1}`}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Waitlist Form ──────────────────────────────────────────────────────────
function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong.");
      setStatus("success");
      setMessage(data.message || "You're on the list! We'll be in touch.");
      setEmail("");
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex items-center w-full rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_2px_24px_rgba(121,80,247,0.08)] overflow-hidden pr-1.5 pl-4 py-1.5 gap-2"
      >
        {/* Mail icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={status === "loading" || status === "success"}
          className="flex-1 bg-transparent text-sm text-[#0a0a0a] placeholder-[#9ca3af] focus:outline-none disabled:opacity-50 min-w-0"
        />

        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className={cn(
            "shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200",
            "bg-[#7950F7] hover:bg-[#6a3de8] active:scale-95",
            "shadow-[0_2px_12px_rgba(121,80,247,0.35)] hover:shadow-[0_4px_20px_rgba(121,80,247,0.5)]",
            "disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
          )}
        >
          {status === "loading" ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Joining...
            </span>
          ) : status === "success" ? (
            "Joined! 🎉"
          ) : (
            "Join Now"
          )}
        </button>
      </form>

      {/* Bottom gradient line on form */}
      <div className="h-[2px] w-full rounded-b-2xl bg-gradient-to-r from-transparent via-[#7950F7]/40 to-transparent mt-0" />

      {message && (
        <p
          className={cn(
            "mt-3 text-sm text-center font-medium animate-in fade-in slide-in-from-top-1 duration-300",
            status === "success" ? "text-[#7950F7]" : "text-rose-500"
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}

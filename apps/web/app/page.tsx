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

// ─── Background Shapes ───────────────────────────────────────────────────────
function BackgroundShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <Image
        src="/PUumUbREZYBmHp59xpu05KuD3g.jpg"
        alt="Background Pattern"
        fill
        className="object-cover object-center"
        priority
      />
    </div>
  );
}

// ─── Bento Visual: Keyboard Save ────────────────────────────────────────────
function KeyboardVisual() {
  return (
    <div className="flex-1 flex items-end justify-center pt-4 pb-2 overflow-hidden">
      <div className="relative flex flex-col items-center gap-3">
        {/* Browser bar mockup */}
        <div className="w-64 bg-[#f0f0f7] rounded-xl px-4 py-2.5 flex items-center gap-2 border border-[#e5e5f0]">
          <div className="w-2 h-2 rounded-full bg-[#7950F7]/30" />
          <div className="flex-1 h-2 rounded bg-[#ddddf5]" />
          <div className="w-2 h-2 rounded-full bg-[#7950F7]/20" />
        </div>

        {/* Toast notification */}
        <div className="absolute -right-8 top-0 bg-white rounded-2xl shadow-[0_4px_24px_rgba(121,80,247,0.18)] border border-[#7950F7]/15 px-3 py-2.5 flex items-center gap-2.5 whitespace-nowrap">
          <div className="w-6 h-6 rounded-lg bg-[#7950F7]/10 flex items-center justify-center shrink-0">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7950F7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] text-[#6b6b6b] leading-none mb-0.5">
              Link saved!
            </p>
            <p className="text-[11px] font-bold text-[#7950F7] font-mono">
              lnkr.app/tf-paper
            </p>
          </div>
        </div>

        {/* Keyboard keys */}
        <div className="flex items-center gap-2 mt-1">
          <div className="bg-white border border-[#e5e5e5] rounded-lg px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex flex-col items-center gap-0.5">
            <span className="text-[10px] font-bold text-[#0a0a0a] leading-none">
              Alt
            </span>
          </div>
          <span className="text-[#9ca3af] text-sm font-light">+</span>
          <div className="bg-[#7950F7] border border-[#6a3de8] rounded-lg px-4 py-2 shadow-[0_2px_12px_rgba(121,80,247,0.4)] flex flex-col items-center gap-0.5">
            <span className="text-[14px] font-bold text-white leading-none">
              S
            </span>
          </div>
        </div>

        {/* Pulse ring */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-[#7950F7]/6 animate-ping" />
      </div>
    </div>
  );
}

// ─── Bento Visual: Analytics bars ───────────────────────────────────────────
function AnalyticsVisual() {
  const bars = [40, 65, 45, 80, 55, 90, 70];
  return (
    <div className="flex items-end gap-2 h-20 px-2 pt-4">
      {bars.map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md transition-all duration-700"
            style={{
              height: `${h}%`,
              background:
                i === 5
                  ? "linear-gradient(to top, #7950F7, #a78bfa)"
                  : i === 3
                    ? "linear-gradient(to top, #7950F7cc, #a78bfaaa)"
                    : "#f0eeff",
            }}
          />
        </div>
      ))}
      {/* Badge */}
      <div className="absolute top-4 right-4 bg-[#7950F7] text-white text-[10px] font-bold px-2 py-1 rounded-full">
        +2K
      </div>
    </div>
  );
}

// ─── Bento Visual: Domain filter ────────────────────────────────────────────
function DomainVisual() {
  const dots = [
    { cx: 50, cy: 50, r: 38, opacity: 0.12 },
    { cx: 50, cy: 50, r: 26, opacity: 0.2 },
    { cx: 50, cy: 50, r: 14, opacity: 1 },
  ];
  return (
    <div className="flex items-center justify-center h-28 relative">
      <svg viewBox="0 0 100 100" className="w-24 h-24">
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill="#7950F7"
            fillOpacity={d.opacity}
          />
        ))}
        <text
          x="50"
          y="55"
          textAnchor="middle"
          fontSize="8"
          fontWeight="700"
          fill="white"
        >
          lnkr
        </text>
      </svg>

      {/* Floating site chips */}
      <div className="absolute top-2 left-0 bg-white border border-[#e5e5e5] rounded-full px-2 py-1 text-[10px] font-semibold text-[#0a0a0a] shadow-sm flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#7950F7]" />
        github.com
      </div>
      <div className="absolute bottom-2 right-0 bg-white border border-[#e5e5e5] rounded-full px-2 py-1 text-[10px] font-semibold text-[#0a0a0a] shadow-sm flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa]" />
        arxiv.org
      </div>
    </div>
  );
}

// ─── Bento Visual: Cross-device sync ────────────────────────────────────────
function SyncVisual() {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      {/* Central hub */}
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-[#7950F7] shadow-[0_4px_24px_rgba(121,80,247,0.4)] flex items-center justify-center z-10 relative">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          {/* Orbiting dots */}
          <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white border-2 border-[#7950F7] shadow-sm flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#7950F7]" />
          </div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-white border-2 border-[#a78bfa] shadow-sm flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#a78bfa]" />
          </div>
        </div>
      </div>

      {/* Device icons */}
      <div className="flex flex-col gap-3">
        {/* Browser */}
        <div className="w-10 h-10 rounded-xl bg-[#f0eeff] border border-[#7950F7]/20 flex items-center justify-center">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7950F7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
        {/* Mobile */}
        <div className="w-10 h-10 rounded-xl bg-[#f0eeff] border border-[#7950F7]/20 flex items-center justify-center">
          <svg
            width="14"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7950F7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </div>
      </div>

      {/* Connecting lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        viewBox="0 0 200 100"
      >
        <line
          x1="90"
          y1="50"
          x2="140"
          y2="30"
          stroke="#7950F7"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
        <line
          x1="90"
          y1="50"
          x2="140"
          y2="70"
          stroke="#7950F7"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
      </svg>
    </div>
  );
}

// ─── Bento Section ───────────────────────────────────────────────────────────
function BentoSection() {
  return (
    <section className="w-full bg-white py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#7950F7]/25 bg-[#7950F7]/5 text-xs font-semibold text-[#7950F7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7950F7] animate-pulse" />
            LNKR Features
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0a0a0a] tracking-tight leading-tight font-display">
            Smooth Functionality,
            <br />
            <span className="text-[#7950F7]">Effortless</span> Experience
          </h2>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[220px]">
          {/* Card 1 — Large left (spans 2 cols, 1 row) */}
          <div className="md:col-span-2 bg-[#fafafa] border border-[#ebebeb] rounded-3xl p-6 flex flex-col overflow-hidden relative group hover:border-[#7950F7]/30 hover:shadow-[0_8px_32px_rgba(121,80,247,0.08)] transition-all duration-300">
            <div>
              <h3 className="text-lg font-bold text-[#0a0a0a] mb-1">
                <span className="font-extrabold">Instant</span>{" "}
                <span className="font-light text-[#6b6b6b]">Alt+S Save</span>
              </h3>
              <p className="text-sm text-[#6b6b6b] leading-relaxed max-w-xs">
                One keystroke captures the active tab — URL, title, domain, and
                timestamp — without switching context.
              </p>
            </div>
            <KeyboardVisual />
          </div>

          {/* Card 2 — Small right top (1 col, 1 row) */}
          <div className="bg-[#fafafa] border border-[#ebebeb] rounded-3xl p-6 flex flex-col overflow-hidden relative group hover:border-[#7950F7]/30 hover:shadow-[0_8px_32px_rgba(121,80,247,0.08)] transition-all duration-300">
            <div className="absolute top-4 right-4">
              <div className="bg-[#7950F7] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                +2K
              </div>
            </div>
            <h3 className="text-base font-bold text-[#0a0a0a] mb-1 mt-6">
              <span className="font-extrabold">Smart</span>{" "}
              <span className="font-light text-[#6b6b6b]">Analytics</span>
            </h3>
            <p className="text-xs text-[#6b6b6b] leading-relaxed">
              Gain insights into your link activity and find patterns fast.
            </p>
            <div className="flex-1 flex items-end relative">
              <AnalyticsVisual />
            </div>
          </div>

          {/* Card 3 — Small bottom left (1 col, 1 row) */}
          <div className="bg-[#fafafa] border border-[#ebebeb] rounded-3xl p-6 flex flex-col overflow-hidden relative group hover:border-[#7950F7]/30 hover:shadow-[0_8px_32px_rgba(121,80,247,0.08)] transition-all duration-300">
            <DomainVisual />
            <div className="mt-auto">
              <h3 className="text-base font-bold text-[#0a0a0a] mb-0.5">
                <span className="font-extrabold">Domain</span>{" "}
                <span className="font-light text-[#6b6b6b]">Isolation</span>
              </h3>
              <p className="text-xs text-[#6b6b6b] leading-relaxed">
                The HUD auto-filters to only show links from the site
                you&apos;re currently on.
              </p>
            </div>
          </div>

          {/* Card 4 — Large bottom right (2 cols, 1 row) */}
          <div className="md:col-span-2 bg-[#fafafa] border border-[#ebebeb] rounded-3xl p-6 flex flex-col overflow-hidden relative group hover:border-[#7950F7]/30 hover:shadow-[0_8px_32px_rgba(121,80,247,0.08)] transition-all duration-300">
            <h3 className="text-lg font-bold text-[#0a0a0a] mb-1">
              <span className="font-extrabold">Cross-Device</span>{" "}
              <span className="font-light text-[#6b6b6b]">Sync</span>
            </h3>
            <p className="text-sm text-[#6b6b6b] leading-relaxed max-w-sm">
              Every save is pushed to your secure vault in real time. Access
              your links from the extension or web dashboard, anywhere.
            </p>
            <div className="flex-1 flex items-center justify-center relative">
              <SyncVisual />

              {/* Extra decorative pills */}
              <div className="absolute bottom-2 left-4 flex gap-2">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#7950F7]/8 text-[#7950F7] border border-[#7950F7]/15 font-medium">
                  Supabase
                </span>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#7950F7]/8 text-[#7950F7] border border-[#7950F7]/15 font-medium">
                  Real-time
                </span>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#7950F7]/8 text-[#7950F7] border border-[#7950F7]/15 font-medium">
                  End-to-end
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* ── Hero / Waitlist ── */}
      <div className="relative min-h-screen flex flex-col items-center justify-center">
        <BackgroundShapes />
        <main className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-2xl mx-auto py-16">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <Image
              src="/lnkr.png"
              alt="LyncFlow Logo"
              width={64}
              height={64}
              className="rounded-2xl"
              priority
            />
            <span className="text-[#7950F7] font-bold text-2xl tracking-tight font-display">
              LyncFlow
            </span>
          </div>

          {/* Coming Soon badge */}
          <div className="mb-5">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7950F7] text-white text-xs font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
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

      {/* ── Bento Features Section ── */}
      <BentoSection />
    </div>
  );
}

// ─── Waitlist Form ──────────────────────────────────────────────────────────
function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
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
      if (!response.ok)
        throw new Error(data.message || "Something went wrong.");
      setStatus("success");
      setMessage(data.message || "You're on the list! We'll be in touch.");
      setEmail("");
    } catch (err: unknown) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex items-center w-full rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_2px_24px_rgba(121,80,247,0.08)] overflow-hidden pr-1.5 pl-4 py-1.5 gap-2"
      >
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
            "disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
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

      <div className="h-[2px] w-full rounded-b-2xl bg-gradient-to-r from-transparent via-[#7950F7]/40 to-transparent mt-0" />

      {message && (
        <p
          className={cn(
            "mt-3 text-sm text-center font-medium animate-in fade-in slide-in-from-top-1 duration-300",
            status === "success" ? "text-[#7950F7]" : "text-rose-500",
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}

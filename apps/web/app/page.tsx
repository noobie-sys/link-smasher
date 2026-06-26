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
        sizes="100vw"
        className="object-cover object-center"
        priority
      />
    </div>
  );
}

// ─── Bento Visual: Folders / Categories List ──────────────────────────────
function FoldersVisual() {
  const folders = [
    { name: "Development", count: 2, color: "#7950F7" },
    { name: "Social Media", count: 2, color: "#d946ef" },
    { name: "Productivity", count: 1, color: "#06b6d4" },
    { name: "Entertainment", count: 0, color: "#f97316" },
    { name: "Custom Categories", count: 0, color: "#6b7280" },
  ];

  return (
    <div className="flex-1 p-4 flex flex-col gap-2 mt-2 justify-center w-full">
      {folders.map((folder, i) => (
        <div
          key={i}
          className="bg-white border border-[#ebebeb] rounded-xl px-3 py-2 flex items-center justify-between shadow-sm hover:border-[#7950F7]/30 transition-all duration-200"
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: folder.color }}
            />
            <span className="text-xs font-semibold text-[#0a0a0a]">
              {folder.name}
            </span>
          </div>
          <span className="text-[10px] text-[#6b6b6b] font-medium bg-[#f5f5f7] px-2 py-0.5 rounded-full">
            {folder.count} link{folder.count !== 1 ? "s" : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Bento Visual: Domain filter ────────────────────────────────────────────
function DomainVisual() {
  const dots = [
    { cx: 100, cy: 100, r: 96, opacity: 0.02 },
    { cx: 100, cy: 100, r: 80, opacity: 0.04 },
    { cx: 100, cy: 100, r: 64, opacity: 0.07 },
    { cx: 100, cy: 100, r: 48, opacity: 0.12 },
    { cx: 100, cy: 100, r: 32, opacity: 0.22 },
    { cx: 100, cy: 100, r: 18, opacity: 1 },
  ];
  return (
    <div className="flex items-center justify-center h-full relative w-full overflow-hidden select-none">
      {/* Outer concentric pulsing indicator lines */}
      <div className="absolute w-64 h-64 rounded-full border border-[#7950F7]/10 animate-ping duration-1000 opacity-20 pointer-events-none" />

      <svg
        viewBox="0 0 200 200"
        className="w-[320px] h-[320px] overflow-visible drop-shadow-[0_4px_20px_rgba(121,80,247,0.2)] relative z-0"
      >
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill="#7950F7"
            fillOpacity={d.opacity}
            className={i < 5 ? "animate-pulse" : ""}
            style={
              i < 5
                ? { animationDelay: `${i * 200}ms`, animationDuration: "3s" }
                : undefined
            }
          />
        ))}
        <text
          x="100"
          y="104"
          textAnchor="middle"
          fontSize="11"
          fontWeight="800"
          fill="white"
          fontFamily="monospace"
          className="tracking-tight"
        >
          lnkr
        </text>
      </svg>

      {/* Floating site chips - positioned in 4 quadrants */}
      <div className="absolute top-12 left-2 bg-white border border-[#ebebeb] rounded-full px-3 py-1.5 text-[9px] font-semibold text-[#0a0a0a] shadow-sm flex items-center gap-1.5 hover:scale-105 hover:border-[#7950F7]/30 transition-all duration-200 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#7950F7]" />
        github.com
      </div>
      <div className="absolute top-15 right-2 bg-white border border-[#ebebeb] rounded-full px-3 py-1.5 text-[9px] font-semibold text-[#0a0a0a] shadow-sm flex items-center gap-1.5 hover:scale-105 hover:border-[#7950F7]/30 transition-all duration-200 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#d946ef]" />
        claude.ai
      </div>
      <div className="absolute bottom-10 right-5 bg-white border border-[#ebebeb] rounded-full px-3 py-1.5 text-[9px] font-semibold text-[#0a0a0a] shadow-sm flex items-center gap-1.5 hover:scale-105 hover:border-[#7950F7]/30 transition-all duration-200 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" />
        arxiv.org
      </div>
      <div className="absolute bottom-4 left-2 bg-white border border-[#ebebeb] rounded-full px-3 py-1.5 text-[9px] font-semibold text-[#0a0a0a] shadow-sm flex items-center gap-1.5 hover:scale-105 hover:border-[#7950F7]/30 transition-all duration-200 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />
        reddit.com
      </div>
    </div>
  );
}

// ─── Bento Visual: Dashboard Mockup ──────────────────────────────────────────
function DashboardVisual() {
  const links = [
    {
      title: "Instagram",
      url: "instagram.com",
      date: "6/20/2026",
      color: "#d946ef",
    },
    {
      title: "Any gud movies or web series suggestions pls : r/delhi",
      url: "reddit.com",
      date: "6/16/2026",
      color: "#f97316",
    },
    {
      title: "How jobcopilot works - Claude",
      url: "claude.ai",
      date: "6/16/2026",
      color: "#a78bfa",
    },
  ];

  return (
    <div className="flex-1 flex flex-col gap-2 w-full mt-2 select-none">
      {links.map((link, idx) => (
        <div
          key={idx}
          className="bg-white border border-[#ebebeb] rounded-xl p-2.5 shadow-sm hover:border-[#7950F7]/30 transition-all duration-200 flex flex-col gap-1 w-full text-left"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-[#7950F7] bg-[#7950F7]/5 px-2 py-0.5 rounded-md">
              {link.url}
            </span>
            <span className="text-[9px] text-[#9ca3af] font-mono">
              {link.date}
            </span>
          </div>
          <p className="text-[10px] font-extrabold text-[#0a0a0a] truncate w-[90%]">
            {link.title}
          </p>
          <div className="flex items-center justify-between text-[9px] text-[#9ca3af] mt-0.5 border-t border-[#f5f5f7] pt-1">
            <span className="font-mono">
              ID:{" "}
              {idx === 0
                ? "7d5df8d..."
                : idx === 1
                  ? "fd74256..."
                  : "41c7f40..."}
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: link.color }}
              />
              <svg
                width="8"
                height="8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              </svg>
            </div>
          </div>
        </div>
      ))}
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
            Product Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0a0a0a] tracking-tight leading-tight font-display">
            A Powerful Workflow,
            <br />
            <span className="text-[#7950F7]">Beautifully</span> Structured
          </h2>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 — Detailed Activity & Source Analytics (spans 2 cols on desktop) */}
          <div className="md:col-span-2 bg-[#fafafa] border border-[#ebebeb] rounded-3xl flex flex-col justify-between overflow-hidden relative group  min-h-[460px]">
            <div className="mb-4 p-6 md:p-8 pb-0 md:pb-0 ">
              <span className="text-[10px] text-[#7950F7] uppercase font-bold tracking-wider mb-1 block">
                Curation Insights
              </span>
              <h3 className="text-xl font-bold text-[#0a0a0a] font-display">
                Detailed Activity & Source Analytics
              </h3>
              <p className="text-sm text-[#6b6b6b] max-w-xl mt-1">
                Monitor your collection habits. Review saving trends, track
                weekly resource collection metrics, and see which platforms you
                reference most.
              </p>
            </div>

            {/* Floating dashboard mockup sliding container */}
            <div className="relative w-full flex-1 rounded-t-2xl overflow-hidden min-h-[300px]">
              <Image
                src="/analytics.png"
                alt="Detailed Activity and Source Analytics Dashboard"
                fill
                sizes="(max-width: 768px) 100vw, 680px"
                className="object-cover  "
                priority
              />
            </div>
          </div>

          {/* Card 2 — Top Sources & Metrics (spans 1 col on desktop) */}
          <div className="md:col-span-1 bg-[#fafafa] border border-[#ebebeb] rounded-3xl  flex flex-col justify-between overflow-hidden relative group hover:border-[#7950F7]/30 hover:shadow-[0_8px_32px_rgba(121,80,247,0.08)] transition-all duration-300 min-h-[460px]">
            <div className="mb-4 p-4 md:p-6 pb-0 md:pb-0">
              <span className="text-[10px] text-[#7950F7] uppercase font-bold tracking-wider mb-1 block">
                Source Metrics
              </span>
              <h3 className="text-xl font-bold text-[#0a0a0a] font-display">
                Top Sources & Metrics
              </h3>
              <p className="text-sm text-[#6b6b6b] mt-1">
                View which platforms you save from most and track overall saving
                benchmarks.
              </p>
            </div>

            {/* Floating stats breakdown sliding container */}
            <div className="relative w-full flex-1 rounded-t-2xl overflow-hidden min-h-[280px]">
              <Image
                src="/stats.jpeg"
                alt="Stats Overview Breakdown"
                fill
                sizes="(max-width: 768px) 100vw, 340px"
                className="object-cover rounded-t-2xl object-left"
                priority
              />
            </div>
          </div>

          {/* Card 3 — Organized Vaults (spans 1 col) */}
          <div className="bg-[#fafafa] border border-[#ebebeb] rounded-3xl  flex flex-col justify-between overflow-hidden relative group hover:border-[#7950F7]/30 hover:shadow-[0_8px_32px_rgba(121,80,247,0.08)] transition-all duration-300 min-h-[340px] md:h-[410px]">
            <div className="p-6 pb-0">
              <span className="text-[10px] text-[#7950F7] uppercase font-bold tracking-wider mb-1 block">
                Custom Categories
              </span>
              <h3 className="text-lg font-bold text-[#0a0a0a] mb-1 font-display">
                Organized Vaults
              </h3>
              <p className="text-xs text-[#6b6b6b] leading-relaxed">
                Sort your links into dedicated folders with custom theme colors
                to keep your research structured.
              </p>
            </div>
            <FoldersVisual />
          </div>

          {/* Card 4 — Smart Filtering (spans 1 col) */}
          <div className="bg-[#fafafa] border border-[#ebebeb] rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative group hover:border-[#7950F7]/30 hover:shadow-[0_8px_32px_rgba(121,80,247,0.08)] transition-all duration-300 min-h-[340px] md:h-[410px]">
            <div>
              <span className="text-[10px] text-[#7950F7] uppercase font-bold tracking-wider mb-1 block">
                Context-Aware Views
              </span>
              <h3 className="text-lg font-bold text-[#0a0a0a] mb-1 font-display">
                Smart Filtering
              </h3>
              <p className="text-xs text-[#6b6b6b] leading-relaxed">
                Automatically filters your vault to show links matching the
                website you are currently browsing.
              </p>
            </div>
            <DomainVisual />
          </div>

          {/* Card 5 — Link Vault Dashboard (spans 1 col) */}
          <div className="bg-[#fafafa] border border-[#ebebeb] rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative group hover:border-[#7950F7]/30 hover:shadow-[0_8px_32px_rgba(121,80,247,0.08)] transition-all duration-300 min-h-[340px] md:h-[410px]">
            <div>
              <span className="text-[10px] text-[#7950F7] uppercase font-bold tracking-wider mb-1 block">
                Vault Repository
              </span>
              <h3 className="text-lg font-bold text-[#0a0a0a] mb-1 font-display">
                Link Vault
              </h3>
              <p className="text-xs text-[#6b6b6b] leading-relaxed">
                Your secure repository for everything you save. Easily browse,
                search, and manage your collection from a clean web dashboard.
              </p>
            </div>

            <div className="my-2 w-full">
              <DashboardVisual />
            </div>

            <div className="flex gap-2 flex-wrap mt-2">
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#7950F7]/8 text-[#7950F7] border border-[#7950F7]/15 font-medium">
                Searchable
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#7950F7]/8 text-[#7950F7] border border-[#7950F7]/15 font-medium">
                Vault
              </span>
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
            Streamline how you save and organize the web.
          </h1>

          {/* Subtext */}
          <p className="text-[#6b6b6b] text-base sm:text-lg mb-10 max-w-xl leading-relaxed">
            LyncFlow helps developers, researchers, and creators save web
            resources instantly, group them into theme-colored vaults, and track
            collection trends over time.
          </p>

          {/* Waitlist Form */}
          <div className="w-full max-w-md mb-8">
            <WaitlistForm />
          </div>

          {/* Social proof */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-[#6b6b6b]">
              Join with{" "}
              <span className="font-semibold text-[#0a0a0a]">15+</span> others
              on waitlist
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
      <span className="text-xs text-[#7950F7] font-[600] text-shadow-2xs">
        Join the waitlist for updates and early access
      </span>

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
